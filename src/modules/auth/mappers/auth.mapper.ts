import { AuthResponseDTO } from "../auth.dto.js";
import { User as PrismaUser } from "@generated/prisma/client.js";
import { AuthUser } from "../domain/auth.entity.js";
import { UserMapper } from "@modules/users/mappers/user.mapper.js";

export class AuthMapper {
  static toAuthDomainEntity(user: PrismaUser): AuthUser {
    return {
      ...UserMapper.toDomainEntity(user), // Reuses the public entity mapping fields
      password: user.password,
      emailVerificationToken: user.emailVerificationToken,
      emailVerificationExpires: user.emailVerificationExpires,
      passwordResetToken: user.passwordResetToken,
      passwordResetExpires: user.passwordResetExpires,
    };
  }
  static toResponse(user: AuthUser): AuthResponseDTO {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isBanned: user.isBanned,
      isVerified: user.isVerified,
    };
  }

  //   static toManyResponse(users: User[]): AuthResponseDTO[] {
  //     return users.map((user) => this.toResponse(user));
  //   }
}
