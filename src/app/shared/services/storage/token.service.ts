import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth_token';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('roles');
    localStorage.removeItem('privileges');
    localStorage.removeItem('fleetId');
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Decode JWT payload safely (handles base64url).
   */
  decodePayload(token: string | null | undefined): any | null {
    if (!token) return null;
    try {
      const base64 = token.split('.')[1] ?? '';
      const base64Normalized = base64.replace(/-/g, '+').replace(/_/g, '/');
      const binary = atob(base64Normalized);
      const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
      const payloadJson = new TextDecoder('utf-8').decode(bytes);
      return JSON.parse(payloadJson || '{}');
    } catch {
      return null;
    }
  }

  getRoles(): string[] {
    return this.getArrayFromStorage('roles');
  }

  getPrivileges(): string[] {
    return this.getArrayFromStorage('privileges');
  }

  private getArrayFromStorage(key: string): string[] {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(v => String(v).trim()).filter(Boolean) : [];
    } catch {
      return [];
    }
  }
}
