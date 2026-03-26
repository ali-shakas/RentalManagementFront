import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthStateService } from '../../../core/auth/auth-state.service';

/**
 * Guard يتحقق من صلاحيات المستخدم من الـ Store.
 * إذا كان route.data['privileges'] موجوداً، يجب أن يمتلك المستخدم واحدة على الأقل.
 * إذا لم يمتلك الصلاحية → تحويل إلى /auth/403
 */
export const privilegeGuard: CanActivateFn = (route) => {
  const authState = inject(AuthStateService);
  const router = inject(Router);
  const requiredPrivileges = (route.data['privileges'] as string[] | undefined) ?? [];
  const requiredRoles = (route.data['roles'] as string[] | undefined) ?? [];

  if (requiredPrivileges.length === 0 && requiredRoles.length === 0) {
    return true;
  }

  const hasRequiredRoles = requiredRoles.length === 0 || authState.hasAnyRole(requiredRoles);
  const hasRequiredPrivileges =
    requiredPrivileges.length === 0 || authState.hasAnyPrivilege(requiredPrivileges);

  if (!hasRequiredRoles || !hasRequiredPrivileges) {
    router.navigate(['/auth/403']);
    return false;
  }

  return true;
};
