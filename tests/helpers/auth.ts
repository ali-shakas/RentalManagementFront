import { Page } from '@playwright/test';

export const TEST_FLEET_ID = '11111111-0000-0000-0000-000000000001';
export const TEST_BRANCH_ID = '1';

const allPrivileges = [
  'vehicle_manage',
  'customer_manage',
  'booking_manage',
  'financial_reports',
  'security_manage',
  'users_manage',
  'roles_manage',
  'privileges_manage',
  'fleet_manage',
  'branch_manage',
];

function base64Url(value: unknown): string {
  return Buffer.from(JSON.stringify(value), 'utf8')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function createTestJwt(overrides: Record<string, unknown> = {}): string {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const header = { alg: 'none', typ: 'JWT' };
  const payload = {
    sub: 'playwright-user',
    username: 'playwright-admin',
    name: 'Playwright Admin',
    email: 'playwright@example.test',
    fleetId: TEST_FLEET_ID,
    branchId: TEST_BRANCH_ID,
    roles: ['admin'],
    privileges: allPrivileges,
    exp: nowSeconds + 60 * 60,
    ...overrides,
  };

  return `${base64Url(header)}.${base64Url(payload)}.`;
}

export async function installAuthenticatedSession(page: Page, overrides: Record<string, unknown> = {}): Promise<void> {
  const token = createTestJwt(overrides);
  await page.addInitScript(
    ({ authToken, fleetId }) => {
      window.localStorage.setItem('auth_token', authToken);
      window.localStorage.setItem('fleetId', fleetId);
      window.localStorage.setItem('roles', JSON.stringify(['admin']));
      window.localStorage.setItem(
        'privileges',
        JSON.stringify([
          'vehicle_manage',
          'customer_manage',
          'booking_manage',
          'financial_reports',
          'security_manage',
          'fleet_manage',
          'branch_manage',
        ]),
      );
    },
    { authToken: token, fleetId: TEST_FLEET_ID },
  );
}

export async function clearAuthenticatedSession(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.removeItem('auth_token');
    window.localStorage.removeItem('fleetId');
    window.localStorage.removeItem('roles');
    window.localStorage.removeItem('privileges');
  });
}
