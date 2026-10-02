import { expect, test, type Page } from '@playwright/test';

async function openAsMember(page: Page, path: string) {
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
    await expect(page.getByRole('heading', { name: 'Progression tower' })).toBeVisible();
    await expect(page.getByText('Floor 08')).toBeVisible();
    await expect(page.getByText('Progress is protected')).toBeVisible();
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
    await expect(page.getByText('Does not affect AI/PT plan progress')).toBeVisible();

    await page.getByRole('link', { name: /Monday.*Monday chest add-on/i }).click();
    await expect(page.getByRole('heading', { name: 'Barbell Bench Press' })).toBeVisible();
    await expect(page.getByText('Excluded from AI/PT plan completion')).toBeVisible();
  });

  test('opens assessment for the current exercise and resumes the session', async ({ page }) => {
    await openAsMember(page, '/app/workout/schedule');
    await page.getByRole('link', { name: /Tuesday.*Back & Lats/i }).click();

    await page.getByRole('button', { name: /start session/i }).click();
    await expect(page.getByRole('heading', { name: 'Bent-over barbell row' })).toBeVisible();
    await page.getByRole('button', { name: /assess my form/i }).click();

    await expect(page).toHaveURL(/\/app\/workout\/assessment\/bent-over-row$/);
    await expect(page.getByRole('heading', { name: 'Form assessment' })).toHaveCount(0);
    await expect(page.getByText('Bent-over barbell row', { exact: true })).toBeVisible();

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
    await expect(page).toHaveURL(/\/app\/workout\/session\/tuesday-back-lats$/);
    await expect(page.getByRole('heading', { name: 'Bent-over barbell row' })).toBeVisible();
  });
});
