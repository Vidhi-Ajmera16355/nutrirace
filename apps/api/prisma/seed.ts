import { PrismaClient } from '@prisma/client';

/** Deterministic development seed: re-running it always converges on the same documents. */
const METADATA: Record<string, string> = {
  schema_phase: '1',
  seed_version: '1',
};

async function main(): Promise<void> {
  const connectionString = process.env['DATABASE_URL'];
  if (!connectionString) throw new Error('DATABASE_URL is not set');
  const prisma = new PrismaClient();
  try {
    for (const [key, value] of Object.entries(METADATA)) {
      await prisma.systemMetadata.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    const count = await prisma.systemMetadata.count();
    console.log(`Seed complete: ${count} system_metadata documents.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('Seed failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
