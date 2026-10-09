import { expect, test, type Page } from '@playwright/test';

import { waitForGymOwnerPortal } from './helpers/gymOwnerAuth';

const approvedOnboarding = {
  brand: {
    name: 'Fit Central',
    description: 'A verified training space for members.',
    contactPhone: '0901234567',
  },
  branches: [
    {
      id: 'branch-main',
      name: 'Fit Central District 1',
      city: 'Ho Chi Minh City',
      area: 'District 1',
      address: '12 Nguyen Hue',
      contactPhone: '0907654321',
      operatingHours: '06:00 - 22:00',
      facilities: ['free-weights', 'cardio'],
    },
  ],
  license: {
    name: 'business-license.pdf',
    size: 1024,
    type: 'application/pdf',
    uploadedAt: '2026-10-01T00:00:00.000Z',
  },
  status: 'approved',
  rejectionReason: null,
  submissionCount: 1,
  submittedAt: '2026-10-01T00:00:00.000Z',
};

async function loginApprovedGymOwner(page: Page) {
  await page.goto('/login');
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.localStorage.setItem('gmc.locale', 'en');
  });
  await page.reload();
  await page.getByLabel(/email/i).fill('admin@demo.gym');
  await page.getByLabel(/password/i).fill('Password1!');
  await page.getByRole('button', { name: /sign in|đăng nhập/i }).click();
  await waitForGymOwnerPortal(page);
  await page.evaluate((state) => {
    window.localStorage.setItem('gmc.gymOwnerOnboarding', JSON.stringify({ state, version: 1 }));
  }, approvedOnboarding);
  await page.goto('/admin/analytics');
  if ((await page.locator('html').getAttribute('lang'))?.startsWith('vi')) {
    await page.getByRole('button', { name: /english/i }).click();
  }
}

test.describe('Gym Owner analytics', () => {
  test('shows the five approved backend-owned categories and previous-period comparison', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    await loginApprovedGymOwner(page);

    const main = page.getByRole('main');
    await expect(
      main.getByLabel('Operational analytics').getByText('Gym service sales'),
    ).toBeVisible();
    await expect(
      main.getByLabel('Operational analytics').getByText('PT Package views'),
    ).toBeVisible();
    await expect(
      main.getByLabel('Operational analytics').getByText('Successful purchases'),
    ).toBeVisible();
    await expect(
      main.getByLabel('Operational analytics').getByText('New assignments'),
    ).toBeVisible();
    await expect(main.getByText('Completed PT appointments').first()).toBeVisible();
    await expect(
      main.getByText('All KPIs and comparison values are supplied by the backend.'),
    ).toBeVisible();
    await expect(main.getByRole('img', { name: /Current period:/ }).first()).toBeVisible();
    await expect(main.getByRole('table', { name: 'Trainer activity' })).toBeVisible();
    await expect(
      main.getByText(/health|body measurement|form assessment|trainer ranking/i),
    ).toHaveCount(0);
    expect(consoleErrors).toEqual([]);
  });

  test('validates and applies custom date ranges without fabricating unavailable data', async ({
    page,
  }) => {
    await loginApprovedGymOwner(page);
    const customRangeButton = page.getByRole('button', { name: 'Custom', exact: true });
    await expect(customRangeButton).toBeVisible();
    await customRangeButton.click();
    await expect(customRangeButton).toHaveAttribute('aria-pressed', 'true');

    await page.getByLabel('Start date').fill('2026-09-16');
    await page.getByLabel('End date').fill('2026-09-15');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByRole('alert')).toHaveText(
      'The start date cannot be after the end date.',
    );

    await page.getByLabel('Start date').fill('2026-08-01');
    await page.getByLabel('End date').fill('2026-08-15');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(
      page.getByText('No analytics data is available for this date range.'),
    ).toBeVisible();

    await page.getByLabel('Start date').fill('2026-09-01');
    await page.getByLabel('End date').fill('2026-09-15');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByText('09/01/2026 – 09/15/2026')).toBeVisible();
  });

  test('keeps available metrics visible when a backend metric is missing', async ({ page }) => {
    await loginApprovedGymOwner(page);
    await page.getByRole('button', { name: '90 days' }).click();

    await expect(page.getByText('Some data was not supplied by the backend')).toBeVisible();
    await expect(page.getByText('Not supplied by backend')).toBeVisible();
    await expect(
      page.getByLabel('Operational analytics').getByText('Gym service sales'),
    ).toBeVisible();
  });

  test('has no horizontal overflow at a narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginApprovedGymOwner(page);

    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
    await expect(page.getByRole('table', { name: 'Trainer activity' })).toBeVisible();
  });
});
