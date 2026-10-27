import { INestApplication, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { APP_VERSION, type ApiEnv } from '@nutrirace/shared';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppLogger } from './common/app-logger';
import { correlationIdMiddleware, createRequestLogger } from './common/request-context';
import { createValidationPipe } from './common/validation';

/** Applies all cross-cutting configuration. Shared by main.ts and the test harness. */
export function configureApp(app: INestApplication, env: ApiEnv): void {
  const express = app as NestExpressApplication;
  if (env.TRUST_PROXY) express.set('trust proxy', 1);
  express.disable('x-powered-by');

  app.use(correlationIdMiddleware);
  app.use(helmet());
  app.use(createRequestLogger(app.get(AppLogger)));

  app.enableCors({
    origin: env.CORS_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    credentials: true,
    maxAge: 600,
  });

  app.setGlobalPrefix(env.API_PREFIX);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(createValidationPipe());
  app.enableShutdownHooks();

  if (env.SWAGGER_ENABLED) {
    const config = new DocumentBuilder()
      .setTitle('NutriRace API')
      .setDescription(
        'REST API for the NutriRace platform. Phase 1 exposes infrastructure endpoints only.',
      )
      .setVersion(APP_VERSION)
      .addServer(env.BACKEND_URL)
      .build();
    SwaggerModule.setup(`${env.API_PREFIX}/docs`, app, SwaggerModule.createDocument(app, config));
  }
}
