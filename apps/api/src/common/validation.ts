import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { API_ERROR_CODES, type ApiErrorDetail } from '@nutrirace/shared';

function flatten(errors: ValidationError[], parent = ''): ApiErrorDetail[] {
  return errors.flatMap((error) => {
    const field = parent ? `${parent}.${error.property}` : error.property;
    const own = Object.values(error.constraints ?? {}).map((message) => ({ field, message }));
    return [...own, ...flatten(error.children ?? [], field)];
  });
}

/** Global request validation: strips unknown fields, rejects them, and reports uniformly. */
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors: ValidationError[]) =>
      new BadRequestException({
        code: API_ERROR_CODES.validationFailed,
        message: 'Request validation failed.',
        details: flatten(errors),
      }),
  });
}
