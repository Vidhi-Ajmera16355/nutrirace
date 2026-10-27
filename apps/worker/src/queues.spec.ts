import { QUEUE_NAMES } from '@nutrirace/shared';
import type { Job } from 'bullmq';
import { SYSTEM_JOBS, processSystemJob } from './jobs/system';
import { assertUniqueQueues, queueDefinitions } from './queues';

const job = (name: string) => ({ name }) as unknown as Job;

describe('queue registry', () => {
  it('registers only the system queue in Phase 1', () => {
    expect(queueDefinitions.map((d) => d.name)).toEqual([QUEUE_NAMES.system]);
  });

  it('rejects duplicate registrations', () => {
    const [first] = queueDefinitions;
    expect(first).toBeDefined();
    expect(() => assertUniqueQueues([first!, first!])).toThrow(/twice/);
  });
});

describe('system processor', () => {
  it('handles ping', async () => {
    await expect(processSystemJob(job(SYSTEM_JOBS.ping))).resolves.toEqual({ pong: true });
  });

  it('fails unknown jobs instead of pretending they were processed', async () => {
    await expect(processSystemJob(job('send-reminder'))).rejects.toThrow(/Unsupported/);
  });
});
