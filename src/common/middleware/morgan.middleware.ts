import morgan from "morgan";
import { StreamOptions } from "morgan";
import { logger } from "@lib/logger.js";
import { ENV } from "@config/env.js";
import { Request } from "express";

// Custom token to grab the generated Request ID
morgan.token("id", (req: Request) => (req as any).id || "no-id");

// Production uses structured 'combined' logs, development gets tracking id strings injected
const morganFormat =
  ENV.NODE_ENV === "production"
    ? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - ID: :id'
    : "[:id] :method :url :status :response-time ms - :res[content-length]";

// 1. Choose format based on environment
// const morganFormat = ENV.NODE_ENV === "production" ? "combined" : "dev";

// 2. Direct the stream output straight into your Pino logger instance
const stream: StreamOptions = {
  write: (message: string) => logger.info(message.trim()),
};

// 3. Export the fully configured middleware
export const morganMiddleware = morgan(morganFormat, { stream });
