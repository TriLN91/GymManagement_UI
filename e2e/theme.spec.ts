import { test, expect } from '@playwright/test';

test.describe('Theme toggle', () => {
  test('Platform Admin theme toggle adds dark class to <html>', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => { window.localStorage.clear(); window.localStorage.setItem('gmc.locale', 'en'); });
    await page.evaluate(() => window.sessionStorage.clear());
    await page.evaluate(() => window.localStorage.setItem('gmc.theme', 'light'));
    await page.reload();

    await page.getByLabel(/email/i).fill('super@demo.gym');
    await page.getByLabel(/mật khẩu|password/i).fill('Password1!');
    await page.getByRole('button', { name: /đăng nhập|sign in/i }).click();
    await expect(page).toHaveURL(/\/superadmin$/);

    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await page.getByRole('button', { name: /switch theme/i }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.getByRole('button', { name: /switch theme/i }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });
});
