import pino, { type Logger, type LoggerOptions } from 'pino';

export type { Logger };

/**
 * Paths whose values are never written to logs. Request bodies are not logged at all;
 * this list is a second line of defence for headers and ad-hoc objects.
 */
export const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'headers.authorization',
  'headers.cookie',
  '*.password',
  '*.token',
  '*.secret',
  '*.authSecret',
  '*.databaseUrl',
  '*.redisUrl',
  'DATABASE_URL',
  'REDIS_URL',
  'AUTH_SECRET',
];

export interface CreateLoggerOptions {
  service: string;
  level: string;
  destination?: pino.DestinationStream;
}

export function createLogger({ service, level, destination }: CreateLoggerOptions): Logger {
  const options: LoggerOptions = {
    level,
    base: { service },
    redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
    timestamp: pino.stdTimeFunctions.isoTime,
  };
  return destination ? pino(options, destination) : pino(options);
}
