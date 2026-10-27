# 0001 — pnpm monorepo

**Context:** web, API and worker share types, tooling and release cadence.
**Decision:** pnpm workspaces (`apps/*`, `packages/*`), exact toolchain via `packageManager`, one lockfile.
**Consequences:** single install and CI pipeline; `@nutrirace/shared` must be built before dependants (`pnpm prep`). Dependency direction is one-way: apps → shared.
