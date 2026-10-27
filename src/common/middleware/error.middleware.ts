/* eslint-disable @typescript-eslint/no-unused-vars */
import { ENV } from "@config/env.js";
import { logger } from "@lib/logger.js";
import { NextFunction, Request, Response } from "express";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something Spicy Eh!!";
  const requestId = (req as any).id || "no-id";

  logger.error({ err, requestId }, `Error occurred during ${req.method} ${req.url}`);

  const responsePayload: Record<string, any> = {
    success: false,
    status: err.status || "error",
    message,
    requestId, // Sent in both dev & prod so users can reference it for tech support
  };

  if (ENV.NODE_ENV === "development") {
    responsePayload.stack = err.stack;
  }

  // If a 403 Forbidden (Ban) or 401 Unauthorized occurs, wipe the auth cookies
  // if (err.statusCode === 403 || err.statusCode === 401) {
  //   res.clearCookie("accessToken");
  //   res.clearCookie("refreshToken");
  // }
  if (err.statusCode === 403) {
    // If banned, wipe everything immediately
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
  } else if (err.statusCode === 401) {
    // Always wipe the dead access token
    res.clearCookie("accessToken");

    // Only wipe the refresh token if the failure happened ON the refresh endpoint itself
    if (req.url.includes("/auth/refresh")) {
      res.clearCookie("refreshToken");
    }
  }

  return res.status(statusCode).json(
    //   {
    //   status: err.status || "error",
    //   message,
    // }
    responsePayload,
  );
};
