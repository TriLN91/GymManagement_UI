import { expect, test } from '@playwright/test';

test.use({
  launchOptions: {
    args: [
      '--enable-webgl',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
    ],
  },
});

test('wheel input eases into scrolling and updates the rendered 3D scene', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const canvas = page.locator('.fit-object canvas[data-engine]');
  await expect(canvas).toBeVisible();
  await expect(page.locator('html')).toHaveClass(/lenis/);
  await page.waitForTimeout(2500);
  const before = await canvas.screenshot();
  await page.mouse.move(1000, 500);
  await page.mouse.wheel(0, 1000);
  const earlyScroll = await page.evaluate(
    () =>
      new Promise<number>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(window.scrollY))),
      ),
  );
  expect(earlyScroll).toBeLessThan(1000);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(950);
  await expect(page.locator('.fit-tracking')).toBeVisible();
  const after = await canvas.screenshot();
  expect(after.equals(before)).toBe(false);
  await page.getByRole('link', { name: 'Bắt đầu tập luyện', exact: true }).first().click();
  await expect(page).toHaveURL(/register/);
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
});
