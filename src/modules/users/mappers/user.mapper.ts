import { User as PrismaUser } from "@generated/prisma/client.js";
import { UserEntity } from "../domain/user.entity.js";
import { UserResponseDTO } from "../user.dto.js";

export class UserMapper {
  // Converts DB model to Safe Public Domain Entity
  static toDomainEntity(user: PrismaUser): UserEntity {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "USER" | "ADMIN" | "MODERATOR",
      isBanned: user.isBanned,
      isVerified: user.isVerified,
    };
  }

  // Converts DB model to Internal Auth Domain Entity
  // 2. For Controller: Converts Domain Entity ➡️ Public API Response DTO
  static toResponse(user: UserEntity): UserResponseDTO {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isBanned: user.isBanned,
      isVerified: user.isVerified,
    };
  }

  static toManyResponse(users: UserEntity[]): UserResponseDTO[] {
    return users.map((user) => this.toResponse(user));
  }
}
