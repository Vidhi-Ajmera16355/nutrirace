import { Injectable, type LoggerService } from '@nestjs/common';
import { createLogger, type ApiEnv, type Logger } from '@nutrirace/shared';

/**
 * Nest LoggerService backed by pino. It only ever logs messages and error stacks that
 * application code passes in — never request bodies — and pino redacts sensitive keys.
 */
@Injectable()
export class AppLogger implements LoggerService {
  readonly pino: Logger;

  constructor(env: Pick<ApiEnv, 'LOG_LEVEL'>) {
    this.pino = createLogger({ service: 'api', level: env.LOG_LEVEL });
  }

  log(message: unknown, context?: string): void {
    this.pino.info({ context }, this.text(message));
  }
  error(message: unknown, stack?: string, context?: string): void {
    this.pino.error({ context, stack }, this.text(message));
  }
  warn(message: unknown, context?: string): void {
    this.pino.warn({ context }, this.text(message));
  }
  debug(message: unknown, context?: string): void {
    this.pino.debug({ context }, this.text(message));
  }
  verbose(message: unknown, context?: string): void {
    this.pino.trace({ context }, this.text(message));
  }

  private text(message: unknown): string {
    return typeof message === 'string' ? message : JSON.stringify(message);
  }
}
