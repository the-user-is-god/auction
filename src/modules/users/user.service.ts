import { UserRepository } from "./repositories/user.repository.js";
import { AppError } from "@common/utils/appError.js";
import { HTTP_STATUS } from "@common/constants/httpStatusCode.js";
import { UserEntity } from "./domain/user.entity.js";
import { UpdateProfileInputDTO } from "./user.dto.js";

export class UserService {
  //   private userRepository: UserRepository;

  constructor(private userRepository: UserRepository) {
    // this.userRepository = new UserRepository();
  }

  async updateProfile(inputData: UpdateProfileInputDTO, userId: string): Promise<UserEntity> {
    if (!userId) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "User not found");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "User not found");
    }
    return this.userRepository.update(userId, inputData);
  }
}
