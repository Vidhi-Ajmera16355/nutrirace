import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import {
  API_ERROR_CODES,
  type ApiErrorCode,
  type ApiErrorDetail,
  type ApiErrorResponse,
} from '@nutrirace/shared';
import type { Request, Response } from 'express';
import { AppLogger } from './app-logger';
import { getRequestId } from './request-context';

const CODE_BY_STATUS: Record<number, ApiErrorCode> = {
  400: API_ERROR_CODES.badRequest,
  401: API_ERROR_CODES.unauthorized,
  403: API_ERROR_CODES.forbidden,
  404: API_ERROR_CODES.notFound,
  409: API_ERROR_CODES.conflict,
  429: API_ERROR_CODES.rateLimited,
};

interface Normalized {
  statusCode: number;
  code: ApiErrorCode;
  message: string;
  details?: ApiErrorDetail[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Converts every thrown value into the documented {@link ApiErrorResponse} shape. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const normalized = this.normalize(exception);

    if (normalized.statusCode >= 500) {
      this.logger.pino.error(
        {
          requestId: getRequestId(res),
          err:
            exception instanceof Error
              ? { name: exception.name, stack: exception.stack }
              : undefined,
        },
        'unhandled exception',
      );
    }

    const body: ApiErrorResponse = {
      ...normalized,
      requestId: getRequestId(res),
      timestamp: new Date().toISOString(),
      path: req.originalUrl.split('?')[0] ?? '',
    };
    res.status(normalized.statusCode).json(body);
  }

  private normalize(exception: unknown): Normalized {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const response = exception.getResponse();
      let message = exception.message;
      let code: ApiErrorCode = CODE_BY_STATUS[statusCode] ?? API_ERROR_CODES.badRequest;
      let details: ApiErrorDetail[] | undefined;

      if (isRecord(response)) {
        if (typeof response['message'] === 'string') message = response['message'];
        if (response['code'] === API_ERROR_CODES.validationFailed) {
          code = API_ERROR_CODES.validationFailed;
        }
        if (Array.isArray(response['details'])) details = response['details'] as ApiErrorDetail[];
      }
      if (statusCode >= 500) {
        return {
          statusCode,
          code: API_ERROR_CODES.internal,
          message: 'An unexpected error occurred.',
        };
      }
      return { statusCode, code, message, ...(details ? { details } : {}) };
    }
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: API_ERROR_CODES.internal,
      message: 'An unexpected error occurred.',
    };
  }
}
