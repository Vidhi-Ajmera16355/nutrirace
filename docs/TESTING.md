# Testing

| Layer                    | Tool                  | Command                 | Needs                                                             |
| ------------------------ | --------------------- | ----------------------- | ----------------------------------------------------------------- |
| Unit (shared/api/worker) | Jest + ts-jest        | `pnpm test`             | nothing                                                           |
| API HTTP tests           | Jest + Supertest      | `pnpm test:api`         | nothing (PostgreSQL/Redis are test doubles)                       |
| Integration              | Jest, real services   | `pnpm test:integration` | migrated + seeded PostgreSQL, Redis (`DATABASE_URL`, `REDIS_URL`) |
| Browser                  | Playwright + axe-core | `pnpm test:e2e`         | Chromium (`playwright install chromium`)                          |

Static checks: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`.

`pnpm lint|typecheck|test|build` first run `pnpm prep` (builds `@nutrirace/shared`, runs `prisma generate`).

## What is covered

- Env validation (dev defaults, production rejection, secret strength, no value echo).
- Logger redaction; exception filter shape; correlation ids; security headers; CORS; rate limiting; Swagger toggling; health/readiness (up and down).
- Real PostgreSQL schema + seed; real Redis; worker processes a real BullMQ job and shuts down cleanly.
- Browser: landing content, honest "Planned" labelling, skip link, mobile menu, 404, health probe, serious/critical axe violations on `/` and `/styleguide`.

## Rules

No skipped tests to make CI pass; failures are reported as failures.
