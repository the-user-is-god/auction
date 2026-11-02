import { protect } from "@common/middleware/auth.middleware.js";
import express from "express";
import { updateProfileController } from "./user.controller.js";
import { validate } from "@common/middleware/validation.middleware.js";
import { profileUpdateSchema } from "./user.validation.js";

export const userRoutes = express.Router();

userRoutes.patch(
  "/profile",
  validate("body", profileUpdateSchema),
  protect,
  updateProfileController,
);
