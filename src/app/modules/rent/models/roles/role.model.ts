import type { PrivilegeTypeLookup } from '../privileges/privilege.model';

export interface PrivilegeTypeRole {
  privilegeTypeLookupId: string;
  roleLookupId: string;
  privilegeTypeLookup?: PrivilegeTypeLookup;
}

export interface RoleLookup {
  id: string;
  name: string;
  displayName: string;
  displayNameEn: string;
  companyId?: string;
  privilegeTypeIds?: string[];
  privilegeTypeRoles?: PrivilegeTypeRole[];
}

export interface RoleCreateRequest {
  name: string;
  displayName: string;
  displayNameEn: string;
  privilegeTypeIds: string[];
}

export interface RoleUpdateRequest extends RoleCreateRequest {
  id: string;
}

