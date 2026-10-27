import { SessionEntity } from "../domain/session.entity.js";
import { Session as PrismaSession } from "@generated/prisma/client.js";

export class SessionMapper {
  static toSessionDomainEntity(session: PrismaSession): SessionEntity {
    return {
      id: session.id,
      userId: session.userId,
      jti: session.jti,
      tokenHash: session.tokenHash,
      familyId: session.familyId,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      isRevoked: session.isRevoked,
      expires: session.expires,
      createdAt: session.createdAt,
    };
  }
}
