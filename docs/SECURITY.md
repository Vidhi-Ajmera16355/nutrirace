# Security

## Implemented in Phase 1

- Secrets only via environment; `.env` is git-ignored; `.env.example` has placeholders only.
- Startup validation (zod). In production, `FRONTEND_URL`, `BACKEND_URL`, `DATABASE_URL`, `REDIS_URL` and `AUTH_SECRET` must be set explicitly; `AUTH_SECRET` must be ≥ 32 characters and not a development default or placeholder; CORS wildcards are rejected. Error messages never echo values.
- Helmet security headers on the API; CSP/frame/nosniff/referrer headers on the web app. `X-Powered-By` removed.
- CORS allow-list derived from `FRONTEND_URL` and `CORS_ORIGINS`.
- Rate limiting (`@nestjs/throttler`, default 100 requests/60 s per client). The store is in-memory per process; a Redis-backed store is required before running multiple API replicas (tracked for a later phase). Set `TRUST_PROXY=true` only behind a trusted reverse proxy.
- Global validation pipe: whitelist, reject unknown fields, transform.
- Logs exclude bodies; sensitive keys are redacted.
- Containers run as the non-root `node` user.
- `NEXT_PUBLIC_*` is used only for the public API URL. Never put secrets there.
- CI: `pnpm audit --prod --audit-level=high` and GitHub dependency review.

## Dependency overrides

`pnpm-workspace.yaml` pins patched versions of `multer`, `js-yaml` and `deepmerge-ts` (transitive) because advisories were open against the versions resolved by their parents at build time. Remove each override when the parent ships the fix.

## Not yet implemented (later phases)

Authentication, authorization, session management, CSRF strategy, audit logging, Redis-backed rate limiting, secrets-manager integration, error reporting (`SENTRY_DSN` is reserved, unused).

## Reporting

Report vulnerabilities privately to the repository owners; do not open public issues.
