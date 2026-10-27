export interface HealthResponseDTO {
  status: "ok" | "down";
  uptimeSeconds: number;
  timestamp: string;
  checks: {
    database: {
      status: "up" | "down";
      latencyMs?: number;
      error?: string;
    };
  };
  system: {
    memoryUsedMb: number;
    memoryTotalMb: number;
    loadAvg: number[];
  };
}

export interface LivenessResponseDTO {
  status: "ok";
}

export interface ReadinessResponseDTO {
  status: "ready" | "not_ready";
  database: "up" | "down";
}
