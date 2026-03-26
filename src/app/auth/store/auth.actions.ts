import { createAction, props } from '@ngrx/store';

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: any; token: string; fleetId?: string | null }>(),
);

export const logout = createAction('[Auth] Logout');
