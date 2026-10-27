export const API_ERROR_CODES = {
  badRequest: 'BAD_REQUEST',
  validationFailed: 'VALIDATION_FAILED',
  unauthorized: 'UNAUTHORIZED',
  forbidden: 'FORBIDDEN',
  notFound: 'NOT_FOUND',
  conflict: 'CONFLICT',
  rateLimited: 'RATE_LIMITED',
  internal: 'INTERNAL_ERROR',
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

/** Every non-2xx API response body has this shape. */
export interface ApiErrorResponse {
  statusCode: number;
  code: ApiErrorCode;
  message: string;
  details?: ApiErrorDetail[];
  requestId: string;
  timestamp: string;
  path: string;
}
