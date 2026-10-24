import { expect, test, type Page } from '@playwright/test';

async function openAsMember(page: Page, path: string) {
  await page.clock.setFixedTime(new Date('2026-10-20T03:00:00Z'));
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
  test('keeps unavailable progress distinct from a successful empty result', async ({ page }) => {
    await page.addInitScript(() =>
      window.sessionStorage.setItem('fitflex:mock:progression-fail', 'true'),
    );
    await openAsMember(page, '/app/progress');

    await expect(
      page.getByRole('alert').filter({ hasText: /couldn't load your plan or schedule/ }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('heading', { name: 'Workout data' })).toHaveCount(0);
    await expect(page.getByText('0 kg', { exact: true })).toHaveCount(0);

    await page.evaluate(() => window.sessionStorage.removeItem('fitflex:mock:progression-fail'));
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByRole('heading', { name: 'Workout data' })).toBeVisible();
    await expect(page.getByText('0 kg', { exact: true })).toBeVisible();
    await expect(page.getByText('Complete your first workout to see progress data.')).toBeVisible();
  });

  // The live plan contract prescribes strength and timed exercises.
  test('records supported strength and duration types and persists completion through the API', async ({
    page,
  }) => {
    await openAsMember(page, '/app/workout');

    await page.getByRole('link', { name: /view weekly schedule/i }).click();
    await expect(page).toHaveURL(/\/app\/workout\/schedule$/);
    await expect(page.getByRole('heading', { name: 'Rest day' })).toHaveCount(2);
    await expect(page.getByRole('heading', { name: 'Day 1' })).toHaveCount(2);

    await page.getByRole('link', { name: /Tuesday.*Day 1/i }).click();
    await expect(page.getByRole('heading', { name: 'Hip hinge' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dead hang' })).toBeVisible();

    await page.getByRole('button', { name: /start session/i }).click();
    await expect(page.getByRole('heading', { name: 'Hip hinge' })).toBeVisible();
    await page.getByLabel('Set 1 load').fill('62.5');
    await page.getByRole('button', { name: /save actual & continue/i }).click();

    await expect(page.getByRole('heading', { name: 'Dead hang' })).toBeVisible();
    await page.getByLabel('Set 1 duration').fill('52');
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Dead hang' })).toBeVisible();
    await expect(page.getByLabel('Set 1 duration')).toHaveValue('52');
    await page.evaluate(() => sessionStorage.setItem('fitflex:mock:completion-fail', 'true'));
    await page.getByRole('button', { name: /save actual & continue/i }).click();

    await expect(page).toHaveURL(/\/app\/workout\/complete\//);
    await expect(page.getByRole('heading', { name: 'Day 1' })).toBeVisible();

    await expect(page.getByText(/kg volume/)).toBeVisible();
    await expect(page.getByText(/Not saved to your account yet/)).toBeVisible();
    await expect(page.getByText('No actual data')).toHaveCount(0);

    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem('fitflex:mock-workouts:workout-flow-member') ?? '{}')
              .sessions?.[0]?.status,
        ),
      )
      .toBe('Planned');
    const completionUrl = page.url();
    await page.reload();
    await expect(page).toHaveURL(completionUrl);
    await expect(page.getByRole('heading', { name: 'Day 1' })).toBeVisible();
    await page.evaluate(() => {
      sessionStorage.removeItem('fitflex:mock:completion-fail');
      window.dispatchEvent(new Event('online'));
    });
    await expect(page.getByText('Saved to your account.')).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem('fitflex:mock-workouts:workout-flow-member') ?? '{}')
              .sessions?.[0]?.status,
        ),
      )
      .toBe('Completed');
    await page.goto('/app/workout/history');
    await expect(page.getByRole('heading', { name: 'Workout history' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Plan workout' })).toBeVisible();

    await expect
      .poll(async () =>
        page.evaluate(() => {
          const data = JSON.parse(
            localStorage.getItem('fitflex:mock-workouts:workout-flow-member') ?? '{}',
          );
          return data.sessions?.filter((s: { status: string }) => s.status === 'Completed').length;
        }),
      )
      .toBe(1);
    await page.goto('/app/progress');
    await expect(page.getByRole('heading', { name: 'Workout progress' })).toHaveCount(0);
    await expect(page.getByText('Completed sessions')).toBeVisible();
  });
});

// CF05 809737a: create-stage outbox failure, adapted to the integrated persistent API fixture.
test('recovers after session creation fails without duplicating the completed workout', async ({
  page,
}) => {
  await openAsMember(page, '/app/workout/schedule');
  await page.evaluate(() => sessionStorage.setItem('fitflex:mock:creation-fail', 'true'));
  await page.getByRole('link', { name: /Tuesday.*Day 1/i }).click();
  await page.getByRole('button', { name: /start session/i }).click();
  await page.getByRole('button', { name: /save actual & continue/i }).click();
  await page.getByRole('button', { name: /save actual & continue/i }).click();
  await expect(page).toHaveURL(/workout\/complete/);
  const failedOnReload = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().endsWith('/workouts/me/sessions') &&
      response.status() === 503,
  );
  await page.reload();
  await failedOnReload;
  await expect(page.getByRole('button', { name: 'Retry now', exact: true })).toBeVisible();
  const stored = () =>
    page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('fitflex:mock-workouts:workout-flow-member') ?? '{}')
          .sessions ?? [],
    );
  expect(await stored()).toHaveLength(0);
  await page.evaluate(() => sessionStorage.removeItem('fitflex:mock:creation-fail'));
  await page.getByRole('button', { name: 'Retry now', exact: true }).click();
  await expect
    .poll(async () => {
      const sessions = (await stored()) as Array<{ status: string }>;
      return sessions.filter((s) => s.status === 'Completed').length;
    })
    .toBe(1);
  await page.reload();
  expect(await stored()).toHaveLength(1);
});
