import { RoleLookup } from './role.model';

function pick<T>(source: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const key of keys) {
    if (key in source && source[key] !== undefined && source[key] !== null) {
      return source[key] as T;
    }
  }
  return undefined;
}

export function normalizeRole(raw: unknown): RoleLookup {
  const source = (raw ?? {}) as Record<string, unknown>;
  return {
    id: String(pick(source, 'id', 'Id') ?? ''),
    name: String(pick(source, 'name', 'Name') ?? ''),
    displayName: String(pick(source, 'displayName', 'DisplayName') ?? ''),
    displayNameEn: String(pick(source, 'displayNameEn', 'DisplayNameEn') ?? ''),
    companyId: pick<string>(source, 'companyId', 'CompanyId'),
    privilegeTypeRoles: pick(source, 'privilegeTypeRoles', 'PrivilegeTypeRoles'),
  };
}
