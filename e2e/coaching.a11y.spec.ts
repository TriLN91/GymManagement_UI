import { test, expect } from '@playwright/test';

test.describe('Coaching — accessibility wiring', () => {
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

  test('plan region is announced via aria-labelledby pointing at the h2 heading', async ({ page }) => {
    await page.goto('/app/coaching');

    const region = page.getByTestId('coaching-plan-region');
    await expect(region).toBeVisible();

    const labelledBy = await region.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();

    const heading = region.locator(`#${labelledBy ?? ''}`);
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText(/your coaching plan/i);
  });

  test('check-in dialog has labelled inputs (Label ↔ Input connected)', async ({ page }) => {
    await page.goto('/app/coaching');
    await page.getByRole('button', { name: /new check-in/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Every <label for> in the dialog must point at an input inside the dialog.
    const labels = dialog.locator('label[for]');
    const count = await labels.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i += 1) {
      const label = labels.nth(i);
      const forAttr = await label.getAttribute('for');
      expect(forAttr, `label #${i} missing for`).toBeTruthy();
      const linked = dialog.locator(`#${forAttr ?? ''}`);
      await expect(linked, `input for label #${i} should exist in the dialog`).toHaveCount(1);
    }

    // Spot-check: the visible label text is the same as the resolved label
    // for the input (Radix htmlFor semantics).
    const weightLabel = dialog.locator('label[for]', { hasText: /weight/i }).first();
    const weightFor = await weightLabel.getAttribute('for');
    expect(weightFor).toBeTruthy();
    await expect(dialog.locator(`#${weightFor ?? ''}`)).toHaveAttribute('type', 'number');
  });
});