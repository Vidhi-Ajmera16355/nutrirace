import { createLogger, loadWorkerEnv, QUEUE_NAMES } from '@nutrirace/shared';
import { Queue, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { randomUUID } from 'node:crypto';
import { startWorkerRuntime } from '../src/runtime';

describe('worker against real Redis', () => {
  const prefix = `test-${randomUUID()}`;
  const redisUrl = process.env['REDIS_URL'] ?? 'redis://localhost:6379';

  it('actually processes a ping job and reports readiness, then shuts down cleanly', async () => {
    const env = loadWorkerEnv({ NODE_ENV: 'test', REDIS_URL: redisUrl, WORKER_HEALTH_PORT: '0' });
    const logger = createLogger({ service: 'worker-test', level: 'silent' });
    const runtime = await startWorkerRuntime(env, logger, { prefix });

    const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
    const queue = new Queue(QUEUE_NAMES.system, { connection, prefix });
    const eventsConnection = connection.duplicate();
    const events = new QueueEvents(QUEUE_NAMES.system, { connection: eventsConnection, prefix });
    try {
      await events.waitUntilReady();
      expect((await fetch(`http://127.0.0.1:${runtime.healthPort}/ready`)).status).toBe(200);

      const job = await queue.add('ping', {});
      const result: unknown = await job.waitUntilFinished(events, 10_000);
      expect(result).toEqual({ pong: true });

      const bad = await queue.add('unknown-job', {}, { attempts: 1 });
      await expect(bad.waitUntilFinished(events, 10_000)).rejects.toThrow(/Unsupported/);
    } finally {
      await events.close();
      await queue.obliterate({ force: true });
      await queue.close();
      eventsConnection.disconnect();
      connection.disconnect();
      await runtime.shutdown();
    }
    await expect(fetch(`http://127.0.0.1:${runtime.healthPort}/health`)).rejects.toThrow();
  });
});
