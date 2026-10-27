import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { AppLogger } from './app-logger';

export const REQUEST_ID_HEADER = 'x-request-id';
const VALID_REQUEST_ID = /^[A-Za-z0-9._-]{8,128}$/;

export function getRequestId(res: Response): string {
  const value: unknown = res.locals['requestId'];
  return typeof value === 'string' ? value : 'unknown';
}

/** Accepts a well-formed inbound X-Request-Id or mints a UUID, and echoes it on the response. */
export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header(REQUEST_ID_HEADER);
  const id = incoming && VALID_REQUEST_ID.test(incoming) ? incoming : randomUUID();
  res.locals['requestId'] = id;
  res.setHeader('X-Request-Id', id);
  next();
}

/** Logs one line per request: method, path (no query string), status, duration, request id. */
export function createRequestLogger(logger: AppLogger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startedAt = process.hrtime.bigint();
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
      logger.pino.info(
        {
          requestId: getRequestId(res),
          method: req.method,
          path: req.originalUrl.split('?')[0],
          statusCode: res.statusCode,
          durationMs: Math.round(durationMs * 10) / 10,
        },
        'request completed',
      );
    });
    next();
  };
}
