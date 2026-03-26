import type { BaseModel } from './base/base-model';

/**
 * نموذج المستخدم المسجّل (من الـ Store أو بعد تسجيل الدخول).
 * مطابق للدليل: shared/models/logged.user.model.ts
 */
export interface LoggedUser extends BaseModel {
  id?: string;
  userName?: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  email?: string;
  isActive?: boolean;
  isAdmin?: boolean;
  access_token?: string;
  roles?: (string | null)[];
  privileges?: string[];
  expiresAt?: string;
}
