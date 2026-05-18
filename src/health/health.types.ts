export type HealthStatus = 'ok' | 'degraded' | 'error';

export interface HealthCheckResult {
  status: HealthStatus;
  message?: string;
}

export interface ServerHealthCheck extends HealthCheckResult {
  uptime: number;
}

export interface DatabaseHealthCheck extends HealthCheckResult {
  latencyMs: number;
}

export interface HealthResponse {
  status: HealthStatus;
  timestamp: string;
  checks: {
    server: ServerHealthCheck;
    database: DatabaseHealthCheck;
  };
}
