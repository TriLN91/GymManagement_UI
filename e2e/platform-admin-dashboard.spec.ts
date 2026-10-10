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
  await page.getByRole('button', { name: /đăng nhập/i }).click();
  await expect(page).toHaveURL(/\/superadmin$/);
}

test.describe('Platform Admin M1', () => {
  test('shows the grouped shell and scoped operational dashboard', async ({ page }) => {
    const runtimeErrors: string[] = [];
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(message.text());
    });
    await loginPlatformAdmin(page);
    await expect(page.locator('.member-topbar').getByText('Platform workspace')).toBeVisible();
    await expect(page.getByText('Sample data')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pending approvals' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Moderation queue' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Open disputes' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Operational alerts' })).toBeVisible();
    await page.getByRole('button', { name: 'Approvals', exact: true }).click();
    await expect(page.getByRole('link', { name: 'Gym applications' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Operational overview' })).toHaveCount(0);
    expect(runtimeErrors).toEqual([]);
  });

  test('hides, reorders and persists widgets', async ({ page }) => {
    await loginPlatformAdmin(page);
    await page.getByRole('button', { name: 'Customize dashboard' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('checkbox', { name: 'Moderation queue' }).uncheck();
    for (let step = 0; step < 3; step += 1) {
      await dialog.getByRole('button', { name: 'Move up: Operational alerts' }).click();
    }
    await dialog.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Moderation queue' })).toHaveCount(0);
    await expect(page.locator('.platform-widget h2').first()).toHaveText('Operational alerts');
    await page.reload();
    await expect(page.locator('.platform-widget h2').first()).toHaveText('Operational alerts');
    await expect(page.getByRole('heading', { name: 'Moderation queue' })).toHaveCount(0);
  });

  test('switches language and keeps the mobile layout usable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginPlatformAdmin(page);
    await expect(page.getByText('Sample data')).toBeVisible();
    await page.getByRole('button', { name: 'Tiếng Việt' }).click();
    await expect(page.getByText('Dữ liệu minh họa')).toBeVisible();
    await page.getByRole('button', { name: 'Mở điều hướng' }).click();
    await expect(
      page.getByRole('navigation', { name: 'Không gian quản trị nền tảng' }),
    ).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      390,
    );
  });
});
