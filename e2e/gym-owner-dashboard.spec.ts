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
  await completeGymOwnerOtp(page);
  await page.evaluate((state) => {
    window.localStorage.setItem('gmc.gymOwnerOnboarding', JSON.stringify({ state, version: 1 }));
    window.localStorage.removeItem('gmc.gymOwnerDashboardPreferences');
  }, approvedOnboarding);
  await page.goto('/admin');
  if ((await page.locator('html').getAttribute('lang'))?.startsWith('vi')) {
    await page.getByRole('button', { name: /english/i }).click();
  }
}

test.describe('Gym Owner dashboard', () => {
  test('shows the scoped operational widgets and severity-sorted alerts', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    await loginApprovedGymOwner(page);

    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole('heading', { name: 'Trainers' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Assignments' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'PT sales' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Appointments' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Operational alerts' })).toBeVisible();

    const severityLabels = await page
      .locator('.gym-dashboard-alert-list article .inline-flex')
      .allTextContents();
    expect(severityLabels).toEqual([
      'High priority',
      'High priority',
      'Medium priority',
      'Upcoming',
    ]);
    expect(consoleErrors).toEqual([]);
  });

  test('hides, reorders and persists widgets with accessible controls', async ({ page }) => {
    await loginApprovedGymOwner(page);
    await page.getByRole('button', { name: 'Customize dashboard' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByRole('checkbox', { name: 'PT sales Show' }).uncheck();
    const moveAlertsUp = dialog.getByRole('button', { name: 'Move up: Operational alerts' });
    for (let step = 0; step < 4; step += 1) await moveAlertsUp.click();
    await dialog.getByRole('button', { name: 'Save layout' }).click();

    await expect(page.getByRole('heading', { name: 'PT sales' })).toHaveCount(0);
    await expect(page.getByRole('status')).toHaveText('Dashboard layout saved.');
    expect(
      await page
        .locator('[data-widget-id]')
        .evaluateAll((widgets) => widgets.map((widget) => widget.getAttribute('data-widget-id'))),
    ).toEqual(['alerts', 'trainers', 'assignments', 'appointments']);

    await page.reload();
    await expect(page.getByRole('heading', { name: 'PT sales' })).toHaveCount(0);
    expect(await page.locator('[data-widget-id]').first().getAttribute('data-widget-id')).toBe(
      'alerts',
    );
  });

  test('keeps the dashboard and customization dialog usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginApprovedGymOwner(page);

    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
    await page.getByRole('button', { name: 'Customize dashboard' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
    await expect(page.getByRole('button', { name: 'Move down: Trainers' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save layout' })).toBeVisible();
  });
});
