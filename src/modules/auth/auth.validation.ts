import { z } from "zod";

//  Password rule (reusable)
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(50)
  .regex(/[A-Z]/, "Must include at least one uppercase letter")
  .regex(/[0-9]/, "Must include at least one number");

//  Register
export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: passwordSchema,
});

//  Login
export const loginSchema = z.object({
  email: z.email(),
  password: passwordSchema,
});

//  Change password
export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
});

export const resendEmailVerificationSchema = z.object({
  email: z.email(),
});

export const tokenQuerySchema = z.object({
  token: z
    .string("Token is required")
    .trim()
    // Exactly 64 characters long (32 bytes in hex = 64 characters)
    .length(64, "Token must be exactly 64 characters long")
    // Ensures the string only contains valid hexadecimal characters (0-9, a-f)
    .regex(/^[a-f0-9]+$/i, "Invalid token format"),
});
