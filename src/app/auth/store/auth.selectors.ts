import { createFeatureSelector, createSelector } from '@ngrx/store';

import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth-key');

export const selectUser = createSelector(selectAuthState, (state: AuthState) => state.user);

export const selectToken = createSelector(selectAuthState, (state: AuthState) => state.token);

export const selectRoles = createSelector(selectAuthState, (state: AuthState) => state.roles);

export const selectPrivileges = createSelector(selectAuthState, (state: AuthState) => state.privileges);

export const selectFleetId = createSelector(selectAuthState, (state: AuthState) => state.fleetId ?? null);

export const selectIsAuthenticated = createSelector(selectToken, (token: string | null) => !!token);
