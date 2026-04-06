import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface CountingAccountTypeRange {
  accountType: number;
  min: number;
  max: number;
  labelKey: string;
}

export interface CountingNumberOutOfRangeError {
  min: number;
  max: number;
  actual: number;
  accountType: number;
  typeLabelKey: string;
}

const ACCOUNT_TYPE_CODE_RANGES: Record<number, CountingAccountTypeRange> = {
  1: { accountType: 1, min: 1000, max: 1999, labelKey: 'Assets' },
  2: { accountType: 2, min: 2000, max: 2999, labelKey: 'Liabilities' },
  3: { accountType: 3, min: 3000, max: 3999, labelKey: 'Equity' },
  4: { accountType: 4, min: 4000, max: 4999, labelKey: 'Revenue' },
  5: { accountType: 5, min: 5000, max: 5999, labelKey: 'Expenses' },
};

export function getCountingAccountTypeRange(accountType: unknown): CountingAccountTypeRange | null {
  const normalizedType = Number(accountType);
  if (!Number.isFinite(normalizedType) || normalizedType <= 0) {
    return null;
  }

  return ACCOUNT_TYPE_CODE_RANGES[normalizedType] ?? null;
}

export function countingNumberByTypeValidator(
  numberControlName: string = 'countingNumber',
  typeControlName: string = 'countingType',
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const numberControl = control.get(numberControlName);
    const typeControl = control.get(typeControlName);

    if (!numberControl || !typeControl) {
      return null;
    }

    const range = getCountingAccountTypeRange(typeControl.value);
    if (!range) {
      return null;
    }

    const accountNumber = Number(numberControl.value);
    if (!Number.isFinite(accountNumber) || accountNumber <= 0) {
      return null;
    }

    if (accountNumber < range.min || accountNumber > range.max) {
      return {
        countingNumberOutOfRange: {
          min: range.min,
          max: range.max,
          actual: accountNumber,
          accountType: range.accountType,
          typeLabelKey: range.labelKey,
        } satisfies CountingNumberOutOfRangeError,
      };
    }

    return null;
  };
}
