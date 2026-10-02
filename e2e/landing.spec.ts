import { expect, test } from '@playwright/test';

test('desktop audience toggle works with keyboard and removes the hero pin', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('.fit-hero')).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 950));
  await expect(page.locator('.fit-tracking')).toBeVisible();
  const owner = page.getByRole('button', { name: 'Chủ phòng tập', exact: true }).first();
  await owner.focus();
  await page.keyboard.press('Enter');
  await expect(owner).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.fit-owner-hero')).toBeVisible();
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await page.getByRole('link', { name: 'Đăng ký đối tác', exact: true }).first().click();
  await expect(page).toHaveURL(/register/);
});

test('reduced motion keeps the hero readable without a scroll pin', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Có định hướng.');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Đến nội dung chính' })).toBeFocused();
});

test('mobile preserves the existing page and does not request the desktop feature', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const desktopRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/features/landing/')) desktopRequests.push(request.url());
  });
  await page.goto('/');
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.locator('.fit-landing')).toHaveCount(0);
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(desktopRequests).toEqual([]);
});

test('desktop-to-mobile resize cleans up pinned scroll space', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.fit-hero')).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 950));
  await expect(page.locator('.fit-tracking')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.fit-landing')).toHaveCount(0);
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator('.fit-hero')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
