import { test, expect } from '@playwright/test';

test.describe('Theme toggle', () => {
  test('Platform Admin theme toggle adds dark class to <html>', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => window.localStorage.clear());
    await page.evaluate(() => window.sessionStorage.clear());
    await page.evaluate(() => window.localStorage.setItem('gmc.theme', 'light'));
    await page.reload();

    await page.getByLabel(/email/i).fill('super@demo.gym');
    await page.getByLabel(/password/i).fill('Password1!');
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await expect(page).toHaveURL(/\/superadmin$/);

    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await page.getByRole('button', { name: /switch theme/i }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.getByRole('button', { name: /switch theme/i }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });
});
