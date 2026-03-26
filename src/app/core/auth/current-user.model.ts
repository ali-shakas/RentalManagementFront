export interface CurrentUser {
  id: string | null;
  username: string | null;
  name: string | null;
  nameEn: string | null;
  email: string | null;
  branchId: string | null;
  fleetId: string | null;
  roles: string[];
  privileges: string[];
  rawClaims: Record<string, unknown>;
}
