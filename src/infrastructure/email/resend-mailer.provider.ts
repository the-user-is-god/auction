import { IEmailProvider, SendEmailPayload } from "@common/interfaces/email-provider.interface.js";
import { EmailSendError } from "@common/errors/email-send.error.js";
import { resend } from "@config/resend.js";
import { ENV } from "@config/env.js";

export class ResendEmailProvider implements IEmailProvider {
  async sendEmail({ to, subject, html }: SendEmailPayload): Promise<void> {
    const { error } = await resend.emails.send({
      from: ENV.EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (error) {
      throw new EmailSendError(error.message, error.statusCode ?? undefined);
    }
  }
}
