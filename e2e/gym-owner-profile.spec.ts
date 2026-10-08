import { expect, test, type Page } from '@playwright/test';

import { completeGymOwnerOtp } from './helpers/gymOwnerAuth';

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

async function loginAndSeedApprovedProfile(page: Page) {
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
  await completeGymOwnerOtp(page);

  await page.evaluate((state) => {
    window.localStorage.setItem('gmc.gymOwnerOnboarding', JSON.stringify({ state, version: 1 }));
    window.localStorage.removeItem('gmc.gymOwnerProfile');
  }, approvedOnboarding);
  await page.goto('/admin/profile');
  if ((await page.locator('html').getAttribute('lang'))?.startsWith('vi')) {
    await page.getByRole('button', { name: /english/i }).click();
  }
}

test.describe('Gym Owner profile', () => {
  test('shows approved onboarding data in read-only profile overview and saves brand edits', async ({
    page,
  }) => {
    await loginAndSeedApprovedProfile(page);

    await expect(page).toHaveURL(/\/admin\/profile$/);
    await expect(page.getByRole('heading', { name: 'Fit Central' })).toBeVisible();
    await expect(page.getByText('business-license.pdf')).toBeVisible();
    await page.getByRole('link', { name: 'Edit' }).first().click();

    await expect(page.getByRole('heading', { name: 'Brand information' })).toBeVisible();
    await expect(page.getByLabel('Brand name')).toHaveCount(0);
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Brand name').fill('Fit Central Updated');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByText('Fit Central Updated')).toBeVisible();
    await expect(page.getByText('Profile changes saved.')).toBeVisible();
  });

  test('adds, edits and removes a branch through the existing dialog pattern', async ({ page }) => {
    await loginAndSeedApprovedProfile(page);
    await page.goto('/admin/profile/branches');

    await expect(page.getByRole('heading', { name: 'Fit Central District 1' })).toBeVisible();
    await page.getByRole('button', { name: 'Add branch' }).click();
    await page.getByLabel('Branch name').fill('Fit Central District 7');
    await page.getByLabel('Province / City').fill('Ho Chi Minh City');
    await page.getByLabel('Area').fill('District 7');
    await page.getByLabel('Contact phone').fill('0909999999');
    await page.getByLabel('Address').fill('88 Nguyen Thi Thap');
    await page.getByLabel('Operating hours').fill('06:00 - 21:00');
    await page.getByText('Parking', { exact: true }).click();
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page.getByRole('heading', { name: 'Fit Central District 7' })).toBeVisible();
    await page.getByRole('button', { name: 'Edit branch' }).click();
    await page.getByLabel('Branch name').fill('Fit Central District 7 Updated');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(
      page.getByRole('heading', { name: 'Fit Central District 7 Updated' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Remove branch' }).click();
    await page.getByRole('button', { name: 'Confirm removal' }).click();
    await expect(page.getByText('Fit Central District 7 Updated', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Fit Central District 1' })).toBeVisible();
  });

  test('profile overview and branch management do not overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAndSeedApprovedProfile(page);
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);

    await page.goto('/admin/profile/branches');
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
    await page.getByRole('button', { name: 'Edit branch' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
    await dialog.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await expect(page.getByRole('button', { name: 'Save changes' })).toBeVisible();
  });
});
