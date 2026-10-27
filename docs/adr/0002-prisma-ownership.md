# 0002 — Prisma ownership

**Context:** duplicate schema sources and circular packages are common monorepo failures.
**Decision:** one schema at `apps/api/prisma/schema.prisma`; migrations and seed live beside it. Only the API imports Prisma. Migrations deploy with `prisma migrate deploy`; `db push` is forbidden.
**Consequences:** the worker needs the API (or a future shared data package) for database access. If the worker needs the database, extract a `packages/db` package then — not before.
