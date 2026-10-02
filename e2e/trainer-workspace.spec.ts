import { expect, test, type Page } from '@playwright/test';

async function openAsTrainer(page: Page, path: string) {
  await page.addInitScript(() => {
    const user = {
      id: 'trainer-workspace-e2e',
      email: 'pt@demo.gym',
      fullName: 'Paolo Trainer',
      roles: ['pt'],
      tenantId: 't-001',
      locale: 'en',
    };
    if (!sessionStorage.getItem('trainer-workspace-e2e-seeded')) {
      localStorage.clear();
      localStorage.setItem('app:auth', JSON.stringify({ state: { user }, version: 1 }));
      localStorage.setItem('gmc.locale', 'en');
      sessionStorage.setItem('trainer-workspace-e2e-seeded', 'true');
    }
    sessionStorage.setItem('gmc.accessToken', 'e2e-token');
    sessionStorage.setItem('gmc.refreshToken', 'e2e-refresh');
    sessionStorage.setItem('gmc.tenantId', user.tenantId);
  });
  await page.goto(path);
}

test.describe('Trainer workspace', () => {
  test('opens every major Trainer workspace from its route', async ({ page }) => {
    await openAsTrainer(page, '/pt');
    await expect(page.locator('.trainer-metric-grid')).toBeVisible();

    await page.goto('/pt/member-data');
    await expect(page.getByText('Planned workouts')).toBeVisible();
    await page.goto('/pt/members');
    await expect(page.getByPlaceholder('Search name or email')).toBeVisible();
    await page.goto('/pt/workout-builder/library');
    await expect(page.getByPlaceholder('Search exercise, muscle or equipment')).toBeVisible();
    await page.goto('/pt/workout-builder/plan');
    await expect(page.getByLabel('Plan name')).toBeVisible();
    await page.goto('/pt/workout-builder/member-workout');
    await expect(page.getByRole('heading', { name: 'Alex Volkov' })).toBeVisible();
    await page.goto('/pt/appointments');
    await expect(page.getByRole('columnheader', { name: 'Member' })).toBeVisible();
    await page.goto('/pt/history/coaching');
    await expect(page.getByText('Progressive load updated')).toBeVisible();
    await page.goto('/pt/history/income');
    await expect(page.getByText('Total income')).toBeVisible();
  });

  test('connects Member list, exercise library, plan builder and current workout', async ({
    page,
  }) => {
    await openAsTrainer(page, '/pt/members');
    const alex = page.locator('.trainer-member-card').filter({ hasText: 'Alex Volkov' });
    await alex.getByRole('button', { name: 'View detail' }).click();
    await expect(page).toHaveURL(/\/pt\/members\/alex$/);
    await expect(page.getByRole('heading', { name: 'Alex Volkov' })).toBeVisible();
    await expect(page.getByText('Previous right shoulder impingement')).toBeVisible();
    await expect(page.getByRole('textbox')).toHaveCount(0);

    await page.goto('/pt/members');
    const alexAfterDetail = page.locator('.trainer-member-card').filter({ hasText: 'Alex Volkov' });
    await alexAfterDetail.getByRole('button', { name: 'View workout' }).click();
    await expect(page).toHaveURL(/\/pt\/workout-builder\/member-workout$/);
    await expect(page.getByRole('heading', { name: 'Alex Volkov' })).toBeVisible();

    await page.goto('/pt/workout-builder/library');
    const bench = page.locator('.trainer-exercise-library article').filter({
      hasText: 'Barbell Bench Press',
    });
    await bench.getByRole('button', { name: 'Add Barbell Bench Press' }).click();
    await page
      .locator('.trainer-library-heading')
      .getByRole('button', { name: 'Open plan' })
      .click();
    await page.getByLabel('Plan name').fill('E2E Performance Plan');
    await expect(page.getByText('LIVE MUSCLE MAP')).toBeVisible();
    await expect(page.getByRole('img', { name: 'Posterior anatomy muscle map' })).toBeVisible();
    await page.getByRole('button', { name: 'Save plan' }).click();
    await expect(page.getByText('Plan saved.')).toBeVisible();

    await page.goto('/pt/workout-builder/member-workout');
    await expect(page.getByText(/E2E Performance Plan · Week/)).toBeVisible();
  });

  test('creates an appointment and exposes history and income data', async ({ page }) => {
    await openAsTrainer(page, '/pt/appointments');
    await page.getByRole('button', { name: 'Create appointment' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Appointment type').selectOption({ label: 'Video check-in' });
    await dialog.getByLabel('Notes').fill('E2E movement review');
    await dialog.getByRole('button', { name: 'Save appointment' }).click();
    await expect(page.getByText('E2E movement review')).toBeVisible();

    await page.goto('/pt/history/coaching');
    await expect(page.getByText('Progressive load updated')).toBeVisible();
    await page.goto('/pt/history/income');
    await expect(page.getByText('Strength Foundation · 8 sessions').first()).toBeVisible();
  });

  test('filters the exercise library and keeps filter chips in sync', async ({ page }) => {
    await openAsTrainer(page, '/pt/workout-builder/library');

    const equipment = page.locator('.trainer-library-filter').filter({ hasText: 'Equipment' });
    await equipment.locator('summary').click();
    await equipment.getByText('Cable', { exact: true }).click();
    await equipment.getByText('Bike', { exact: true }).click();
    await expect(page.getByText('3 results')).toBeVisible();
    await equipment.locator('summary').click();

    const difficulty = page.locator('.trainer-library-filter').filter({ hasText: 'Difficulty' });
    await difficulty.locator('summary').click();
    await difficulty.getByText('Beginner', { exact: true }).click();
    await expect(page.getByText('2 results')).toBeVisible();

    await page.getByRole('button', { name: 'Remove Cable' }).click();
    await expect(page.getByText('0 results')).toBeVisible();
    await page.getByRole('button', { name: 'Clear all' }).click();
    await expect(page.getByText('8 results')).toBeVisible();
  });

  test('adds one exercise to multiple selected days and opens its media preview', async ({
    page,
  }) => {
    await openAsTrainer(page, '/pt/workout-builder/plan');

    await page.getByRole('button', { name: 'Wed', exact: true }).click();
    await page.getByRole('button', { name: 'View video Bike Sprint Intervals' }).click();
    await expect(page.getByRole('dialog')).toContainText('Preview video unavailable');
    await page.getByRole('button', { name: 'Close' }).click();

    await page.getByRole('button', { name: 'Add Bike Sprint Intervals' }).click();
    await expect(
      page.locator('.trainer-plan-exercise').filter({ hasText: 'Bike Sprint Intervals' }),
    ).toHaveCount(2);
    await page.getByRole('button', { name: 'Save plan' }).click();
    await expect(page.getByText('Plan saved.')).toBeVisible();
  });

  test('filters the Builder library from the male anatomy map', async ({ page }) => {
    await openAsTrainer(page, '/pt/workout-builder/plan');
    await page.getByRole('button', { name: 'Expand muscle map' }).click();
    const mapDialog = page.getByRole('dialog');
    await expect(mapDialog).toBeVisible();
    await mapDialog.locator('g[data-muscle="mid_chest"] > path').first().click();
    await expect(mapDialog).toHaveCount(0);
    await expect(page.locator('.trainer-builder-library-list article')).toHaveCount(1);
    await expect(page.locator('.trainer-builder-library-list')).toContainText(
      'Barbell Bench Press',
    );

    await page.locator('g[data-muscle="latissimus_dorsi"] > path').first().click();
    await expect(page.locator('.trainer-builder-library-list article')).toHaveCount(2);
    await expect(page.locator('.trainer-builder-library-list')).toContainText('Lat Pulldown');

    await page.getByRole('button', { name: 'Clear', exact: true }).click();
    await expect(page.locator('.trainer-builder-library-list article')).toHaveCount(8);

    await page.getByRole('button', { name: 'Mid chest' }).press('Enter');
    await expect(page.locator('.trainer-builder-library-list article')).toHaveCount(1);
  });

  test('lights only muscles scheduled on the selected Builder days', async ({ page }) => {
    await openAsTrainer(page, '/pt/workout-builder/plan');
    const map = page.locator('.trainer-live-map');

    await expect(map.locator('g.has-volume').first()).toBeVisible();
    await page.getByRole('button', { name: 'Tue', exact: true }).click();
    await page.getByRole('button', { name: 'Mon', exact: true }).click();
    await expect(page.getByText('No exercises for this day')).toBeVisible();
    await expect(map.locator('g.has-volume')).toHaveCount(0);

    await page.getByRole('button', { name: 'Add Barbell Bench Press' }).click();
    await expect(map.locator('g[data-muscle="mid_chest"].has-volume')).toBeVisible();

    await page.getByRole('button', { name: 'Thu', exact: true }).click();
    await page.getByRole('button', { name: 'Tue', exact: true }).click();
    await expect(map.locator('g[data-muscle="mid_chest"].has-volume')).toHaveCount(0);
    await expect(map.locator('g.has-volume').first()).toBeVisible();
  });
});
