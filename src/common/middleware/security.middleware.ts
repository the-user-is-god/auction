import { Express } from "express";
import { requestIdMiddleware } from "./requestId.middleware.js";
import { helmetMiddleware } from "./helmet.middleware.js";
import { corsMiddleware } from "./cors.middleware.js";
import { rateLimiterMiddleware } from "./rateLimiter.middleware.js";

export const applySecurityMiddlewares = (app: Express): void => {
  app.use(requestIdMiddleware);
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(rateLimiterMiddleware);
};
