import { Action, createReducer, on } from '@ngrx/store';

import { loginSuccess, logout } from './auth.actions';

export interface AuthState {
  user: any | null;
  token: string | null;
  roles: string[];
  privileges: string[];
  fleetId: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  token: null,
  roles: [],
  privileges: [],
  fleetId: null,
};

export const authReducer = createReducer(
  initialAuthState,
  on(loginSuccess, (state: AuthState, { user, token, fleetId }: { user: any; token: string; fleetId?: string | null }) => {
    const parseArray = (key: string): string[] => {
      try {
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.map(v => String(v).trim()).filter(Boolean) : [];
      } catch {
        return [];
      }
    };
    const roles = parseArray('roles');
    const privileges = parseArray('privileges');
    return {
      ...state,
      user,
      token,
      roles,
      privileges,
      fleetId: fleetId ?? null,
    };
  }),
  on(logout, () => initialAuthState),
);

export function reducer(state: AuthState | undefined, action: Action): AuthState {
  return authReducer(state, action);
}
