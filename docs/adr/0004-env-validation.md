# 0004 — Environment validation

**Context:** misconfiguration should fail at startup, not at first request; secrets must never appear in errors.
**Decision:** zod schemas in `packages/shared/src/env.ts`. Development gets safe defaults (never for `DATABASE_URL`); production requires explicit values and rejects placeholder/weak secrets and wildcard CORS.
**Consequences:** a single implementation shared by API and worker, unit-tested.
