import { expect, test, type Page } from '@playwright/test';

async function loginPlatformAdmin(page: Page) {
  await page.goto('/login');
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.localStorage.setItem('gmc.locale', 'en');
  });
  await page.reload();
  await page.getByLabel(/email/i).fill('super@demo.gym');
  await page.getByLabel(/password/i).fill('Password1!');
  await page.getByRole('button', { name: /đăng nhập|sign in/i }).click();
  await expect(page).toHaveURL(/\/superadmin$/);
}

test.describe('Platform Admin M3', () => {
  test('restricts and restores a listing with audited evidence', async ({ page }) => {
    await loginPlatformAdmin(page);
    await page.goto('/superadmin/marketplace/listings/listing-gym-801');
    await page.getByRole('button', { name: 'Hide' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Reason').selectOption({ label: 'Policy review required' });
    await dialog.getByLabel('Note').fill('Review needed before this profile remains public.');
    await dialog.getByRole('button', { name: 'Confirm' }).click();
    await expect(
      page.locator('.platform-operation-detail header').getByText('Hidden'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Restore' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    await expect(
      page.locator('.platform-operation-detail header').getByText('Published'),
    ).toBeVisible();
  });

  test('creates a campaign and follows its valid status flow', async ({ page }) => {
    await loginPlatformAdmin(page);
    await page.goto('/superadmin/campaigns/new');
    await page.getByLabel('Name').fill('Trainer activation');
    await page.getByLabel('Audience').selectOption('trainer');
    await page.getByLabel('Message').fill('Complete your public profile.');
    await page.getByLabel('Starts at').fill('2026-10-14T09:00');
    await page.getByLabel('Ends at').fill('2026-10-21T09:00');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Draft', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Scheduled' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    await expect(
      page.locator('.platform-operation-detail header').getByText('Scheduled'),
    ).toBeVisible();
  });

  test('opens a notification target', async ({ page }) => {
    await loginPlatformAdmin(page);
    await page.goto('/superadmin/notifications');
    await page
      .locator('.platform-notification-list article')
      .filter({ hasText: 'Offer requires a follow-up' })
      .getByRole('button', { name: 'Open' })
      .click();
    await expect(page).toHaveURL(/\/superadmin\/marketplace\/listings\/listing-offer-803$/);
  });
});
