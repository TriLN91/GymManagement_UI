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

test.describe('Platform Admin M4', () => {
  test('confirms a future commission version and rejects invalid bundled Plus price', async ({
    page,
  }) => {
    await loginPlatformAdmin(page);
    await page.goto('/superadmin/commercial');
    await page.getByLabel('Commission rate').fill('11');
    await page.getByLabel('Effective from').fill('2030-01-01T00:00');
    await page.getByRole('button', { name: 'Save configuration' }).first().click();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('11%', { exact: true })).toBeVisible();
    await page.getByLabel('Bundled price').fill('250000');
    await page.getByRole('button', { name: 'Save configuration' }).last().click();
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('keeps backend financial components separated in order detail and exports list', async ({
    page,
  }) => {
    await loginPlatformAdmin(page);
    await page.goto('/superadmin/transactions/orders');
    await expect(
      page.getByText(
        'Backend-provided financial values. No calculation or transaction editing occurs in this screen.',
      ),
    ).toBeVisible();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export CSV' }).click();
    expect((await download).suggestedFilename()).toBe('platform-orders.csv');
    await page.getByRole('link', { name: 'Detail' }).first().click();
    await expect(page.getByText('Gym service price')).toBeVisible();
    await expect(page.getByText('Net received')).toBeVisible();
  });
});
