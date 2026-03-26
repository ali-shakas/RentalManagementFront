import { HttpErrorResponse } from '@angular/common/http';

import { NormalizedApiError } from './api-error.model';
import { ResultEnvelope } from './result-envelope.model';

export function unwrapEnvelope<T>(response: ResultEnvelope<T>): T {
  if (!response.succeeded) {
    throw new Error(response.errors?.join(' ') || 'Request failed');
  }

  return response.data;
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (error instanceof HttpErrorResponse) {
    const envelope = error.error ?? {};
    const errors = Array.isArray(envelope.errors)
      ? envelope.errors.map((item: unknown) => String(item))
      : [];
    const propertyErrors =
      envelope.propertyErrors && typeof envelope.propertyErrors === 'object'
        ? (envelope.propertyErrors as Record<string, string[]>)
        : {};
    const validationMessages = Object.values(propertyErrors).flatMap(value =>
      Array.isArray(value) ? value.map(item => String(item)) : [],
    );
    const message =
      errors[0] ||
      validationMessages[0] ||
      envelope.message ||
      error.message ||
      'Unexpected error';

    return {
      status: error.status,
      message: String(message),
      errors,
      propertyErrors,
      isValidation: validationMessages.length > 0 || error.status === 400,
      isUnauthorized: error.status === 401,
      isForbidden: error.status === 403,
      raw: error,
    };
  }

  return {
    status: 0,
    message: error instanceof Error ? error.message : 'Unexpected error',
    errors: error instanceof Error ? [error.message] : [],
    propertyErrors: {},
    isValidation: false,
    isUnauthorized: false,
    isForbidden: false,
    raw: error,
  };
}
