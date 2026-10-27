# Acceptance criteria — Phase 1

Verification evidence lives in `IMPLEMENTATION_STATUS.md`.

1. Monorepo installs from the committed lockfile (`pnpm install --frozen-lockfile`).
2. TypeScript strict mode is enabled in every package.
3. The web application builds.
4. The API compiles and starts.
5. `/api/v1/health` and `/api/v1/ready` return the responses documented in `API.md`.
6. Configuration validation rejects invalid production settings.
7. Prisma client generation works.
8. Migrations execute against a disposable database.
9. PostgreSQL and Redis become healthy in Docker Compose.
10. The worker starts, processes a real job, and shuts down cleanly.
11. CI scripts reference real commands.
12. No credentials are committed.
13. Documentation distinguishes planned from implemented/verified capabilities.
