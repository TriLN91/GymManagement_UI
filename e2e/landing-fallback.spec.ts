import { expect, test } from '@playwright/test';

test.use({ launchOptions: { args: ['--disable-webgl'] } });
test('without WebGL the static dumbbell and registration remain visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.fit-dumbbell-fallback')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Bắt đầu tập luyện', exact: true }).first(),
  ).toBeVisible();
});
