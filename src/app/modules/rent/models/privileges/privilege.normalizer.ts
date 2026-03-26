import { PrivilegeTypeLookup } from './privilege.model';

function pick<T>(source: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const key of keys) {
    if (key in source && source[key] !== undefined && source[key] !== null) {
      return source[key] as T;
    }
  }
  return undefined;
}

export function normalizePrivilege(raw: unknown): PrivilegeTypeLookup {
  const source = (raw ?? {}) as Record<string, unknown>;
  return {
    id: String(pick(source, 'id', 'Id') ?? ''),
    name: String(pick(source, 'name', 'Name') ?? ''),
    nameEn: String(pick(source, 'nameEn', 'NameEn') ?? ''),
    privilegeName: String(pick(source, 'privilegeName', 'PrivilegeName') ?? ''),
    order: pick<number>(source, 'order', 'Order'),
    editable: pick<boolean>(source, 'editable', 'Editable'),
    companyId: pick<string>(source, 'companyId', 'CompanyId'),
  };
}
