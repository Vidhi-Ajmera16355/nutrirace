import { BadRequestException, HttpException, type ArgumentsHost } from '@nestjs/common';
import type { ApiErrorResponse } from '@nutrirace/shared';
import { AllExceptionsFilter } from './all-exceptions.filter';
import type { AppLogger } from './app-logger';

function run(exception: unknown): { status: number; body: ApiErrorResponse; logged: boolean } {
  let status = 0;
  let body: ApiErrorResponse | undefined;
  let logged = false;
  const logger = { pino: { error: () => (logged = true) } } as unknown as AppLogger;
  const res = {
    locals: { requestId: 'rid-1' },
    status(code: number) {
      status = code;
      return this;
    },
    json(payload: ApiErrorResponse) {
      body = payload;
    },
  };
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ originalUrl: '/api/v1/x?secret=1' }),
      getResponse: () => res,
    }),
  } as unknown as ArgumentsHost;
  new AllExceptionsFilter(logger).catch(exception, host);
  return { status, body: body as ApiErrorResponse, logged };
}

describe('AllExceptionsFilter', () => {
  it('maps HttpExceptions and strips the query string from path', () => {
    const { status, body } = run(new HttpException('Nope', 404));
    expect(status).toBe(404);
    expect(body).toMatchObject({
      code: 'NOT_FOUND',
      message: 'Nope',
      path: '/api/v1/x',
      requestId: 'rid-1',
    });
  });

  it('preserves validation details', () => {
    const { body } = run(
      new BadRequestException({
        code: 'VALIDATION_FAILED',
        message: 'Request validation failed.',
        details: [{ field: 'email', message: 'must be an email' }],
      }),
    );
    expect(body.code).toBe('VALIDATION_FAILED');
    expect(body.details).toEqual([{ field: 'email', message: 'must be an email' }]);
  });

  it('hides internal error messages and logs them', () => {
    const { status, body, logged } = run(new Error('db password is hunter2'));
    expect(status).toBe(500);
    expect(body.message).toBe('An unexpected error occurred.');
    expect(JSON.stringify(body)).not.toContain('hunter2');
    expect(logged).toBe(true);
  });
});
