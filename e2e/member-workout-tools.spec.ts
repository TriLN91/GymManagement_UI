import { expect, test, type Page } from '@playwright/test';

async function openAsMember(page: Page, path: string) {
  await page.clock.setFixedTime(new Date('2026-10-20T03:00:00Z'));
  await page.addInitScript(() => {
    const user = {
      id: 'member-tools-member',
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

test.describe('Member workout tools', () => {
  test('builds and persists a personal workout', async ({ page }) => {
    await openAsMember(page, '/app/workout/builder');

    await expect(page.getByRole('heading', { name: 'Exercise library' })).toBeVisible();
    await page.locator('[data-muscle="mid_chest"] path').first().click();
    await expect(page.getByRole('button', { name: 'Add Cable Chest Fly' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Barbell Squat' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Add Barbell Bench Press' }).click();
    await page.getByLabel('Name your workout').fill('Push strength');
    await page.getByRole('button', { name: 'Barbell Bench Press', exact: true }).click();
    await page.getByLabel('Load').fill('42.5');
    await page.getByRole('button', { name: 'Mon' }).click();
    await page.getByRole('button', { name: /Save workout/ }).click();

    await page.reload();
    await expect(page.getByLabel('Name your workout')).toHaveValue('Push strength');
    await expect(page.getByText('Barbell Bench Press', { exact: true })).toHaveCount(2);
  });

  test('shows the interactive muscle map and achievement tower', async ({ page }) => {
    await openAsMember(page, '/app/workout/builder');

    await expect(page.locator('[data-muscle="upper_chest"]')).toBeVisible();
    await page.locator('[data-muscle="upper_chest"] path').first().hover();
    await expect(page.locator('.muscle-map__tooltip')).toHaveText('Upper chest');

    await page.goto('/app/workout/achievements');
    await expect(page.getByRole('heading', { name: 'Your progression' })).toBeVisible();
    await expect(page.getByText('150', { exact: true })).toBeVisible();
    await expect(page.getByText('Confirmed XP', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Badges earned' })).toBeVisible();
    await expect(page.getByText('Workout Milestone', { exact: true }).first()).toBeVisible();
  });

  test('adds optional exercises without changing AI or PT plan progress', async ({ page }) => {
    await openAsMember(page, '/app/workout/builder');

    await page.getByRole('button', { name: 'Add Barbell Bench Press' }).click();
    await page.getByLabel('Name your workout').fill('Monday chest add-on');
    await page.getByRole('button', { name: 'Barbell Bench Press', exact: true }).click();
    await page.getByRole('button', { name: 'Mon' }).click();
    await page.getByRole('button', { name: 'Add as optional exercises' }).click();
    await page.locator('.member-builder__canvas .is-save').click();

    await page.goto('/app/workout/schedule');
    await expect(page.getByText('Optional exercises', { exact: true })).toBeVisible();
    await expect(page.getByText('Monday chest add-on', { exact: true })).toBeVisible();
    await expect(page.getByText('Excluded from AI/PT plan completion').first()).toBeVisible();

    await page.getByRole('link', { name: /Monday.*Monday chest add-on/i }).click();
    await expect(page.getByRole('heading', { name: 'Barbell Bench Press' })).toBeVisible();
    await expect(page.getByText('Excluded from AI/PT plan completion')).toBeVisible();
    await page.reload();
    await page.getByRole('button', { name: /start session/i }).click();
    await page.getByLabel('Set 1 load').fill('42.5');
    await page.getByRole('button', { name: /save actual & continue/i }).click();
    await expect(page).toHaveURL(/workout\/complete/);
    await expect
      .poll(() =>
        page.evaluate(() => {
          const state = JSON.parse(
            localStorage.getItem('fitflex:mock-workouts:member-tools-member') ?? '{}',
          );
          return state.sessions?.filter((s: { status: string }) => s.status === 'Completed').length;
        }),
      )
      .toBe(1);
    const accounting = await page.evaluate(() => {
      const state = JSON.parse(
        localStorage.getItem('fitflex:mock-workouts:member-tools-member') ?? '{}',
      );
      return {
        version: state.sessions[0].workoutPlanVersionId,
        completedMain: state.completedMain,
      };
    });
    expect(accounting).toEqual({ version: null, completedMain: false });
    await page.goto('/app/workout/schedule');
    await page.reload();
    await expect(page.getByRole('link', { name: /Tuesday.*Day 1/i })).toBeVisible();
    await expect(page.getByText('Monday chest add-on', { exact: true })).toBeVisible();
  });

  test('opens assessment for the current exercise and resumes the session', async ({ page }) => {
    await openAsMember(page, '/app/workout/schedule');
    await page.getByRole('link', { name: /Tuesday.*Day 1/i }).click();

    await page.getByRole('button', { name: /start session/i }).click();
    await expect(page.getByRole('heading', { name: 'Hip hinge' })).toBeVisible();
    await page.getByLabel('Set 2 load').fill('42.5');
    await page.getByRole('button', { name: /assess my form/i }).click();

    await expect(page).toHaveURL(
      /\/app\/workout\/assessment\/20000000-0000-4000-8000-000000000001$/,
    );
    await expect(page.getByRole('heading', { name: 'Form assessment' })).toHaveCount(0);
    await expect(page.getByText('Hip hinge', { exact: true })).toBeVisible();
    await page.reload();

    await page.locator('input[type="file"]').setInputFiles({
      name: 'bench-form.webm',
      mimeType: 'video/webm',
      buffer: Buffer.from('test-video'),
    });
    await expect(page.getByText('bench-form.webm')).toBeVisible();
    await page.getByRole('button', { name: /submit for assessment/i }).click();
    await expect(page.getByText('Video is ready')).toBeVisible();

    await page
      .getByRole('button', { name: /resume workout/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/app\/workout\/session\/2026-10-20$/);
    await expect(page.getByLabel('Set 2 load')).toHaveValue('42.5');
    await expect(page.getByLabel('Set 2 load')).toBeFocused();
    await expect(page.getByRole('heading', { name: 'Hip hinge' })).toBeVisible();
  });
});

test('progression shows the API error and recovers on explicit retry', async ({ page }) => {
  await openAsMember(page, '/app/workout/builder');
  await page.evaluate(() => sessionStorage.setItem('fitflex:mock:progression-fail', 'true'));
  await page.goto('/app/workout/achievements');
  await expect(page.getByRole('alert')).toContainText("We couldn't load your progression");
  await expect(page.getByText('Confirmed XP', { exact: true })).toHaveCount(0);
  await page.evaluate(() => sessionStorage.removeItem('fitflex:mock:progression-fail'));
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your progression' })).toBeVisible();
  await expect(page.getByText('150', { exact: true })).toBeVisible();
  await expect(page.getByText('Bronze', { exact: true })).toBeVisible();
  await expect(page.getByText('Silver', { exact: true })).toBeVisible();
});
