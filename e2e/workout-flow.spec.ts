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

// The plan, catalog, schedule and sessions come from the MSW handlers (workouts.ts, progression.ts).
test.describe('Member workout vertical slice', () => {
  test('logs a scheduled plan day, syncs it and shows it in history and progress', async ({
    page,
  }) => {
    await openAsMember(page, '/app/workout');

    await page.getByRole('link', { name: /view weekly schedule/i }).click();
    await expect(page).toHaveURL(/\/app\/workout\/schedule$/);

    await page.getByRole('link', { name: /Day 1.*Today's session/i }).click();
    await expect(page.getByRole('heading', { name: 'Bent-over barbell row' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dead hang' })).toBeVisible();

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

    await expect(page).toHaveURL(/\/app\/workout\/complete\//);
    await expect(page.getByText('Saved to your account.')).toBeVisible();
    await expect(page.getByText(/kg volume/)).toBeVisible();
    await expect(page.getByText('No actual data')).toHaveCount(0);

    // MSW state lives in the page, so move around in-app (no reload) to read what was stored.
    await page.getByRole('link', { name: 'History' }).first().click();
    await expect(page).toHaveURL(/\/app\/workout\/history$/);
    await expect(page.getByText('Plan workout')).toBeVisible();

    await page.getByRole('link', { name: 'Progress' }).first().click();
    await expect(page.getByText('Completed sessions')).toBeVisible();
  });
});
