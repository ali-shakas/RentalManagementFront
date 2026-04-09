import type { RoleLookup } from '../roles/role.model';

export interface UserRole {
  roleLookupId: string;
  userId: string;
}

export interface UserPrivilege {
  privilegeTypeId: string;
  isActive: boolean;
}

export interface User {
  id: string;
  userName: string;
  email: string;
  password?: string;
  nameAr?: string;
  nameEn?: string;
  isActive: boolean;
  isAdmin?: boolean;
  expirationDate?: string;
  appId?: string;
  companyId?: string;
  connectionId?: string;
  connected?: boolean;
  connectionDate?: string;
  disconnectionDate?: string;
  currentViewingPageUrl?: string;
  enableAlert?: boolean;
  enableMobileAlerts?: boolean;
  branchId?: number;
  branchNameAr?: string;
  branchNameEn?: string;
  fleetId?: string;
  roles?: RoleLookup[];
  userRoles?: UserRole[];
  userPrivileges?: UserPrivilege[];
  roleIds?: string[];
  privilegeTypeIds?: string[];
}

export interface UserCreateRequest {
  userName: string;
  email: string;
  password: string;
  nameAr?: string;
  nameEn?: string;
  isActive: boolean;
  expirationDate?: string;
  branchId?: number;
  fleetId?: string;
  rolesId: string[];
}

export interface UserUpdateRequest extends UserCreateRequest {
  id: string;
}

export interface UserPrivilegesRequest {
  userId: string;
  privilegeTypeIds: string[];
  userPrivileges?: UserPrivilege[];
}

export interface PaginatedRequest {
  pageNumber: number;
  pageSize: number;
  search?: string;
  fleetId?: string;
}

