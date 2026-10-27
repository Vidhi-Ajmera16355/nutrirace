import type { Job } from 'bullmq';

export const SYSTEM_JOBS = { ping: 'ping' } as const;

export interface PingResult {
  pong: true;
}

/**
 * Diagnostic processor for the infrastructure queue. It performs no product work.
 * Unknown job names FAIL, so a job is only ever reported complete when it was really handled.
 */
export function processSystemJob(job: Job): Promise<PingResult> {
  if (job.name === SYSTEM_JOBS.ping) return Promise.resolve({ pong: true });
  return Promise.reject(new Error(`Unsupported system job "${job.name}"`));
}
