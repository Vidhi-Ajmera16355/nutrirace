import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { ApiEnv } from '@nutrirace/shared';
import Redis from 'ioredis';
import { AppLogger } from '../common/app-logger';
import { ENV } from '../config/env.module';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly client: Redis;

  constructor(
    @Inject(ENV) env: ApiEnv,
    private readonly logger: AppLogger,
  ) {
    // Fail fast while disconnected (no offline queue) so readiness reports "down" quickly;
    // ioredis keeps reconnecting in the background.
    this.client = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
    });
    this.client.on('error', (error: Error) => {
      this.logger.warn(`Redis connection error: ${error.message}`, 'RedisService');
    });
  }

  onModuleInit(): void {
    void this.client.connect().catch(() => undefined); // errors surface via the 'error' event
  }

  async ping(): Promise<boolean> {
    return (await this.client.ping()) === 'PONG';
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.client.quit();
    } catch {
      this.client.disconnect();
    }
  }
}
