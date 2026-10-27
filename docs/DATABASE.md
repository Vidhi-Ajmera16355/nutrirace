# Database

PostgreSQL 16, accessed through Prisma 6 using the Rust-free client (`engineType = "client"`) with the `@prisma/adapter-pg` driver adapter (see ADR 0003).

## Ownership

- Schema: `apps/api/prisma/schema.prisma` (single source of truth)
- Migrations: `apps/api/prisma/migrations/`
- Seed: `apps/api/prisma/seed.ts` (deterministic and idempotent)

## Phase 1 schema

| Table             | Purpose                                                      |
| ----------------- | ------------------------------------------------------------ |
| `system_metadata` | Key/value platform metadata (`schema_phase`, `seed_version`) |

Later phases extend the schema through **additive** migrations only.

## Commands

```bash
pnpm infra:up              # PostgreSQL + Redis via Docker Compose
pnpm db:generate           # prisma generate
pnpm db:migrate            # prisma migrate dev  (local development; creates migrations)
pnpm db:migrate:deploy     # prisma migrate deploy (CI / production)
pnpm db:migrate:status
pnpm db:seed
```

`prisma db push` is **not** used and must never be used for deployment.

## Authoring migrations

Change `schema.prisma`, run `pnpm db:migrate -- --name <change>`, review the SQL, commit the folder. CI applies migrations to a clean database and then runs `prisma migrate diff --exit-code` to fail if `schema.prisma` and the migrations disagree.

> Note: the initial migration (`20261027000000_init`) was written by hand in Prisma's output format because the authoring sandbox could not download Prisma's schema engine. The CI drift check is the safeguard that it matches the schema.
