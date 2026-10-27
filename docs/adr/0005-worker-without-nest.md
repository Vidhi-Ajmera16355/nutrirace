# 0005 — Worker without NestJS

**Context:** the worker needs queue processors, graceful shutdown and a health endpoint, not an HTTP framework.
**Decision:** plain Node with BullMQ; queues registered from one list; a tiny `http` health server.
**Consequences:** small footprint and fast startup. If processors later need shared domain services, revisit (Nest standalone application context).
