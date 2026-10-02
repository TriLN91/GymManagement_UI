import { expect, test, type Page } from '@playwright/test';

async function openAsMember(page: Page, path: string) {
  await page.addInitScript(() => {
    const user = {
      id: 'profile-center-member',
      email: 'member@fit.local',
      fullName: 'Alex Volkov',
      roles: ['member'],
      tenantId: 'fit-e2e',
      locale: 'en',
    };
    window.localStorage.clear();
    window.localStorage.setItem('app:auth', JSON.stringify({ state: { user }, version: 1 }));
    window.localStorage.setItem('gmc.locale', 'en');
    window.sessionStorage.setItem('gmc.accessToken', 'e2e-token');
    window.sessionStorage.setItem('gmc.refreshToken', 'e2e-refresh');
    window.sessionStorage.setItem('gmc.tenantId', user.tenantId);
  });
  await page.goto(path);
}

test.describe('Member profile center', () => {
  test('edits personal information and keeps health setup separate', async ({ page }) => {
    await openAsMember(page, '/app/profile');
    await expect(page.getByRole('heading', { name: 'Personal profile' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Alex Volkov' })).toBeVisible();
    await page.getByRole('main').getByRole('link', { name: 'Edit profile' }).click();

    await page.getByLabel('Phone').fill('+84 912 345 678');
    await page.getByLabel('Address').fill('Thao Dien, Ho Chi Minh City');
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page).toHaveURL(/\/app\/profile$/);
    await expect(page.getByText('+84 912 345 678')).toBeVisible();
    await expect(page.getByText('Thao Dien, Ho Chi Minh City')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Update health profile' })).toBeVisible();
  });

  test('opens assessment result and exposes read-only PT appointments', async ({ page }) => {
    await openAsMember(page, '/app/profile/assessments');
    const bench = page.locator('.assessment-history-list article').filter({
      hasText: 'Barbell Bench Press',
    });
    await bench.getByRole('link', { name: 'View details' }).click();
    await expect(page.getByText('84')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Movement findings' })).toBeVisible();

    await page.goto('/app/profile/appointments');
    await expect(page.getByText('Appointments are managed by your Trainer')).toBeVisible();
    await expect(page.getByRole('button', { name: /create|add appointment/i })).toHaveCount(0);
    await page.getByRole('button', { name: /Video check-in/i }).click();
    await expect(
      page.getByText('Review recovery, adherence and next-week schedule.'),
    ).toBeVisible();
  });

  test('connects a wearable and clears unread notifications', async ({ page }) => {
    await openAsMember(page, '/app/profile/wearables');
    const garmin = page.locator('.wearable-grid article').filter({ hasText: 'Garmin Connect' });
    await garmin.getByRole('button', { name: 'Connect', exact: true }).click();
    await expect(garmin.getByText('Connected', { exact: true })).toBeVisible();
    await garmin.getByRole('button', { name: 'Sync now' }).click();

    await page.goto('/app/profile/notifications');
    await expect(page.getByRole('button', { name: 'Unread · 2' })).toBeVisible();
    await page.getByRole('button', { name: 'Mark all as read' }).click();
    await expect(page.getByRole('button', { name: 'Unread · 0' })).toBeVisible();
  });

  test('updates password and account security preferences', async ({ page }) => {
    await openAsMember(page, '/app/profile/security');

    await page.getByLabel('Current password').fill('Password1!');
    await page.getByLabel('New password', { exact: true }).fill('NewPassword2!');
    await page.getByLabel('Confirm new password', { exact: true }).fill('NewPassword2!');
    await page.getByRole('button', { name: 'Update password' }).click();
    await expect(page.getByText('Password updated in the local simulation.')).toBeVisible();

    await page.getByText('Two-step verification').click();
    await page.getByText('New-login alerts').click();
    await page.getByLabel('Automatically lock session after').selectOption('120');

    await expect(page.getByLabel('Automatically lock session after')).toHaveValue('120');
  });
});
