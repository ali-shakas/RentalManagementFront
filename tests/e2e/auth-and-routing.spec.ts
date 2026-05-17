import { expect, test } from '@playwright/test';

import { clearAuthenticatedSession, installAuthenticatedSession } from '../helpers/auth';
import { installApiMocks } from '../helpers/api-mocks';
import { collectRuntimeErrors, expectNoRuntimeErrors, expectPageStable } from '../helpers/page-checks';

const protectedRoutes = [
  '/dashboard',
  '/vehicles',
  '/vehicles/create',
  '/customers',
  '/booking',
  '/counting',
  '/journals',
  '/journals/create',
  '/cash',
  '/banks',
  '/payment-counts',
];

test.describe('authentication and route guards', () => {
  for (const route of protectedRoutes) {
    test(`redirects anonymous users from ${route} to login`, async ({ page }) => {
      await clearAuthenticatedSession(page);

      await page.goto(route);

      await expect(page).toHaveURL(/\/auth\/login$/);
      await expect(page.getByText(/مرحبًا بعودتك|Welcome back/i)).toBeVisible();
    });
  }

  test('renders login page validation messages on empty submit', async ({ page }) => {
    const errors = collectRuntimeErrors(page);
    await page.goto('/auth/login');

    await page.getByRole('button', { name: /دخول|login|sign in/i }).click();

    await expect(page.getByText(/اسم المستخدم مطلوب|username.*required/i)).toBeVisible();
    await expect(page.getByText(/كلمة المرور مطلوبة|password.*required/i)).toBeVisible();
    await expectNoRuntimeErrors(errors);
  });
});

test.describe('authenticated route smoke coverage', () => {
  for (const route of protectedRoutes) {
    test(`loads authenticated route ${route}`, async ({ page }) => {
      await installAuthenticatedSession(page);
      await installApiMocks(page);
      const errors = collectRuntimeErrors(page);

      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');

      await expect(page).not.toHaveURL(/\/auth\/login$/);
      await expectPageStable(page);
      await expectNoRuntimeErrors(errors);
    });
  }
});
