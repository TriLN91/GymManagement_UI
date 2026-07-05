import { test, expect } from '@playwright/test';

test.describe('Theme toggle', () => {
  test('clicking theme toggle adds dark class to <html>', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => window.localStorage.clear());
    await page.evaluate(() => window.sessionStorage.clear());
    await page.reload();

    await page.getByLabel(/email/i).fill('member@demo.gym');
    await page.getByLabel(/password/i).fill('Password1!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/app$/);

    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await page.getByRole('button', { name: /switch theme/i }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.getByRole('button', { name: /switch theme/i }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });
});
