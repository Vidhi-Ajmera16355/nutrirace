import { Injectable } from '@nestjs/common';
import type { DependencyState, ReadinessResponse } from '@nutrirace/shared';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const CHECK_TIMEOUT_MS = 2000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error('check failed'));
      },
    );
  });
}

/** Reports only up/down per dependency — never connection strings or error details. */
@Injectable()
export class ReadinessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async check(): Promise<ReadinessResponse> {
    const [database, redis] = await Promise.all([
      this.probe(async () => {
        await this.prisma.$runCommandRaw({ ping: 1 });
        return true;
      }),
      this.probe(() => this.redis.ping()),
    ]);
    const ready = database === 'up' && redis === 'up';
    return {
      status: ready ? 'ready' : 'not_ready',
      checks: { database, redis },
      timestamp: new Date().toISOString(),
    };
  }

  private async probe(fn: () => Promise<boolean>): Promise<DependencyState> {
    try {
      return (await withTimeout(fn(), CHECK_TIMEOUT_MS)) ? 'up' : 'down';
    } catch {
      return 'down';
    }
  }
}
