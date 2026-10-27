import { HealthRepository } from "./repositories/health.repository.js";
import { HealthService } from "./health.service.js";

export function createHealthModule() {
  const healthRepository = new HealthRepository();
  const healthService = new HealthService(healthRepository);

  return { healthService };
}

export const { healthService } = createHealthModule();
