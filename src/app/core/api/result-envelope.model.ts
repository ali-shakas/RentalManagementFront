export interface PropertyErrorMap {
  [key: string]: string[];
}

export interface ResultEnvelope<T> {
  data: T;
  succeeded: boolean;
  errors?: string[] | null;
  propertyErrors?: PropertyErrorMap | null;
  httpStatusCode?: number | null;
}
