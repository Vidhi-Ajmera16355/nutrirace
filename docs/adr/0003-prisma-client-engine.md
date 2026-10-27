# 0003 — Rust-free Prisma client

**Context:** the default client downloads native query-engine binaries at install/generate time.
**Decision:** `engineType = "client"` with `@prisma/adapter-pg` (node-postgres). Migrations still use Prisma's schema engine via the CLI.
**Consequences:** smaller images, fewer native downloads at runtime; connection pooling is configured through `pg`. `prisma generate` and `migrate` still fetch the schema engine on first use, so CI/build hosts need access to `binaries.prisma.sh`.
