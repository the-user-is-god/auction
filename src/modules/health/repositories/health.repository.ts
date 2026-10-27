import { prisma } from "@infrastructure/db.js";
import { DatabaseHealth } from "../domain/health.entity.js";

// This is the only place in the health module allowed to touch Prisma directly.
export class HealthRepository {
  async pingDatabase(): Promise<DatabaseHealth> {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: "up", latencyMs: Date.now() - start };
    } catch (error) {
      return {
        status: "down",
        error: error instanceof Error ? error.message : "Unknown database error",
      };
    }
  }
}
