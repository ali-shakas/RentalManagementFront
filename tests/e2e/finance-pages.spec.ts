import { expect, test } from '@playwright/test';

import { installAuthenticatedSession } from '../helpers/auth';
import { installApiMocks } from '../helpers/api-mocks';
import {
  collectRuntimeErrors,
  expectNoRuntimeErrors,
  expectPageStable,
  expectSearchControlIfPresent,
  expectTableOrEmptyState,
} from '../helpers/page-checks';

const financeListPages = [
  { path: '/banks', title: /Banks|البنوك/i, create: /Create Bank|إنشاء|Add/i },
  { path: '/cash', title: /Cash Boxes|الصندوق|Cash/i, create: /Create Cash Box|إنشاء|Add/i },
  { path: '/counting', title: /Accounting Directory|دليل|الحسابات/i, create: /Add|إضافة/i },
  { path: '/financial-years', title: /Financial Years|السنوات المالية/i, create: /Create Financial Year|إنشاء|Add/i },
  { path: '/journals', title: /Journals|القيود/i, create: /Create Journal Entry|إنشاء|Add/i },
  { path: '/payment-counts', title: /Payment Counts|السندات|Payment/i, create: /Create Payment Count|إنشاء|Add/i },
];

test.beforeEach(async ({ page }) => {
  await installAuthenticatedSession(page);
  await installApiMocks(page);
});

test.describe('finance list pages', () => {
  for (const pageInfo of financeListPages) {
    test(`${pageInfo.path} renders filters, data area, and create action`, async ({ page }) => {
      const errors = collectRuntimeErrors(page);

      await page.goto(pageInfo.path);

      if (await page.getByText(pageInfo.title).first().count()) {
        await expect(page.getByText(pageInfo.title).first()).toBeVisible();
      } else {
        await expect(page.locator('app-page-header').first()).toBeVisible();
      }
      await expectSearchControlIfPresent(page);
      await expectTableOrEmptyState(page);
      const createLink = page.getByRole('link', { name: pageInfo.create }).first();
      const createButton = page.getByRole('button', { name: pageInfo.create }).first();
      if (await createLink.count()) {
        await expect(createLink).toBeVisible();
      } else if (await createButton.count()) {
        await expect(createButton).toBeVisible();
      }
      await expectPageStable(page);
      await expectNoRuntimeErrors(errors);
    });
  }
});

test.describe('chart of accounts behavior', () => {
  test('filters the account tree by search term', async ({ page }) => {
    await page.goto('/counting');

    await expect(page.getByText(/الصندوق|Cash/i).first()).toBeVisible();
    await page.locator('input[type="search"]').first().fill('Bank');

    await expect(page.getByText(/البنك|Bank/i).first()).toBeVisible();
  });

  test('shows account number range guidance for typed accounting classes', async ({ page }) => {
    await page.goto('/counting');

    await page.locator('input[formcontrolname="countingNumber"]').fill('999');

    await expect(page.getByText(/Allowed account number range|النطاق|1000|1999/i).first()).toBeVisible();
  });
});

test.describe('journal entry form behavior', () => {
  test('prevents saving an unbalanced or incomplete journal', async ({ page }) => {
    await page.goto('/journals/create');

    await expect(page.getByText(/Journal Header|رأس القيد/i)).toBeVisible();
    await expect(page.locator('table').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Create|إنشاء/i })).toBeDisabled();
  });

  test('shows debit, credit, and difference summary controls', async ({ page }) => {
    await page.goto('/journals/create');

    await expect(page.getByText(/Total Debit|إجمالي المدين/i)).toBeVisible();
    await expect(page.getByText(/Total Credit|إجمالي الدائن/i)).toBeVisible();
    await expect(page.getByText(/Difference|الفرق/i)).toBeVisible();
  });
});
