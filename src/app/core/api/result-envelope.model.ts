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

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages?: number;
}
