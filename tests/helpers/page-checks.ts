import { expect, Page } from '@playwright/test';

export async function expectPageStable(page: Page): Promise<void> {
  await expect(page.locator('app-root')).toBeAttached();
  await expect(page.locator('body')).not.toHaveText(/Cannot match any routes|NullInjectorError|TypeError|ReferenceError/i);
}

export function collectRuntimeErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() !== 'error') {
      return;
    }

    const text = message.text();
    const ignoredExternalFailures = [
      'fonts.googleapis.com',
      'cdnjs.cloudflare.com',
      'cdn.jsdelivr.net',
      'unpkg.com',
      'net::ERR_NETWORK_ACCESS_DENIED',
    ];

    if (ignoredExternalFailures.some(item => text.includes(item))) {
      return;
    }

    errors.push(text);
  });
  return errors;
}

export async function expectNoRuntimeErrors(errors: string[]): Promise<void> {
  expect(errors, `Runtime errors:\n${errors.join('\n')}`).toEqual([]);
}

export async function expectSearchControl(page: Page): Promise<void> {
  const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="بحث"]').first();
  await expect(searchInput).toBeVisible();
}

export async function expectTableOrEmptyState(page: Page): Promise<void> {
  const table = page.locator('table').first();
  if (await table.count()) {
    await expect(table).toBeVisible();
    return;
  }

  const tree = page.locator('[role="tree"]').first();
  if (await tree.count()) {
    await expect(tree).toBeVisible();
    return;
  }

  const cardGrid = page.locator('.vehicle-cards-grid').first();
  if (await cardGrid.count()) {
    await expect(cardGrid).toBeVisible();
    return;
  }

  const emptyState = page.locator('app-empty-state').first();
  if (await emptyState.count()) {
    await expect(emptyState).toBeVisible();
    return;
  }

  await expect(page.getByText(/No .* found|لا توجد|No records found/i).first()).toBeVisible();
}

export async function expectSearchControlIfPresent(page: Page): Promise<void> {
  const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="بحث"]').first();
  if (await searchInput.count()) {
    await expect(searchInput).toBeVisible();
  }
}
