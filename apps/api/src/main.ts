import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { EnvValidationError, loadApiEnv, loadDotenvFile } from '@nutrirace/shared';
import { AppLogger } from './common/app-logger';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap(): Promise<void> {
  loadDotenvFile();
  let env;
  try {
    env = loadApiEnv(process.env);
  } catch (error) {
    if (error instanceof EnvValidationError) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  }

  const app = await NestFactory.create(AppModule.forRoot(env), { bufferLogs: true });
  const logger = app.get(AppLogger);
  app.useLogger(logger);
  configureApp(app, env);

  await app.listen(env.API_PORT, '0.0.0.0');
  logger.log(`API listening on port ${env.API_PORT} (prefix /${env.API_PREFIX}/v1)`, 'Bootstrap');
}

bootstrap().catch((error: unknown) => {
  console.error('API failed to start:', error instanceof Error ? error.message : error);
  process.exit(1);
});
