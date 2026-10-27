import cors from "cors";
import { ENV } from "@config/env.js";

export const corsMiddleware = cors({
  origin: ENV.ALLOWED_ORIGINS ? ENV.ALLOWED_ORIGINS.split(",") : "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
  exposedHeaders: ["x-request-id"],
  credentials: true,
});
