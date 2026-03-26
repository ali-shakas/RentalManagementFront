import { User } from './user.model';

function pick<T>(source: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const key of keys) {
    if (key in source && source[key] !== undefined && source[key] !== null) {
      return source[key] as T;
    }
  }
  return undefined;
}

export function normalizeUser(raw: unknown): User {
  const source = (raw ?? {}) as Record<string, unknown>;
  return {
    id: String(pick(source, 'id', 'Id') ?? ''),
    userName: String(pick(source, 'userName', 'UserName') ?? ''),
    email: String(pick(source, 'email', 'Email') ?? ''),
    password: pick<string>(source, 'password', 'Password'),
    nameAr: pick<string>(source, 'nameAr', 'NameAr'),
    nameEn: pick<string>(source, 'nameEn', 'NameEn'),
    isActive: Boolean(pick(source, 'isActive', 'IsActive') ?? false),
    isAdmin: pick<boolean>(source, 'isAdmin', 'IsAdmin'),
    expirationDate: pick<string>(source, 'expirationDate', 'ExpirationDate'),
    appId: pick<string>(source, 'appId', 'AppId'),
    companyId: pick<string>(source, 'companyId', 'CompanyId'),
    connectionId: pick<string>(source, 'connectionId', 'ConnectionId'),
    connected: pick<boolean>(source, 'connected', 'Connected'),
    connectionDate: pick<string>(source, 'connectionDate', 'ConnectionDate'),
    disconnectionDate: pick<string>(source, 'disconnectionDate', 'DisconnectionDate'),
    currentViewingPageUrl: pick<string>(source, 'currentViewingPageUrl', 'CurrentViewingPageUrl'),
    enableAlert: pick<boolean>(source, 'enableAlert', 'EnableAlert'),
    enableMobileAlerts: pick<boolean>(source, 'enableMobileAlerts', 'EnableMobileAlerts'),
    branchId: pick<number>(source, 'branchId', 'BranchId'),
    branchNameAr: pick<string>(source, 'branchNameAr', 'BranchNameAr'),
    branchNameEn: pick<string>(source, 'branchNameEn', 'BranchNameEn'),
    userRoles: pick(source, 'userRoles', 'UserRoles'),
    userPrivileges: pick(source, 'userPrivileges', 'UserPrivileges'),
  };
}
