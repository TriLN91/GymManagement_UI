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
  // The live plan contract only prescribes strength (sets x reps) and timed (sets x seconds) exercises;
  // distance and interval trackers are not reachable from a server plan until the Backend models them.
  test('records strength and duration exercises and syncs the completion', async ({ page }) => {
    await openAsMember(page, '/app/workout');

    await page.getByRole('link', { name: /view weekly schedule/i }).click();
    await expect(page).toHaveURL(/\/app\/workout\/schedule$/);
    await expect(page.getByRole('heading', { name: 'Rest day' })).toHaveCount(4);
    await expect(page.getByRole('heading', { name: 'Day 1' })).toHaveCount(2);

    await page.getByRole('link', { name: /Tuesday.*Day 2/i }).click();
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
    await expect(page.getByRole('heading', { name: 'Day 2' })).toBeVisible();
    await expect(page.getByText('Saved to your account.')).toBeVisible();
    await expect(page.getByText('625 kg', { exact: true })).toBeVisible();
    await expect(page.getByText('No actual data')).toHaveCount(0);

    // The mock backend lives in the page, so navigate in-app instead of reloading to keep the synced session.
    await page.getByRole('link', { name: 'Workout history' }).click();
    await expect(page.getByRole('heading', { name: 'Plan workout' })).toBeVisible();

    // The local outbox survives a reload: the completed workout is still reachable by its URL.
    await page.goBack();
    const completionUrl = page.url();
    await page.reload();
    await expect(page).toHaveURL(completionUrl);
    await expect(page.getByRole('heading', { name: 'Day 2' })).toBeVisible();
  });

  test('keeps an unsynced workout and retries when the server is unavailable', async ({ page }) => {
    await page.addInitScript(() =>
      window.sessionStorage.setItem('msw:fail', 'workout-session-create'),
    );
    await openAsMember(page, '/app/workout/schedule');

    await page.getByRole('link', { name: /Tuesday.*Day 2/i }).click();
    await page.getByRole('button', { name: /start session/i }).click();
    await page.getByRole('button', { name: /save actual & continue/i }).click();
    await page.getByRole('button', { name: /save actual & continue/i }).click();

    await expect(page).toHaveURL(/\/app\/workout\/complete\//);
    await expect(page.getByText(/Not saved to your account yet/)).toBeVisible();

    await page.evaluate(() => window.sessionStorage.removeItem('msw:fail'));
    await page.getByRole('button', { name: 'Retry now' }).click();
    await expect(page.getByText('Saved to your account.')).toBeVisible();
  });
});
