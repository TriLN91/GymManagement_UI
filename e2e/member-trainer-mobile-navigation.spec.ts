import { expect, test } from '@playwright/test';

async function login(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('gmc.locale', 'en');
  });
  await page.reload();
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill('Password1!');
  await page.getByRole('button', { name: /sign in|đăng nhập/i }).click();
}

test('Member mobile navigation exposes plans and AI assessment as distinct core actions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, 'member@demo.gym');
  const mobileNav = page.locator('.member-bottom-nav');
  await expect(mobileNav.getByRole('link')).toHaveCount(5);

  await mobileNav.getByRole('link', { name: 'AI assessment' }).click();
  await expect(page).toHaveURL(/\/app\/workout\/assessment$/);
  await expect(mobileNav.getByRole('link', { name: 'AI assessment' })).toHaveClass(/is-active/);

  await mobileNav.getByRole('link', { name: 'Workout' }).click();
  await expect(page).toHaveURL(/\/app\/workout$/);
  await expect(mobileNav.getByRole('link', { name: 'Workout' })).toHaveClass(/is-active/);

  await page.getByRole('button', { name: 'Open navigation' }).click();
  const menu = page.locator('aside.member-sidebar');
  await menu.getByRole('button', { name: 'Workout' }).click();
  await expect(menu.getByRole('link', { name: 'Weekly schedule' })).toBeVisible();
  await menu.getByRole('link', { name: 'Weekly schedule' }).click();
  await expect(page).toHaveURL(/\/app\/workout\/schedule$/);
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeVisible();
});

test('Trainer mobile navigation exposes members, plans and appointments as separate core actions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, 'pt@demo.gym');
  const mobileNav = page.locator('.member-bottom-nav');
  await expect(mobileNav.getByRole('link')).toHaveCount(5);

  await mobileNav.getByRole('link', { name: 'Appointments' }).click();
  await expect(page).toHaveURL(/\/pt\/appointments$/);
  await expect(mobileNav.getByRole('link', { name: 'Appointments' })).toHaveClass(/is-active/);
  await page
    .locator('.trainer-appointment-mobile-list')
    .getByRole('button', { name: 'Edit appointment' })
    .first()
    .click();
  await expect(page.getByRole('dialog', { name: 'Update appointment' })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();

  await mobileNav.getByRole('link', { name: 'Build a plan' }).click();
  await expect(page).toHaveURL(/\/pt\/workout-builder\/plan$/);
  await expect(mobileNav.getByRole('link', { name: 'Build a plan' })).toHaveClass(/is-active/);

  await page.getByRole('button', { name: 'Open navigation' }).click();
  const menu = page.locator('aside.member-sidebar');
  await menu.getByRole('button', { name: 'Workout builder' }).click();
  await expect(menu.getByRole('link', { name: 'Exercise library' })).toBeVisible();
  await menu.getByRole('link', { name: 'Exercise library' }).click();
  await expect(page).toHaveURL(/\/pt\/workout-builder\/library$/);
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeVisible();
});
