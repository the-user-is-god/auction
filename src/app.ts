import express from "express";
import cookieParser from "cookie-parser";

import { morganMiddleware } from "@common/middleware/morgan.middleware.js";
import { authRoutes } from "@modules/auth/auth.routes.js";
import { notFound } from "@common/middleware/notFound.middleware.js";
import { globalErrorHandler } from "@common/middleware/error.middleware.js";
import { userRoutes } from "@modules/users/user.routes.js";
import { applySecurityMiddlewares } from "@common/middleware/security.middleware.js";
import { healthRoutes } from "@modules/health/health.route.js";

const app = express();

applySecurityMiddlewares(app);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());

app.use(morganMiddleware);

// routes will be here
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/health", healthRoutes);

// Keep Render's root balancers happy and log-free
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Engine of Sainzo API Layer is online.",
    timestamp: new Date().toISOString(),
  });
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;
