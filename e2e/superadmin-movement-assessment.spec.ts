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

  await page.getByRole('link', { name: 'Movement Assessment' }).click();
  await expect(page.getByRole('heading', { name: 'Movement Assessment' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Back Squat' })).toBeVisible();

  await page
    .getByRole('row', { name: /Back Squat/ })
    .getByRole('button', { name: 'Open' })
    .click();
  await expect(page.getByRole('heading', { name: 'Back Squat' })).toBeVisible();
  await expect(page.getByText('back-squat-good-side.mp4')).toBeVisible();
  await expect(page.getByText('Needs review')).toBeVisible();

  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByRole('button', { name: 'Activate' })).toBeVisible();
  await page.getByRole('button', { name: 'Activate' }).click();
  await expect(page.getByText('Active').first()).toBeVisible();
});
