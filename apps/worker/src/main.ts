import { createLogger, EnvValidationError, loadDotenvFile, loadWorkerEnv } from '@nutrirace/shared';
import { startWorkerRuntime } from './runtime';

const SHUTDOWN_TIMEOUT_MS = 30_000;

async function main(): Promise<void> {
  loadDotenvFile();
  let env;
  try {
    env = loadWorkerEnv(process.env);
  } catch (error) {
    if (error instanceof EnvValidationError) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  }

  const logger = createLogger({ service: 'worker', level: env.LOG_LEVEL });
  const runtime = await startWorkerRuntime(env, logger);

  let shuttingDown = false;
  const stop = (signal: string): void => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'shutdown signal received');
    const force = setTimeout(() => {
      logger.error('graceful shutdown timed out; forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    force.unref();
    runtime.shutdown().then(
      () => process.exit(0),
      (error: unknown) => {
        logger.error(
          { err: error instanceof Error ? error.message : String(error) },
          'shutdown failed',
        );
        process.exit(1);
      },
    );
  };
  process.on('SIGTERM', () => stop('SIGTERM'));
  process.on('SIGINT', () => stop('SIGINT'));
}

main().catch((error: unknown) => {
  console.error('Worker failed to start:', error instanceof Error ? error.message : error);
  process.exit(1);
});
