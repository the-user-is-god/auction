import { Prisma, Session } from "@generated/prisma/client.js";
import { prisma } from "@infrastructure/db.js";
import { BaseRepository } from "@infrastructure/repositories/base.repository.js";
import { SessionEntity } from "../domain/session.entity.js";
import { SessionMapper } from "../mappers/session.mapper.js";

export class SessionRepository extends BaseRepository<
  Session,
  Prisma.SessionUncheckedCreateInput,
  Prisma.SessionUpdateInput,
  SessionEntity
> {
  constructor() {
    super(prisma.session, SessionMapper.toSessionDomainEntity);
  }

  // lookup for user from jti
  async findSessionWithUser(jti: string) {
    const user = await prisma.session.findUnique({
      where: { jti },
      include: { user: true },
    });
    return user;
  }

  // security: to revoke all the session of same family
  async revokeRefreshTokenFamily(familyId: string) {
    await prisma.session.updateMany({
      where: { familyId },
      data: { isRevoked: true },
    });
  }

  // Inside your SessionRepository class
  async revokeAllUserSessions(userId: string): Promise<void> {
    await prisma.session.updateMany({
      where: {
        userId,
        isRevoked: false, // Optional: limits updates to active sessions only
      },
      data: { isRevoked: true },
    });
  }

  // atomic rotation transaction
  async rotateSessionTx(params: {
    oldJti: string;
    newSession: {
      userId: string;
      tokenHash: string;
      familyId: string;
      jti: string;
      expires: Date;
      userAgent?: string | null;
      ipAddress?: string | null;
    };
  }): Promise<SessionEntity> {
    const rawSession = await prisma.$transaction(async (tx) => {
      // 1. Mark the current incoming token as used/revoked
      await tx.session.update({
        where: { jti: params.oldJti },
        data: { isRevoked: true },
      });

      // 2. Persist the new child token in the same transaction context
      return tx.session.create({
        data: params.newSession,
      });
    });
    return SessionMapper.toSessionDomainEntity(rawSession);
  }

  async revokeSingleSession(jti: string): Promise<void> {
    await prisma.session.update({
      where: { jti },
      data: { isRevoked: true },
    });
  }
}
