import { QUEUE_NAMES, type QueueName } from '@nutrirace/shared';
import type { Job } from 'bullmq';
import { processSystemJob } from './jobs/system';

export interface QueueDefinition {
  name: QueueName;
  concurrency?: number;
  processor: (job: Job) => Promise<unknown>;
}

/**
 * Queue registration pattern: add one entry per queue. Product queues (reminders,
 * notifications, ...) are added by later phases — none exist yet.
 */
export const queueDefinitions: readonly QueueDefinition[] = [
  { name: QUEUE_NAMES.system, concurrency: 1, processor: processSystemJob },
];

export function assertUniqueQueues(definitions: readonly QueueDefinition[]): void {
  const seen = new Set<string>();
  for (const { name } of definitions) {
    if (seen.has(name)) throw new Error(`Queue "${name}" is registered twice`);
    seen.add(name);
  }
}
