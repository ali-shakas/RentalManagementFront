import { PaginatedAggregatorResponse } from '../../core/interfaces';

function pick<T>(source: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const key of keys) {
    if (key in source && source[key] !== undefined && source[key] !== null) {
      return source[key] as T;
    }
  }
  return undefined;
}

export function normalizePaginatedResponse<T>(
  raw: unknown,
  mapItem: (item: unknown) => T = item => item as T,
): PaginatedAggregatorResponse<T> {
  const source = (raw ?? {}) as Record<string, unknown>;
  const itemsRaw = (pick<unknown[]>(source, 'items', 'Items') ?? []) as unknown[];

  return {
    items: itemsRaw.map(mapItem),
    totalCount: Number(pick(source, 'totalCount', 'TotalCount') ?? itemsRaw.length),
    pageNumber: Number(pick(source, 'pageNumber', 'PageNumber') ?? 1),
    pageSize: Number(pick(source, 'pageSize', 'PageSize') ?? itemsRaw.length),
    totalPages: Number(pick(source, 'totalPages', 'TotalPages') ?? 1),
  };
}
