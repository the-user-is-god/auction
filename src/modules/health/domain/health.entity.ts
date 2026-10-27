export interface DatabaseHealth {
  status: "up" | "down";
  latencyMs?: number;
  error?: string;
}

export interface SystemHealth {
  memoryUsedMb: number;
  memoryTotalMb: number;
  loadAvg: number[];
}

export interface HealthSnapshot {
  status: "ok" | "down";
  uptimeSeconds: number;
  timestamp: Date;
  database: DatabaseHealth;
  system: SystemHealth;
}
