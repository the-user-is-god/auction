import { IEmailProvider } from "@common/interfaces/email-provider.interface.js";
import { IEventEmitter } from "@common/interfaces/event-emitter.interface.js";
import { ENV } from "@config/env.js";
import { passwordResetSuccessTemplate } from "@infrastructure/email/templates/password-reset-success.template.js";
import { resetPasswordTemplate } from "@infrastructure/email/templates/reset-password.template.js";
import { verificationTemplate } from "@infrastructure/email/templates/verification.template.js";

export class AuthEmailListener {
  constructor(
    private eventEmitter: IEventEmitter,
    private emailProvider: IEmailProvider,
  ) {}

  public listen(): void {
    // listens to user registration
    this.eventEmitter.on("user.registered", async (data) => {
      const verifyURL = `${ENV.FRONTEND_URL}/verify-email/${data.rawToken}`;
      await this.emailProvider.sendEmail({
        to: data.email,
        subject: "Verify your email",
        html: verificationTemplate({ verifyURL }),
      });
    });

    // listens to resend email verification
    this.eventEmitter.on("resend.verification", async (data) => {
      const verifyURL = `${ENV.FRONTEND_URL}/verify-email/${data.rawToken}`;
      await this.emailProvider.sendEmail({
        to: data.email,
        subject: "Verify your email (New Link)",
        html: verificationTemplate({ verifyURL }),
      });
    });

    // listens forgot password
    this.eventEmitter.on("forgot.password", async (data) => {
      const resetURL = `${ENV.FRONTEND_URL}/reset-password/${data.rawToken}`;

      await this.emailProvider.sendEmail({
        to: data.email,
        subject: "Reset your password",
        html: resetPasswordTemplate({ resetURL }),
      });
    });

    // listens reset password
    this.eventEmitter.on("reset.success", async (data) => {
      const supportURL = `${ENV.FRONTEND_URL}/support`;

      await this.emailProvider.sendEmail({
        to: data.email,
        subject: "Security Alert: Password Changed",
        html: passwordResetSuccessTemplate({
          email: data.email,
          supportURL,
        }),
      });
    });
  }
}
