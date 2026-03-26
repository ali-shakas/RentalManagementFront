export interface PaginatedResponse<T> {
  fileName: string;
  fileContent: any;
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
}
