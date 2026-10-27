# Operations

## Probes

| Service | Liveness             | Readiness                                                                        |
| ------- | -------------------- | -------------------------------------------------------------------------------- |
| api     | `GET /api/v1/health` | `GET /api/v1/ready` (503 if PostgreSQL or Redis is down)                         |
| worker  | `GET :4001/health`   | `GET :4001/ready` (Redis reachable and workers running; 503 while shutting down) |
| web     | `GET /healthz`       | same                                                                             |

## Logging

JSON on stdout. Correlate with `requestId` (API) / `jobId` (worker). Level via `LOG_LEVEL`.

## Shutdown

API: Nest shutdown hooks close the HTTP server, Prisma pool and Redis. Worker: stops accepting health traffic, waits for active jobs, closes workers and Redis (30 s hard timeout). Both exit 0 on SIGTERM/SIGINT.

## Runbook snippets

- **API not ready:** check `/api/v1/ready` to see which dependency is `down`, then PostgreSQL/Redis health and network access.
- **Jobs not processed:** check worker `/ready` and logs; verify `REDIS_URL` and the queue prefix.
- **Rate-limit complaints behind a proxy:** verify `TRUST_PROXY`.

Backups, alerting and error reporting (Sentry) are not configured yet.
