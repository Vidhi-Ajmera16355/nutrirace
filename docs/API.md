# API

Base path: `/api/v1`. OpenAPI/Swagger UI: `/api/docs` (JSON: `/api/docs-json`). Swagger is enabled outside production and disabled in production unless `SWAGGER_ENABLED=true`.

## Implemented endpoints (Phase 1)

| Method | Path             | Description                                | Success | Failure                       |
| ------ | ---------------- | ------------------------------------------ | ------- | ----------------------------- |
| GET    | `/api/v1`        | API name and version                       | 200     | 429 when rate limited         |
| GET    | `/api/v1/health` | Liveness (process is up)                   | 200     | —                             |
| GET    | `/api/v1/ready`  | Readiness (PostgreSQL and Redis reachable) | 200     | 503 when a dependency is down |

Health and readiness are excluded from rate limiting.

### `GET /api/v1/health`

```json
{
  "status": "ok",
  "service": "api",
  "version": "0.1.0",
  "uptimeSeconds": 12,
  "timestamp": "2026-10-27T00:00:00.000Z"
}
```

### `GET /api/v1/ready`

```json
{
  "status": "ready",
  "checks": { "database": "up", "redis": "up" },
  "timestamp": "2026-10-27T00:00:00.000Z"
}
```

When a dependency is down the status is `503`, `status` is `not_ready` and the failing check is `down`. No error text, hostnames or credentials are ever included.

## Error format

```json
{
  "statusCode": 404,
  "code": "NOT_FOUND",
  "message": "Cannot GET /api/v1/x",
  "details": [{ "field": "email", "message": "must be an email" }],
  "requestId": "d9175632-a33d-4ca1-a5f7-bf381ecf5860",
  "timestamp": "2026-10-27T00:00:00.000Z",
  "path": "/api/v1/x"
}
```

`details` is present for validation failures (`code: VALIDATION_FAILED`). Unexpected server errors always return the generic message `An unexpected error occurred.`

## Correlation ids

Send `X-Request-Id` (8–128 chars of `A-Za-z0-9._-`) or one is generated. It is echoed on every response and appears in logs and error bodies.
