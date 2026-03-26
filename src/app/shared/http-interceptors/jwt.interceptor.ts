import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthStateService } from '../../core/auth/auth-state.service';
import { TokenService } from '../services/storage/token.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/Auth/Login')) {
    return next(req);
  }

  const authState = inject(AuthStateService);
  const tokenService = inject(TokenService);
  const token = authState.token() || tokenService.getToken();

  if (token?.trim()) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  return next(req);
};
