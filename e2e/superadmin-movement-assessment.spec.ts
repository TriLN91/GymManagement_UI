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

  await page.getByRole('link', { name: 'Exercise references' }).click();
  await expect(page.getByRole('heading', { name: 'Exercise Reference Library' })).toBeVisible();
  await expect(page.getByRole('cell', { name: /Back Squat/ })).toBeVisible();

  await page
    .getByRole('row', { name: /Back Squat/ })
    .getByRole('button', { name: 'Continue preparation' })
    .click();
  await expect(page.getByRole('heading', { name: 'Back Squat' })).toBeVisible();
  await expect(page.getByText('back-squat-good-side.mp4')).toBeVisible();
  await expect(page.getByText('Needs review')).toBeVisible();

  await page.getByRole('button', { name: 'Approve this reference version' }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Approve this reference version' })
    .click();
  await expect(page.getByRole('button', { name: 'Publish as live' })).toBeVisible();
  await page.getByRole('button', { name: 'Publish as live' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Publish as live' }).click();
  await expect(page.getByText('Live for assessments').first()).toBeVisible();
});
