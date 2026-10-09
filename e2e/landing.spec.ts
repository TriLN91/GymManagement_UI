import { expect, test } from '@playwright/test';

test('desktop audience toggle works with keyboard and links to registration', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Có định hướng.');
  await expect(page.locator('canvas')).toHaveCount(0);
  const owner = page.getByRole('button', { name: 'Chủ phòng tập', exact: true }).first();
  await owner.focus();
  await page.keyboard.press('Enter');
  await expect(owner).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Vươn xa hơn.');
  await page.getByRole('link', { name: 'Đăng ký đối tác', exact: true }).first().click();
  await expect(page).toHaveURL(/register/);
});

test('skip link is the first focusable element', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Đến nội dung chính' })).toBeFocused();
});

test('mobile renders the same landing without horizontal scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Chủ phòng tập', exact: true }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Vươn xa hơn.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
