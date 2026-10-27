export interface HealthResponse {
  status: 'ok';
  service: string;
  version: string;
  uptimeSeconds: number;
  timestamp: string;
}

export type DependencyState = 'up' | 'down';

export interface ReadinessResponse {
  status: 'ready' | 'not_ready';
  checks: Record<string, DependencyState>;
  timestamp: string;
}
