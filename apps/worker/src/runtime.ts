import { DEFAULT_QUEUE_PREFIX, type Logger, type WorkerEnv } from '@nutrirace/shared';
import { Worker } from 'bullmq';
import Redis from 'ioredis';
import type { Server } from 'node:http';
import { closeServer, startHealthServer } from './health-server';
import { assertUniqueQueues, queueDefinitions, type QueueDefinition } from './queues';

export interface WorkerRuntime {
  readonly healthPort: number;
  shutdown(): Promise<void>;
}

export interface RuntimeOptions {
  prefix?: string;
  definitions?: readonly QueueDefinition[];
}

export async function startWorkerRuntime(
  env: WorkerEnv,
  logger: Logger,
  { prefix = DEFAULT_QUEUE_PREFIX, definitions = queueDefinitions }: RuntimeOptions = {},
): Promise<WorkerRuntime> {
  assertUniqueQueues(definitions);

  // BullMQ workers require maxRetriesPerRequest: null on blocking connections.
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
  connection.on('error', (error: Error) =>
    logger.warn({ err: error.message }, 'redis connection error'),
  );

  const workers = definitions.map((definition) => {
    const worker = new Worker(definition.name, definition.processor, {
      connection,
      prefix,
      concurrency: definition.concurrency ?? env.WORKER_CONCURRENCY,
    });
    worker.on('completed', (job) =>
      logger.info({ queue: definition.name, jobId: job.id, jobName: job.name }, 'job completed'),
    );
    worker.on('failed', (job, error) =>
      logger.error(
        { queue: definition.name, jobId: job?.id, jobName: job?.name, err: error.message },
        'job failed',
      ),
    );
    worker.on('error', (error) =>
      logger.error({ queue: definition.name, err: error.message }, 'worker error'),
    );
    return worker;
  });
  await Promise.all(workers.map((worker) => worker.waitUntilReady()));

  let stopping = false;
  const server: Server = await startHealthServer(env.WORKER_HEALTH_PORT, {
    alive: () => true,
    ready: async () =>
      !stopping && workers.every((w) => w.isRunning()) && (await connection.ping()) === 'PONG',
  });
  const address = server.address();
  const healthPort = typeof address === 'object' && address ? address.port : env.WORKER_HEALTH_PORT;
  logger.info({ queues: definitions.map((d) => d.name), healthPort }, 'worker started');

  return {
    healthPort,
    async shutdown() {
      if (stopping) return;
      stopping = true;
      logger.info('worker shutting down');
      await closeServer(server);
      await Promise.all(workers.map((worker) => worker.close())); // waits for active jobs
      try {
        await connection.quit();
      } catch {
        connection.disconnect();
      }
      logger.info('worker stopped');
    },
  };
}
