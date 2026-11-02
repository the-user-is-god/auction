import express from "express";
import {
  forgotPasswordController,
  login,
  logout,
  me,
  refresh,
  register,
  resendVerificationEmailController,
  resetPasswordController,
  verifyEmail,
} from "./auth.controller.js";
import { validate } from "@common/middleware/validation.middleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendEmailVerificationSchema,
  resetPasswordSchema,
  tokenQuerySchema,
} from "./auth.validation.js";
import { protect } from "@common/middleware/auth.middleware.js";

export const authRoutes = express.Router();

authRoutes.post("/register", validate("body", registerSchema), register);
authRoutes.post("/login", validate("body", loginSchema), login);

authRoutes.get("/refresh", refresh);

// Email verification
authRoutes.get("/verify-email", validate("query", tokenQuerySchema), verifyEmail);
authRoutes.post(
  "/resend-verification",
  validate("body", resendEmailVerificationSchema),
  resendVerificationEmailController,
);

// Password Management
authRoutes.post(
  "/forgot-password",
  validate("body", forgotPasswordSchema),
  forgotPasswordController,
);
authRoutes.post(
  "/reset-password",
  //   authRateLimiter,
  validate("query", tokenQuerySchema),
  validate("body", resetPasswordSchema),
  resetPasswordController,
);

// Protected User session actions
authRoutes.get("/me", protect, me);
authRoutes.post("/logout", protect, logout);
