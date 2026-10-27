# NutriRace

Social diet planning and healthy-habit tracking. **Status: Phase 1 — foundation only.** The product features (accounts, planner, tracking, chat, leaderboards, reminders) are planned, not built. See [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md) for what is verified.

## Stack

TypeScript (strict) · pnpm workspaces · Next.js 16 / React 19 / Tailwind CSS 4 · NestJS 11 · Prisma 6 + MongoDB · Redis 7 + BullMQ · Socket.IO (installed, not yet used) · Jest + Supertest · Playwright · Docker · GitHub Actions

## Layout

```
apps/web      Next.js frontend
apps/api      NestJS REST API (+ prisma/ schema, seed)
apps/worker   BullMQ worker
packages/shared   env validation, logger, shared types
packages/config   tsconfig / eslint / prettier presets
docs          documentation and ADRs
```

## Quick start

Requirements: Node ≥ 22.12, pnpm ≥ 10 (`corepack enable`), Docker (for Redis).

```bash
cp .env.example .env        # fill in DATABASE_URL (MongoDB Atlas or local) and AUTH_SECRET
pnpm setup                  # install from lockfile, build shared, generate Prisma client
pnpm infra:up               # Redis via Docker (waits until healthy)
pnpm db:seed                # seed initial system_metadata documents
pnpm dev                    # web :3000, api :4000, worker health :4001
```

- Web: http://localhost:3000 · Design system: http://localhost:3000/styleguide
- API: http://localhost:4000/api/v1 · Docs: http://localhost:4000/api/docs · Health: `/api/v1/health` · Ready: `/api/v1/ready`

## Commands

| Task           | Command                                                 |
| -------------- | ------------------------------------------------------- |
| Run apps       | `pnpm dev`, `dev:web`, `dev:api`, `dev:worker`          |
| Infrastructure | `pnpm infra:up`, `infra:down`, `infra:logs`             |
| Prisma         | `db:generate`, `db:seed`                                |
| Quality        | `lint`, `format`, `format:check`, `typecheck`           |
| Tests          | `test`, `test:api`, `test:integration`, `test:e2e`      |
| Build / audit  | `build`, `audit:prod`                                   |

## Configuration

See `.env.example`. Required variables:

| Variable       | Description                                             |
| -------------- | ------------------------------------------------------- |
| `DATABASE_URL` | MongoDB connection string (Atlas or local)              |
| `REDIS_URL`    | Redis URL (default: `redis://localhost:6379`)           |
| `AUTH_SECRET`  | Random string ≥ 32 chars (generate: `openssl rand -base64 48`) |

## Documentation

[PRD](docs/PRD.md) · [Architecture](docs/ARCHITECTURE.md) · [Database](docs/DATABASE.md) · [API](docs/API.md) · [Security](docs/SECURITY.md) · [Privacy](docs/PRIVACY.md) · [Testing](docs/TESTING.md) · [Deployment](docs/DEPLOYMENT.md) · [Operations](docs/OPERATIONS.md) · [Acceptance criteria](docs/ACCEPTANCE_CRITERIA.md) · [ADRs](docs/adr/README.md)
