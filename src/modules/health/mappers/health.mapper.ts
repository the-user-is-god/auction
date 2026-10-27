import { HealthSnapshot } from "../domain/health.entity.js";
import { HealthResponseDTO, LivenessResponseDTO, ReadinessResponseDTO } from "../health.dto.js";

export class HealthMapper {
  static toResponse(snapshot: HealthSnapshot): HealthResponseDTO {
    return {
      status: snapshot.status,
      uptimeSeconds: snapshot.uptimeSeconds,
      timestamp: snapshot.timestamp.toISOString(),
      checks: {
        database: {
          status: snapshot.database.status,
          latencyMs: snapshot.database.latencyMs,
          error: snapshot.database.error,
        },
      },
      system: snapshot.system,
    };
  }

  static toLivenessResponse(): LivenessResponseDTO {
    return { status: "ok" };
  }

  static toReadinessResponse(snapshot: HealthSnapshot): ReadinessResponseDTO {
    return {
      status: snapshot.database.status === "up" ? "ready" : "not_ready",
      database: snapshot.database.status,
    };
  }
}
