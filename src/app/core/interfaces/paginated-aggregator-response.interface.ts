export interface PaginatedAggregatorResponse<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  
}
