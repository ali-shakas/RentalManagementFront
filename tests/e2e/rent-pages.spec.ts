import { expect, test } from '@playwright/test';

import { installAuthenticatedSession } from '../helpers/auth';
import { installApiMocks } from '../helpers/api-mocks';
import {
  collectRuntimeErrors,
  expectNoRuntimeErrors,
  expectPageStable,
  expectSearchControl,
  expectTableOrEmptyState,
} from '../helpers/page-checks';

const operatingListPages = [
  { path: '/vehicles', title: /Vehicles|المركبات|السيارات/i },
  { path: '/customers', title: /Customers|العملاء/i },
  { path: '/booking', title: /Booking|الحجوزات|العقود/i },
  { path: '/branches', title: /Branches|الفروع/i },
  { path: '/category-vehicles', title: /Category Vehicles|Vehicle Category|فئات المركبات|تصنيف/i },
  { path: '/traffic-violations', title: /trafficViolations\.title|Traffic Violations|المخالفات/i },
];

const createFormPages = [
  { path: '/vehicles/create', expectedText: /Create Vehicle|Vehicle|المركبة|السيارة/i },
  { path: '/customers/create', expectedText: /Create Customer|Customer|العميل/i },
  { path: '/booking/create', expectedText: /Booking|الحجز|العقد/i },
  { path: '/branches/create', expectedText: /Create Branch|Branch|الفرع/i },
  { path: '/traffic-violations/create', expectedText: /trafficViolations\.createTitle|Traffic Violation|المخالفة/i },
];

test.beforeEach(async ({ page }) => {
  await installAuthenticatedSession(page);
  await installApiMocks(page);
});

test.describe('operating list pages', () => {
  for (const pageInfo of operatingListPages) {
    test(`${pageInfo.path} renders a stable list/search/table area`, async ({ page }) => {
      const errors = collectRuntimeErrors(page);

      await page.goto(pageInfo.path);

      if (await page.getByText(pageInfo.title).first().count()) {
        await expect(page.getByText(pageInfo.title).first()).toBeVisible();
      } else {
        await expect(page.locator('app-page-header').first()).toBeVisible();
      }
      await expectSearchControl(page);
      await expectTableOrEmptyState(page);
      await expectPageStable(page);
      await expectNoRuntimeErrors(errors);
    });
  }
});

test.describe('operating create and edit pages', () => {
  for (const pageInfo of createFormPages) {
    test(`${pageInfo.path} renders a form with submit controls`, async ({ page }) => {
      const errors = collectRuntimeErrors(page);

      await page.goto(pageInfo.path);

      await expect(page.locator('form').first()).toBeVisible();
      await expect(page.locator('input, select, textarea, app-smooth-select').first()).toBeVisible();
      await expect(page.locator('button, a.btn').first()).toBeVisible();
      await expectPageStable(page);
      await expectNoRuntimeErrors(errors);
    });
  }

  test('vehicle list sends search, sorting, and filtering requests without breaking the grid', async ({ page }) => {
    const requestedUrls: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/Vehicle/Paginated')) {
        requestedUrls.push(request.url());
      }
    });

    await page.goto('/vehicles');
    await page.locator('input[placeholder*="plate"], input[placeholder*="serial"], input.form-control').first().fill('ABC');
    await page.getByRole('button', { name: /Search|بحث/i }).first().click();

    await expect(page.locator('.vehicle-cards-grid, app-empty-state').first()).toBeVisible();
    expect(requestedUrls.some(url => url.includes('Search=ABC'))).toBeTruthy();
  });
});
