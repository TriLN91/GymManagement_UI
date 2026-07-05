import { test, expect } from '@playwright/test';

test.describe('i18n language switcher', () => {
  test('switching language updates visible strings to Vietnamese', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => window.localStorage.clear());
    await page.evaluate(() => window.sessionStorage.clear());
    await page.reload();

    await page.getByLabel(/email/i).fill('member@demo.gym');
    await page.getByLabel(/password/i).fill('Password1!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/app$/);

    // Default is "Member Portal" (English). Click the language toggle.
    await page.getByRole('button', { name: /switch language/i }).click();
    // After language switch, the page title in the header should be Vietnamese.
    await expect(page.locator('header').getByText(/cổng thành viên/i)).toBeVisible();
  });
});