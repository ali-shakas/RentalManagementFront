export interface PrivilegeTypeLookup {
  id: string;
  name: string;
  nameEn: string;
  privilegeName: string;
  order?: number;
  editable?: boolean;
  companyId?: string;
  displayName?: string;
  displayNameEn?: string;
}

export interface PrivilegeTypeCreateRequest {
  name: string;
  nameEn: string;
  privilegeName: string;
  order: number;
}

export interface PrivilegeTypeUpdateRequest extends PrivilegeTypeCreateRequest {
  id: string;
}

export interface PrivilegeRoleItem {
  privilegeTypeId: string;
  privilegeName?: string;
  isAssigned: boolean;
}
