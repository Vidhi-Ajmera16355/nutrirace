# Deployment

## Images

```bash
docker build -f apps/api/Dockerfile    -t nutrirace-api .
docker build -f apps/worker/Dockerfile -t nutrirace-worker .
docker build -f apps/web/Dockerfile    -t nutrirace-web --build-arg NEXT_PUBLIC_API_URL=https://api.example.org/api/v1 .
```

Multi-stage builds; runtime stages run as the non-root `node` user and define `HEALTHCHECK`s (`/api/v1/health`, worker `:4001/health`, web `/healthz`).

## Release order

1. Run migrations **once per release** from the API image: `node_modules/.bin/prisma migrate deploy --schema prisma/schema.prisma` (the compose `migrate` service does this locally).
2. Start/rollout the API and worker, then the web app.
3. Gate traffic on `/api/v1/ready`.

Never use `prisma db push` for deployments. Migrations must be backwards-compatible with the previous release (additive first, destructive in a later release).

## Required production environment

`NODE_ENV=production`, `FRONTEND_URL`, `BACKEND_URL`, `DATABASE_URL`, `REDIS_URL`, `AUTH_SECRET` (≥ 32 random chars). Startup fails fast otherwise. Inject through the platform's secret store, not files.

## Local full-stack in containers

```bash
cp .env.example .env   # then edit placeholders
docker compose --profile apps up --build
```

> Status: image builds and the compose stack were **not** executed in the authoring environment (no Docker). CI builds all images and starts the compose infrastructure.
