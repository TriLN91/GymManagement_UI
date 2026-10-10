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
test('Platform Admin M5 dispute, analytics and audit routes work', async ({ page }) => {
  await loginPlatformAdmin(page);
  await page.goto('/superadmin/transactions/disputes/DSP-3001');
  await page.getByRole('button', { name: 'Under review' }).click();
  await expect(
    page.locator('.platform-governance-card').first().getByText('Under review'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Message to Gym')).toBeVisible();
  await page.goto('/superadmin/analytics/platform');
  await page.getByRole('button', { name: '7d' }).click();
  await expect(page.getByText('Successful orders')).toBeVisible();
  await page.goto('/superadmin/audit');
  await expect(page.getByText('Audit & activity')).toBeVisible();
});
