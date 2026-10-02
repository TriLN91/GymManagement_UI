import { expect, test, type Page } from '@playwright/test';

async function loginAsMember(page: Page) {
  await page.goto('/login');
  // Wipe any persisted auth from prior tests.
  await page.evaluate(() => window.localStorage.clear());
  await page.evaluate(() => window.sessionStorage.clear());
  await page.reload();
  await page.getByLabel(/email/i).fill('member@demo.gym');
  await page.getByLabel(/password/i).fill('Password1!');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/app$/);
}

test.describe('Auth flow', () => {
  test('unauthenticated visit to /app redirects to /login', async ({ page }) => {
    await page.goto('/app');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('member can sign in with mock credentials and lands on /app', async ({ page }) => {
    await loginAsMember(page);
    await expect(page.locator('header').getByText(/member portal/i)).toBeVisible();
  });

  test('member visiting /admin lands on /403', async ({ page }) => {
    await loginAsMember(page);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/403$/);
  });

  test('stale persisted user without a session can still open login', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      window.localStorage.setItem(
        'app:auth',
        JSON.stringify({
          state: {
            user: {
              id: 'stale-member',
              email: 'stale@demo.gym',
              fullName: 'Stale Member',
              roles: ['member'],
              tenantId: 'demo-gym',
            },
          },
          version: 1,
        }),
      );
      window.sessionStorage.clear();
    });

    await page.reload();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });
});
