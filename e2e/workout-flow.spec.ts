import { expect, test, type Page } from '@playwright/test';

async function openAsMember(page: Page, path: string) {
  await page.addInitScript(() => {
    const user = {
      id: 'workout-flow-member',
      email: 'member@fit.local',
      fullName: 'Alex Volkov',
      roles: ['member'],
      tenantId: 'fit-e2e',
      locale: 'en',
    };
    window.localStorage.setItem('app:auth', JSON.stringify({ state: { user }, version: 1 }));
    window.localStorage.setItem('gmc.locale', 'en');
    window.sessionStorage.setItem('gmc.accessToken', 'e2e-token');
    window.sessionStorage.setItem('gmc.refreshToken', 'e2e-refresh');
    window.sessionStorage.setItem('gmc.tenantId', user.tenantId);
  });
  await page.goto(path);
}

test.describe('Member workout vertical slice', () => {
  test('records all four tracking types and persists completion locally', async ({ page }) => {
    await openAsMember(page, '/app/workout');

    await page.getByRole('link', { name: /view weekly schedule/i }).click();
    await expect(page).toHaveURL(/\/app\/workout\/schedule$/);
    await expect(page.getByRole('heading', { name: 'Weekly Schedule' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Rest Day' })).toHaveCount(2);

    await page.getByRole('link', { name: /Tuesday.*Back & Lats/i }).click();
    await expect(page.getByText('Bent-over barbell row')).toBeVisible();
    await expect(page.getByText('Tabata row')).toBeVisible();

    await page.getByRole('button', { name: /start session/i }).click();
    await expect(page.getByRole('heading', { name: 'Bent-over barbell row' })).toBeVisible();
    await page.getByLabel('Set 1 load').fill('62.5');
    await page.getByRole('button', { name: /save actual & continue/i }).click();

    await expect(page.getByRole('heading', { name: 'Dead hang' })).toBeVisible();
    await page.getByLabel('Set 1 duration').fill('52');
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Dead hang' })).toBeVisible();
    await page.getByLabel('Set 1 duration').fill('52');
    await page.getByRole('button', { name: /save actual & continue/i }).click();

    await expect(page.getByRole('heading', { name: 'Ergometer row' })).toBeVisible();
    await page.getByLabel('Actual distance (km)').fill('2.2');
    await expect(page.getByText(/\/km$/)).toBeVisible();
    await page.getByRole('button', { name: /save actual & continue/i }).click();

    await expect(page.getByRole('heading', { name: 'Tabata row' })).toBeVisible();
    await page.getByRole('button', { name: /save actual & finish/i }).click();

    await expect(page).toHaveURL(/\/app\/workout\/complete\//);
    await expect(page.getByRole('heading', { name: 'Back & Lats' })).toBeVisible();
    await expect(page.getByText('2.20 km', { exact: true })).toBeVisible();
    await expect(page.getByText(/kg volume/)).toBeVisible();
    await expect(page.getByText('No actual data')).toHaveCount(0);

    const completionUrl = page.url();
    await page.reload();
    await expect(page).toHaveURL(completionUrl);
    await expect(page.getByRole('heading', { name: 'Back & Lats' })).toBeVisible();
    await page.goto('/app/workout/history');
    await expect(page.getByRole('heading', { name: 'Workout history' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Back & Lats' })).toBeVisible();
    await expect(page.getByText('2.20 km')).toBeVisible();

    await page.goto('/app/progress');
    await expect(page.getByRole('heading', { name: 'Workout progress' })).toHaveCount(0);
    await expect(page.getByText('Completed sessions')).toBeVisible();
  });
});
