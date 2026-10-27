import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const databaseUrl = process.env['DATABASE_URL'];
const redisUrl = process.env['REDIS_URL'];

describe('real infrastructure', () => {
  it('requires DATABASE_URL and REDIS_URL', () => {
    expect(databaseUrl).toBeDefined();
    expect(redisUrl).toBeDefined();
  });

  it('MongoDB has the migrated schema and seed data', async () => {
    const prisma = new PrismaClient();
    try {
      const rows = await prisma.systemMetadata.findMany({ orderBy: { key: 'asc' } });
      expect(rows.map((r) => [r.key, r.value])).toEqual([
        ['schema_phase', '1'],
        ['seed_version', '1'],
      ]);
    } finally {
      await prisma.$disconnect();
    }
  });

  it('Redis answers PING', async () => {
    const redis = new Redis(redisUrl ?? 'redis://localhost:6379');
    try {
      expect(await redis.ping()).toBe('PONG');
    } finally {
      redis.disconnect();
    }
  });
});
