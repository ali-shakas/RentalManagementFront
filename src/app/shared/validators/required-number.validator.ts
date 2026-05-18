import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface RequiredNumberOptions {
  min?: number;
  max?: number;
}

export function isEmptyNumericValue(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

export function coerceFormNumber(value: unknown, fallback = 0): number {
  if (isEmptyNumericValue(value)) {
    return fallback;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

/** Required numeric field — empty until the user enters a value (no default 0). */
export function requiredNumber(options: RequiredNumberOptions = {}): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (isEmptyNumericValue(control.value)) {
      return { required: true };
    }

    const numeric = Number(control.value);
    if (!Number.isFinite(numeric)) {
      return { number: true };
    }

    if (options.min !== undefined && numeric < options.min) {
      return { min: { min: options.min, actual: numeric } };
    }

    if (options.max !== undefined && numeric > options.max) {
      return { max: { max: options.max, actual: numeric } };
    }

    return null;
  };
}
