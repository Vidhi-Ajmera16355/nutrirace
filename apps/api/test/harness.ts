import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import type { INestApplication } from '@nestjs/common';
import { loadApiEnv, type ApiEnv } from '@nutrirace/shared';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaService } from '../src/prisma/prisma.service';
import { RedisService } from '../src/redis/redis.service';

export const baseRaw = {
  NODE_ENV: 'test',
  LOG_LEVEL: 'silent',
  DATABASE_URL: 'mongodb://localhost:27017/nutrirace_test',
  REDIS_URL: 'redis://localhost:6379',
};

export interface Doubles {
  dbUp: boolean;
  redisUp: boolean;
}

/** Boots the full Nest app with MongoDB and Redis replaced by controllable doubles. */
export async function createTestApp(
  overrides: Record<string, string> = {},
  doubles: Doubles = { dbUp: true, redisUp: true },
): Promise<{ app: INestApplication; env: ApiEnv }> {
  const env = loadApiEnv({ ...baseRaw, ...overrides });
  const moduleRef = await Test.createTestingModule({ imports: [AppModule.forRoot(env)] })
    .overrideProvider(PrismaService)
    .useValue({
      $runCommandRaw: () =>
        doubles.dbUp
          ? Promise.resolve({ ok: 1 })
          : Promise.reject(new Error('connect ECONNREFUSED mongodb://db:27017')),
      $disconnect: () => Promise.resolve(),
    })
    .overrideProvider(RedisService)
    .useValue({
      ping: () => (doubles.redisUp ? Promise.resolve(true) : Promise.reject(new Error('down'))),
      onModuleInit: () => undefined,
      onModuleDestroy: () => undefined,
    })
    .compile();
  const app = moduleRef.createNestApplication();
  configureApp(app, env);
  await app.init();
  return { app, env };
}

/** Typed accessor: `getHttpServer()` returns `any` in Nest's typings. */
export function httpServer(app: INestApplication): Server {
  return app.getHttpServer() as Server;
}
