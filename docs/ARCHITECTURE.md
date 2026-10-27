# Architecture

## Overview

```
 Browser ──HTTP──▶ apps/web (Next.js) ──HTTP──▶ apps/api (NestJS, /api/v1) ──▶ PostgreSQL (Prisma)
                                                    │  └────────────────────▶ Redis
                                                    └─ enqueue (later phases) ─▶ Redis/BullMQ ◀── apps/worker
```

Socket.IO packages are installed in the API and the gateway layer is intentionally **not** implemented yet; real-time features arrive in a later phase.

## Repository layout

| Path              | Responsibility                                                                        |
| ----------------- | ------------------------------------------------------------------------------------- |
| `apps/web`        | Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui-style primitives         |
| `apps/api`        | NestJS 11 REST API, owns the Prisma schema, migrations and seed (`apps/api/prisma`)   |
| `apps/worker`     | Standalone BullMQ worker process (plain Node, no Nest) with its own health server     |
| `packages/shared` | Zod-validated env loading, pino logger, error/health types, queue names. Built to CJS |
| `packages/config` | Shared `tsconfig.base.json`, ESLint flat config, Prettier config                      |
| `docs`            | Documentation and ADRs                                                                |

Dependency direction is strictly `apps/* → packages/shared → (nothing)`. `packages/config` is tooling only. No cycles. The web app does not import `packages/shared` yet (the shared package is Node-only); browser-safe shared types can be split out when the web app first needs them.

## Cross-cutting API behaviour

- URI versioning: `/{API_PREFIX}/v1/...` (default `/api/v1`).
- Middleware order: correlation id → helmet → request log → CORS → throttler guard → validation pipe → controller → global exception filter.
- Every error response has the shape `ApiErrorResponse` (`packages/shared/src/errors.ts`).
- Logs are pino JSON, one line per request (method, path without query string, status, duration, request id). Bodies and headers are never logged; a redaction list guards ad-hoc objects.
- Readiness reports only `up`/`down` per dependency.

## Prisma ownership

One schema: `apps/api/prisma/schema.prisma`. Only the API talks to PostgreSQL. Migrations are additive and applied with `prisma migrate deploy`. See `DATABASE.md` and ADR 0002/0003.

## Worker

`apps/worker` registers queues from a single list (`src/queues.ts`). Phase 1 registers only the `system` diagnostic queue. A job is reported complete only when its processor returned; unknown jobs fail.
