export interface ApiResponse<T> {
  data: T;
  succeeded: boolean;
  errors: string[];
  propertyErrors: Record<string, string[]>;
  httpStatusCode: number;
}
