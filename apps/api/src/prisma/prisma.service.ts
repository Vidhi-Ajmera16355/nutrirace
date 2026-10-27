import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Thin wrapper around PrismaClient for MongoDB.
 * The client connects lazily, so the API can start (and report not-ready) while MongoDB is down.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
