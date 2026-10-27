import { DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import type { ApiEnv } from '@nutrirace/shared';
import { AppController } from './app.controller';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { LoggerModule } from './common/logger.module';
import { ENV, EnvModule } from './config/env.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

@Module({})
export class AppModule {
  static forRoot(env: ApiEnv): DynamicModule {
    return {
      module: AppModule,
      imports: [
        EnvModule.forRoot(env),
        LoggerModule,
        PrismaModule,
        RedisModule,
        ThrottlerModule.forRootAsync({
          inject: [ENV],
          useFactory: (config: ApiEnv) => ({
            throttlers: [{ ttl: config.RATE_LIMIT_TTL_MS, limit: config.RATE_LIMIT_LIMIT }],
          }),
        }),
        HealthModule,
      ],
      controllers: [AppController],
      providers: [
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
      ],
    };
  }
}
