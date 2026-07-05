import { test, expect } from '@playwright/test';

test.describe('Coaching vertical slice', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => window.localStorage.clear());
    await page.evaluate(() => window.sessionStorage.clear());
    await page.reload();
    await page.getByLabel(/email/i).fill('member@demo.gym');
    await page.getByLabel(/password/i).fill('Password1!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/app$/);
  });

  test('member navigates to /app/coaching and sees the plan card', async ({ page }) => {
    await page.goto('/app/coaching');
    await expect(page.getByText(/your coaching plan/i)).toBeVisible();
    await expect(page.getByText(/muscle gain/i)).toBeVisible();
    await expect(page.getByText(/upper body/i)).toBeVisible();
    await expect(page.getByText(/lower body/i)).toBeVisible();
  });

  test('member opens check-in dialog and submits successfully', async ({ page }) => {
    await page.goto('/app/coaching');
    await page.getByRole('button', { name: /new check-in/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /submit/i }).click();
    // Toast region appears in top-right; allow MSW a tick.
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 });
  });
});