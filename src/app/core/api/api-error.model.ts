export interface NormalizedApiError {
  status: number;
  message: string;
  errors: string[];
  propertyErrors: Record<string, string[]>;
  isValidation: boolean;
  isUnauthorized: boolean;
  isForbidden: boolean;
  raw?: unknown;
}
