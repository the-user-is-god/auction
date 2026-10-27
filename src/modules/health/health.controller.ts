import { Request, Response } from "express";
import { HealthService } from "./health.service.js";
import { HealthMapper } from "./mappers/health.mapper.js";

export class HealthController {
  constructor(private healthService: HealthService) {}

  getHealth = async (_req: Request, res: Response): Promise<void> => {
    const snapshot = await this.healthService.getSnapshot();
    const dto = HealthMapper.toResponse(snapshot);
    res.status(dto.status === "ok" ? 200 : 503).json(dto);
  };

  getLiveness = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json(HealthMapper.toLivenessResponse());
  };

  getReadiness = async (_req: Request, res: Response): Promise<void> => {
    const snapshot = await this.healthService.getSnapshot();
    const dto = HealthMapper.toReadinessResponse(snapshot);
    res.status(dto.status === "ready" ? 200 : 503).json(dto);
  };
}
