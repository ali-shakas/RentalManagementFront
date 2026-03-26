export interface AccountManager {
  id: string;
  userName: string;
  email: string;
  nameAr?: string;
  nameEn?: string;
  isActive: boolean;
  isAdmin: boolean;
  roles: (string | null)[];
}

