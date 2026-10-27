import { Prisma, User } from "@generated/prisma/client.js";
import { prisma } from "@infrastructure/db.js";
import { BaseRepository } from "@infrastructure/repositories/base.repository.js";
import { AuthUser } from "../domain/auth.entity.js";
import { AuthMapper } from "../mappers/auth.mapper.js";

export class AuthRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  AuthUser
> {
  constructor() {
    // Pass the actual Prisma delegate instance here
    super(prisma.user, AuthMapper.toAuthDomainEntity);
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? AuthMapper.toAuthDomainEntity(user) : null;
  }

  async updateRefreshToken(userId: string, hashedRefreshToken: string | null): Promise<AuthUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
    return AuthMapper.toAuthDomainEntity(user);
  }

  async findByVerificationToken(hashedToken: string): Promise<AuthUser | null> {
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { gt: new Date() },
      },
    });
    return user ? AuthMapper.toAuthDomainEntity(user) : null;
  }

  async findByResetToken(hashedToken: string): Promise<AuthUser | null> {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() },
      },
    });
    return user ? AuthMapper.toAuthDomainEntity(user) : null;
  }

  async updateVerificationSuccess(userId: string): Promise<AuthUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });
    return AuthMapper.toAuthDomainEntity(user);
  }

  async updateVerificationToken(
    userId: string,
    hashedToken: string,
    expiry: Date,
  ): Promise<AuthUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: expiry,
      },
    });
    return AuthMapper.toAuthDomainEntity(user);
  }

  async updateResetToken(userId: string, hashedToken: string, expiry: Date): Promise<AuthUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expiry,
      },
    });
    return AuthMapper.toAuthDomainEntity(user);
  }

  async updatePasswordAndClearTokens(userId: string, hashPassword: string): Promise<AuthUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        refreshToken: null, // Clear active sessions on password change
      },
    });
    return AuthMapper.toAuthDomainEntity(user);
  }
}
