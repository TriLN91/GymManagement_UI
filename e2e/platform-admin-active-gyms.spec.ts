import { expect, test } from '@playwright/test';

test('filters gym people and shows all or one trainer bookings by week', async ({ page }) => {
  await page.goto('/login');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('gmc.locale', 'en');
  });
  await page.reload();
  await page.getByLabel(/email/i).fill('super@demo.gym');
  await page.getByLabel(/password/i).fill('Password1!');
  await page.getByRole('button', { name: /đăng nhập|sign in/i }).click();
  await expect(page).toHaveURL(/\/superadmin$/);

  await page.goto('/superadmin/gyms');
  await page.getByRole('link', { name: 'Detail' }).first().click();
  await expect(page.getByText('Northstar Fitness')).toBeVisible();

  const trainers = page.getByRole('region', { name: 'Trainers' });
  const members = page.getByRole('region', { name: 'Members' });
  const schedule = page.getByRole('region', { name: 'Booking schedule' });
  await expect(trainers.getByRole('row')).toHaveCount(4);
  await trainers.getByPlaceholder('Search trainers').fill('Minh');
  await expect(trainers.getByRole('row')).toHaveCount(2);
  await trainers.getByPlaceholder('Search trainers').clear();

  await members.getByLabel('Trainer').selectOption('trainer-hana');
  await expect(members.getByText('Mai Nguyen')).toBeVisible();
  await expect(members.getByText('Alex Volkov')).toHaveCount(0);

  await expect(schedule.locator('.platform-booking')).toHaveCount(5);
  await trainers.getByRole('button', { name: 'View schedule' }).first().click();
  await expect(schedule.locator('.platform-booking')).toHaveCount(2);
  await schedule.getByLabel('Trainers').selectOption('all');
  await expect(schedule.locator('.platform-booking')).toHaveCount(5);
  await schedule.getByRole('button', { name: 'Next week' }).click();
  await expect(schedule.getByText('No bookings for this week and trainer.')).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
