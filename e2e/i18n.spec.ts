import { test, expect } from '@playwright/test';

test.describe('i18n language switcher', () => {
  test('switching language updates visible strings to Vietnamese', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => window.localStorage.clear());
    await page.evaluate(() => window.sessionStorage.clear());
    await page.evaluate(() => window.localStorage.setItem('gmc.locale', 'en'));
    await page.reload();

    await page.getByLabel(/email/i).fill('member@demo.gym');
    await page.getByLabel(/password/i).fill('Password1!');
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await expect(page).toHaveURL(/\/app$/);

    await expect(page.locator('.member-topbar').getByText('Member workspace')).toBeVisible();
    await page.getByRole('button', { name: 'Tiếng Việt' }).click();
    await expect(page.locator('.member-topbar').getByText('Không gian thành viên')).toBeVisible();
  });
});
