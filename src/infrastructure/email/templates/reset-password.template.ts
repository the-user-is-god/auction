import { baseLayout } from "./base.layout.js";

interface ResetPasswordProps {
  resetURL: string;
}

export function resetPasswordTemplate({ resetURL }: ResetPasswordProps): string {
  const content = `
    <h3>Reset Your Password</h3>
    <p>We received a request to reset your password. Click below to proceed:</p>
    <p><a href="${resetURL}" class="btn">Reset Password</a></p>
    <p>If you didn't request this, you can safely ignore this email.</p>
  `;
  return baseLayout("Reset your password", content);
}
