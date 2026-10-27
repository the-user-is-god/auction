import { AuthRepository } from "./repositories/auth.repository.js";
import { LoginRequestDTO, RegisterRequestDTO } from "./auth.dto.js";
import { IPasswordHasher } from "@common/interfaces/password-hasher.interface.js";
import { ITokenService } from "@common/interfaces/token-service.interface.js";
import { AUTH_CONFIG } from "./auth.constants.js";
import { Errors } from "@common/utils/errors.js";
import { AuthUser } from "./domain/auth.entity.js";
import { SessionRepository } from "./repositories/session.repository.js";
import { IEventEmitter } from "@common/interfaces/event-emitter.interface.js";

export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private sessionRepository: SessionRepository,
    private passwordHasher: IPasswordHasher,
    private tokenService: ITokenService,
    private eventEmitter: IEventEmitter,
  ) {
    // this.authRepository = new AuthRepository();
  }

  async registerUser(inputData: RegisterRequestDTO): Promise<AuthUser> {
    const existingUser = await this.authRepository.findByEmail(inputData.email);

    if (existingUser) {
      // throw new AppError(HTTP_STATUS.BAD_REQUEST, "Account exists already");
      throw Errors.badRequest("Account exists already");
    }
    const hashPassword = await this.passwordHasher.hash(inputData.password);

    const { rawToken, hashedToken } = this.tokenService.generateRandomToken();

    const user = await this.authRepository.create({
      ...inputData,
      password: hashPassword,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    this.eventEmitter.emit("user.registered", {
      email: user.email,
      rawToken: rawToken,
    });

    //  Verification link
    // const verifyURL = `${ENV.FRONTEND_URL}/verify-email/${rawToken}`;

    // // email with retry logic implemented
    // await this.emailProvider.sendEmail({
    //   to: user.email,
    //   subject: "Verify your email",
    //   html: verificationTemplate({ verifyURL }),
    // });

    return user;
  }

  async loginUser(
    credentials: LoginRequestDTO,
  ): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> {
    // 1. Fetch raw identity via repository
    const user = await this.authRepository.findByEmail(credentials.email);
    if (!user) {
      // throw new AppError(HTTP_STATUS.NOT_FOUND, "Invalid Credentials");
      throw Errors.notFound("Invalid Credentials");
    }

    // 2. Validate cryptographic hash
    const isPasswordValid = await this.passwordHasher.compare(credentials.password, user.password);

    if (!isPasswordValid) {
      // throw new AppError(HTTP_STATUS.NOT_FOUND, "Invalid Credentials");
      throw Errors.notFound("Invalid Credentials");
    }

    // 3. Evaluate platform ban safety gates
    if (user.isBanned) {
      // throw new AppError(HTTP_STATUS.FORBIDDEN, "You have been banned!!");
      throw Errors.forbidden("You have been banned!!");
    }

    // 4. Generate security tokens
    // const accessToken = signAccessToken(user.id, user.role);
    // const refreshToken = signRefreshToken(user.id, user.role);
    // const hashedRefreshToken = hashToken(refreshToken);

    const jti = this.tokenService.generateJTI();
    const familyId = this.tokenService.generateFamilyId();

    const accessToken = this.tokenService.signAccessToken(user.id, user.role);
    const refreshToken = this.tokenService.signRefreshToken(user.id, user.role, jti, familyId);
    const hashedRefreshToken = this.tokenService.hashToken(refreshToken);

    // 5. Commit state change to database
    // await this.authRepository.updateRefreshToken(user.id, hashedRefreshToken);

    await this.sessionRepository.create({
      userId: user.id,
      jti,
      familyId,
      tokenHash: hashedRefreshToken,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Enforces a 7-day chronological limit rule
      userAgent: null, // Set up fallback structural values
      ipAddress: null,
    });

    return { user, accessToken, refreshToken };
  }

  // 1. Verify Email Token Flow
  async verifyEmailToken(
    token: string,
  ): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> {
    const hashedToken = this.tokenService.hashToken(token);
    // const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await this.authRepository.findByVerificationToken(hashedToken);

    if (!user) {
      // throw new AppError(
      //   HTTP_STATUS.BAD_REQUEST,
      //   "Invalid or expired verification token",
      // );
      throw Errors.badRequest("Invalid or expired verification token");
    }
    // const session = await this.sessionRepository.create()
    const jti = this.tokenService.generateJTI();
    const familyId = this.tokenService.generateFamilyId();

    const accessToken = this.tokenService.signAccessToken(user.id, user.role);
    const refreshToken = this.tokenService.signRefreshToken(user.id, user.role, jti, familyId);
    const hashedRefreshToken = this.tokenService.hashToken(refreshToken);

    const updatedUser = await this.authRepository.updateVerificationSuccess(user.id);

    await this.sessionRepository.create({
      userId: user.id,
      jti,
      familyId,
      tokenHash: hashedRefreshToken,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Enforces a 7-day chronological limit rule
      userAgent: null, // Set up fallback structural values
      ipAddress: null,
    });

    return { user: updatedUser, accessToken, refreshToken };
  }

  // 2. Resend Verification Email Link
  async resendVerificationEmail(email: string): Promise<boolean> {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      // throw new AppError(
      //   HTTP_STATUS.NOT_FOUND,
      //   "No account found with this email address",
      // );
      throw Errors.notFound("No account found with this email address");
    }

    if (user.isVerified) {
      // throw new AppError(
      //   HTTP_STATUS.BAD_REQUEST,
      //   "This account is already verified",
      // );
      throw Errors.badRequest("This account is already verified");
    }

    const { rawToken, hashedToken } = this.tokenService.generateRandomToken();
    const expiryWindow = new Date(Date.now() + AUTH_CONFIG.EMAIL_VERIFICATION_EXPIRY_MS);

    await this.authRepository.updateVerificationToken(user.id, hashedToken, expiryWindow);

    this.eventEmitter.emit("resend.verification", {
      email: user.email,
      rawToken: rawToken,
    });

    // const verifyURL = `${ENV.FRONTEND_URL}/verify-email/${rawToken}`;

    // await this.emailProvider.sendEmail({
    //   to: user.email,
    //   subject: "Verify your email (New Link)",
    //   html: verificationTemplate({ verifyURL }),
    // });

    return true;
  }

  // 3. Dual Refresh Token Rotation
  async refreshUserToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (!token) {
      // throw new AppError(HTTP_STATUS.UNAUTHORIZED, "No refresh token provided");
      throw Errors.unauthorized("No refresh token provided");
    }

    let decoded: any;
    try {
      decoded = this.tokenService.verifyRefreshToken(token);
    } catch {
      // throw new AppError(HTTP_STATUS.UNAUTHORIZED, "Invalid refresh token");
      throw Errors.unauthorized("Invalid refresh token");
    }

    const incomingHash = this.tokenService.hashToken(token);
    // const user = await this.authRepository.findById(decoded.id);
    const sessionWithUser = await this.sessionRepository.findSessionWithUser(decoded.jti);

    if (!sessionWithUser || !sessionWithUser.user) {
      throw Errors.unauthorized("Token mismatch or session expired");
    }

    const { user } = sessionWithUser;

    // if (!user || user.refreshToken !== incomingHash) {
    //   // throw new AppError(
    //   //   HTTP_STATUS.UNAUTHORIZED,
    //   //   "Token mismatch or session expired",
    //   // );
    //   throw Errors.unauthorized("Token mismatch or session expired");
    // }

    // if (user.isBanned) {
    //   // throw new AppError(
    //   //   HTTP_STATUS.FORBIDDEN,
    //   //   "Your account has been banned!!",
    //   // );
    //   throw Errors.forbidden("Your account has been banned!!");
    // }

    if (sessionWithUser.tokenHash !== incomingHash) {
      throw Errors.unauthorized("Token mismatch or session expired");
    }

    if (sessionWithUser.isRevoked) {
      await this.sessionRepository.revokeRefreshTokenFamily(sessionWithUser.familyId);

      throw Errors.unauthorized("Compromised token lineage. Intercepted session terminated.");
    }
    if (user.isBanned) {
      throw Errors.forbidden("Your account has been banned!!");
    }

    //  Ensure token is timeline valid chronologically
    if (new Date() > sessionWithUser.expires) {
      throw Errors.unauthorized("Refresh session lifecycle window expired");
    }

    const jti = this.tokenService.generateJTI();
    const familyId = sessionWithUser.familyId;
    const newAccessToken = this.tokenService.signAccessToken(user.id, user.role);
    const newRefreshToken = this.tokenService.signRefreshToken(user.id, user.role, jti, familyId);
    const hashedNewRefreshToken = this.tokenService.hashToken(newRefreshToken);

    // await this.authRepository.updateRefreshToken(
    //   user.id,
    //   hashedNewRefreshToken,
    // );
    // await this.sessionRepository.create({
    //   userId: user.id,
    //   jti,
    //   familyId,
    //   tokenHash: hashedNewRefreshToken,
    //   expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Enforces a 7-day chronological limit rule
    //   userAgent: null, // Set up fallback structural values
    //   ipAddress: null,
    // });

    await this.sessionRepository.rotateSessionTx({
      oldJti: sessionWithUser.jti,
      newSession: {
        userId: user.id,
        jti,
        familyId,
        tokenHash: hashedNewRefreshToken,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: sessionWithUser.userAgent,
        ipAddress: sessionWithUser.ipAddress,
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  // 4. Logout Session Termination
  // async logOutUser(userId: string): Promise<void> {
  //   await this.authRepository.updateRefreshToken(userId, null);
  // }
  async logoutUser(refreshToken: string): Promise<void> {
    if (!refreshToken) return;
    let decoded: any;
    try {
      decoded = this.tokenService.verifyRefreshToken(refreshToken);
      // Invalidate the specific database record row completely
      await this.sessionRepository.revokeSingleSession(decoded.jti);
    } catch {
      // If the token is already structurally malformed or broken, let the cookie clearing drop it anyway
      return;
    }
  }

  // 5. Trigger Forgot Password Link Request
  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.authRepository.findByEmail(email);

    // Fail silently to prevent account harvesting vulnerabilities
    if (!user) return true;
    const { rawToken, hashedToken } = this.tokenService.generateRandomToken();
    const expiryWindow = new Date(Date.now() + AUTH_CONFIG.PASSWORD_RESET_EXPIRY_MS);

    await this.authRepository.updateResetToken(user.id, hashedToken, expiryWindow);

    this.eventEmitter.emit("forgot.password", {
      email: user.email,
      rawToken: rawToken,
    });

    // const resetURL = `${ENV.FRONTEND_URL}/reset-password/${rawToken}`;

    // await this.emailProvider.sendEmail({
    //   to: user.email,
    //   subject: "Reset your password",
    //   html: resetPasswordTemplate({ resetURL }),
    // });

    return true;
  }

  // 6. Complete Reset Password Update
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const hashedToken = this.tokenService.hashToken(token);

    const user = await this.authRepository.findByResetToken(hashedToken);

    if (!user) {
      // throw new AppError(
      //   HTTP_STATUS.BAD_REQUEST,
      //   "Invalid or expired password reset token",
      // );
      throw Errors.badRequest("Invalid or expired password reset token");
    }

    const hashPassword = await this.passwordHasher.hash(newPassword);

    await this.authRepository.updatePasswordAndClearTokens(user.id, hashPassword);

    await this.sessionRepository.revokeAllUserSessions(user.id);

    this.eventEmitter.emit("reset.success", {
      email: user.email,
    });

    return true;
  }

  // 7. Context Identity Fetch
  async getCurrentUser(userId: string): Promise<AuthUser> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      // throw new AppError(HTTP_STATUS.NOT_FOUND, "User not found");
      throw Errors.notFound("User not found");
    }
    return user;
  }
}
