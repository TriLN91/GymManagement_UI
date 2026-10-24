import { expect, test } from '@playwright/test';

test('SuperAdmin reviews, confirms and activates a movement reference profile', async ({
  page,
}) => {
  await page.goto('/login');
  await page.evaluate(() => {
    window.localStorage.clear();
    window.localStorage.setItem('gmc.locale', 'en');
    window.sessionStorage.clear();
  });
  await page.reload();
  await page.getByLabel(/email/i).fill('super@demo.gym');
  await page.getByLabel(/password/i).fill('Password1!');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/superadmin$/);

  await page.getByRole('button', { name: 'Assessment standards' }).click();
  await page.getByRole('link', { name: 'Exercise references' }).click();
  await expect(page.getByRole('heading', { name: 'Exercise library', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Hip hinge.*Bodyweight/ }).click();
  await expect(page.getByRole('heading', { name: 'Hip hinge', exact: true })).toBeVisible();

  await expect
    .poll(() => page.locator('video').evaluate((video: HTMLVideoElement) => video.readyState))
    .toBeGreaterThanOrEqual(2);
  await page.getByRole('button', { name: 'Continue the existing draft' }).click();
  await expect(page.getByRole('button', { name: 'Review & publish', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Inspect reference', exact: false }).first().click();
  await page.getByRole('button', { name: 'Confirm reference measurements', exact: true }).click();
  await page.getByRole('button', { name: 'Publish reference measurements', exact: true }).click();
  const referenceDialog = page.getByRole('dialog');
  await referenceDialog
    .getByRole('button', { name: 'Publish reference measurements', exact: true })
    .click();
  await expect(page.getByText('Published reference', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Continue the existing draft' }).click();
  await expect(page.getByRole('button', { name: 'Review & publish', exact: true })).toBeDisabled();
  await page
    .getByRole('textbox', { name: /^Review note/ })
    .fill('Reviewed aligned retained evidence and the current Mobile runtime contract.');
  await page.getByRole('button', { name: 'Save reviewed configuration', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Review & publish', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Review & publish', exact: true }).click();
  const publication = page.getByRole('dialog');
  await expect(
    publication.getByRole('button', { name: 'Publish to Mobile', exact: true }),
  ).toBeDisabled();
  await publication.getByRole('checkbox').check();
  await publication.getByRole('button', { name: 'Publish to Mobile', exact: true }).click();
  await expect(
    page.getByText('Configuration published. Members can load this exact version.', {
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText('Published', { exact: true }).first()).toBeVisible();
});
