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

async function startGymOwnerLogin(page: Page) {
  await page.goto('/login');
  await page.evaluate(() => {
    { window.localStorage.clear(); window.localStorage.setItem('gmc.locale', 'en'); };
    window.sessionStorage.clear();
    window.localStorage.setItem('gmc.locale', 'en');
  });
  await page.reload();
  await page.getByLabel(/email/i).fill('admin@demo.gym');
  await page.getByLabel(/mật khẩu|password/i).fill('Password1!');
  await page.getByRole('button', { name: /sign in|đăng nhập/i }).click();
}

async function loginApprovedGymOwner(page: Page) {
  await startGymOwnerLogin(page);
  await waitForGymOwnerPortal(page);
  await page.evaluate((state) => {
    window.localStorage.setItem('gmc.gymOwnerOnboarding', JSON.stringify({ state, version: 1 }));
  }, approvedOnboarding);
}

test.describe('Gym Owner notifications and account security', () => {
  test('signs the Gym Owner in directly and keeps tokens out of localStorage', async ({ page }) => {
    await startGymOwnerLogin(page);
    await expect(page).toHaveURL(/\/admin\/onboarding$/);
    expect(
      await page.evaluate(() => window.sessionStorage.getItem('gmc.accessToken')),
    ).not.toBeNull();
    expect(await page.evaluate(() => window.localStorage.getItem('gmc.accessToken'))).toBeNull();
  });

  test('marks notifications read and navigates only to an approved internal route', async ({
    page,
  }) => {
    await loginApprovedGymOwner(page);
    await page.goto('/admin/notifications');

    await expect(page.getByText('Unread: 2')).toBeVisible();
    const orderNotification = page.getByRole('link', {
      name: /Open related content: New purchase confirmed/,
    });
    await expect(orderNotification).toHaveAttribute('href', '/admin/orders/FIT-2026-1048');
    await orderNotification.click();
    await expect(page).toHaveURL(/\/admin\/orders\/FIT-2026-1048$/);
    await expect(page.getByRole('button', { name: 'Orders & Settlement' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    await page.goto('/admin/notifications');
    await expect(page.getByText('Unread: 1')).toBeVisible();
    await expect(page.getByRole('link', { name: /platform service announcement/i })).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: /Mark as read: Platform service announcement/ }),
    ).toBeVisible();
  });

  test('shows mandatory OTP status and a privacy-limited important activity log', async ({
    page,
  }) => {
    await loginApprovedGymOwner(page);
    await page.goto('/admin/account-security');

    await expect(page.getByText('Required for every new sign-in session')).toBeVisible();
    await expect(page.getByText(/ad\*+@demo\.gym/)).toBeVisible();
    await expect(page.getByRole('table', { name: 'Important activity' })).toBeVisible();
    await expect(page.getByText('Email OTP sign-in completed')).toBeVisible();
    await expect(
      page.getByText(/IP address|device fingerprint|location|OTP code|access token/i),
    ).toHaveCount(0);
  });

  test('keeps notification and activity layouts within a 390px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginApprovedGymOwner(page);

    await page.goto('/admin/notifications');
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
    await expect(page.getByLabel('In-system notifications')).toBeVisible();
    await expect(page.locator('.member-bottom-nav a')).toHaveText([
      'Overview',
      'Profile overview',
      'Trainer list',
      'Package management',
    ]);

    await page.goto('/admin/account-security');
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
    await expect(page.getByRole('table', { name: 'Important activity' })).toBeVisible();
  });
});
