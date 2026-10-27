import { baseLayout } from "./base.layout.js";

interface ResetSuccessProps {
  email: string;
  supportURL: string;
}

export function passwordResetSuccessTemplate({ email, supportURL }: ResetSuccessProps): string {
  const content = `
    <h3>Password Changed Successfully</h3>
    <p>Hello,</p>
    <p>The password for your account associated with <strong>${email}</strong> has been updated successfully.</p>
    <p style="color: #666; font-size: 14px; margin-top: 20px;">
      <strong>Didn't make this change?</strong><br>
      If you did not request a password reset, please contact our support team immediately to secure your account:
    </p>
    <p><a href="${supportURL}" class="btn" style="background-color: #dc3545;">Contact Support</a></p>
  `;
  return baseLayout("Password Changed Successfully", content);
}
