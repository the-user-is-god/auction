import { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = (req.headers["x-request-id"] as string) || randomUUID();
  req.id = requestId;
  res.setHeader("x-request-id", requestId);
  next();
};
