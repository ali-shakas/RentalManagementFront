import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { EMPTY } from 'rxjs';

import { AuthStateService } from '../../core/auth/auth-state.service';
import { TokenService } from '../services/storage/token.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/Auth/Login')) {
    return next(req);
  }

  const authState = inject(AuthStateService);
  const tokenService = inject(TokenService);
  const token = authState.token() || tokenService.getToken();

  if (tokenService.isTokenExpired(token)) {
    authState.clearSession();
    redirectToLoginWithReload();
    return EMPTY;
  }

  if (token?.trim()) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  return next(req);
};

function redirectToLoginWithReload(): void {
  if (typeof window === 'undefined') {
    return;
  }
  const loginPath = '/auth/login';
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (currentPath.startsWith(loginPath)) {
    window.location.reload();
    return;
  }
  window.location.replace(loginPath);
}
