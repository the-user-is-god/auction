import { baseLayout } from "./base.layout.js";

interface VerificationProps {
  verifyURL: string;
}

export function verificationTemplate({ verifyURL }: VerificationProps): string {
  const content = `
    <h3>Welcome!</h3>
    <p>Please click the button below to verify your email address:</p>
    <p><a href="${verifyURL}" class="btn">Verify Email</a></p>
    <p>If the button doesn't work, copy and paste this link:</p>
    <a href="${verifyURL}">${verifyURL}</a>
  `;
  return baseLayout("Verify your email", content);
}
