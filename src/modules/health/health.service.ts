import os from "node:os";
import { HealthRepository } from "./repositories/health.repository.js";
import { HealthSnapshot } from "./domain/health.entity.js";

export class HealthService {
  private readonly startTime = Date.now();

  constructor(private healthRepository: HealthRepository) {}

  async getSnapshot(): Promise<HealthSnapshot> {
    const database = await this.healthRepository.pingDatabase();

    return {
      status: database.status === "up" ? "ok" : "down",
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date(),
      database,
      system: {
        memoryUsedMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        memoryTotalMb: Math.round(os.totalmem() / 1024 / 1024),
        loadAvg: os.loadavg(),
      },
    };
  }
}
