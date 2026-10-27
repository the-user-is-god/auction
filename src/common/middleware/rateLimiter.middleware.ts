import { rateLimit } from "express-rate-limit";
import { Request, Response } from "express";
import { HTTP_STATUS } from "@common/constants/index.js";

export const rateLimiterMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: "draft-7",
  legacyHeaders: false,

  skip: (req: Request) => {
    // 1. Check Render's explicit user agent header
    const userAgent = req.headers["user-agent"] || "";
    if (userAgent.includes("RenderOnlineCheck") || userAgent.includes("Render/")) {
      return true;
    }

    // 2. Bypass explicit health probe paths entirely from matching
    if (req.originalUrl === "/health" || req.originalUrl === "/api/v1/health") {
      return true;
    }

    return false;
  },

  message: async (req: Request, res: Response) => {
    return res.status(HTTP_STATUS.TOO_MANY_REQUESTS || 429).json({
      status: HTTP_STATUS.TOO_MANY_REQUESTS || 429,
      error: "Too Many Requests",
      message: "You have exceeded your request limit. Please try again later.",
      requestId: (req as any).id || "no-id", // Bundled tracking context
    });
  },
});
