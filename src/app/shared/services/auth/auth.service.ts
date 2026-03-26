import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, map, catchError, of } from 'rxjs';

import { AuthStateService } from '../../../core/auth/auth-state.service';
import { BaseService } from '../base/base.service';
import { LoginRequest, LoginResponse, ApiResponse } from '../../models';
import { ToastService } from '../toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(BaseService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private authState = inject(AuthStateService);

  private readonly loginEndpoint = 'Auth/Login';

  login(request: LoginRequest): Observable<{ success: boolean; message?: string }> {
    return this.api.post<LoginResponse>(this.loginEndpoint, {
      username: request.username,
      password: request.password,
      Username: request.username,
      Password: request.password,
    }).pipe(
      tap(res => {
        const token = this.getTokenFromResponse(res.data ?? (res as unknown as LoginResponse));
        const succeeded = !!token && res.succeeded !== false;

        if (succeeded && token) {
          this.authState.createSession(token);
        } else if (res.succeeded === false) {
          const message = res.errors?.length ? res.errors.join(' ') : (res as any).message ?? 'فشل تسجيل الدخول';
          this.showError(message);
        }
      }),
      map(res => {
        const token = this.getTokenFromResponse(res.data ?? (res as unknown as LoginResponse));
        const success = !!token && (res.succeeded !== false);
        const message =
          res.succeeded === false && res.errors?.length
            ? res.errors.join(' ')
            : (res as any).message ?? undefined;
        return { success, message };
      }),
      catchError(err => {
        const message =
          err?.error?.errors?.length > 0
            ? err.error.errors.join(' ')
            : err?.error?.message || err?.message || 'حدث خطأ غير متوقع، حاول لاحقاً';
        this.showError(message);
        return of({ success: false, message });
      }),
    );
  }

  private getTokenFromResponse(res: LoginResponse | ApiResponse<LoginResponse> | string | null | undefined): string | null {
    if (!res) return null;
    if (typeof res === 'string') return res;
    const data: LoginResponse | string = 'data' in res && res.data != null ? res.data : (res as LoginResponse);
    if (typeof data === 'string') return data;
    const obj = data as Record<string, unknown>;
    return (obj['token'] ?? obj['accessToken'] ?? obj['access_token'] ?? null) as string | null;
  }

  logout(): void {
    this.authState.clearSession();
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated();
  }

  private showError(msg: string): void {
    this.toast.error(msg);
  }
}
