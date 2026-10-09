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
  await expect(page).toHaveURL(/\/admin/);
  await page.evaluate((state) => {
    window.localStorage.setItem('gmc.gymOwnerOnboarding', JSON.stringify({ state, version: 1 }));
  }, approvedOnboarding);
  await page.goto('/admin');
  if ((await page.locator('html').getAttribute('lang'))?.startsWith('vi')) {
    await page.getByRole('button', { name: /english/i }).click();
  }
}

test.describe('Gym Owner customer and purchaser visibility', () => {
  test('shows only read-only operational purchase information', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    await loginApprovedGymOwner(page);
    await page.goto('/admin/customers');

    const main = page.getByRole('main');
    await expect(main.getByText('Read-only operational data')).toBeVisible();
    await expect(main.getByRole('table', { name: 'Customers / Purchasers' })).toBeVisible();
    await expect(main.getByText('Mai Nguyen')).toBeVisible();
    await expect(main.getByText('mai@fit.local')).toBeVisible();
    await expect(main.getByText('90-day Progress')).toBeVisible();
    await expect(main.getByText('Pending Gym confirmation').first()).toBeVisible();
    await expect(main.getByText('Trainer assignment active').first()).toBeVisible();
    await expect(main.locator('input, textarea, select')).toHaveCount(0);
    await expect(main.getByText(/health|workout|assessment|body composition/i)).toHaveCount(0);
    expect(consoleErrors).toEqual([]);
  });

  test('renders the operational list as readable cards without mobile overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginApprovedGymOwner(page);
    await page.goto('/admin/customers');

    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
    await expect(page.getByRole('table', { name: 'Customers / Purchasers' })).toBeVisible();
    await expect(page.getByText('FIT-2026-1048')).toBeVisible();
    await expect(page.getByText('Read-only operational data')).toBeVisible();
  });
});
