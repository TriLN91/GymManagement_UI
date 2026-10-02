import { expect, test, type Page } from '@playwright/test';

async function openAsTrainer(page: Page, path: string) {
  await page.addInitScript(() => {
    const user = {
      id: 'trainer-profile-e2e',
      email: 'pt@demo.gym',
      fullName: 'Paolo Trainer',
      roles: ['pt'],
      tenantId: 't-001',
      locale: 'en',
    };
    const seedKey = 'trainer-profile-e2e-seeded';
    if (!window.sessionStorage.getItem(seedKey)) {
      window.localStorage.clear();
      window.localStorage.setItem('app:auth', JSON.stringify({ state: { user }, version: 1 }));
      window.localStorage.setItem('gmc.locale', 'en');
      window.sessionStorage.setItem(seedKey, 'true');
    }
    window.sessionStorage.setItem('gmc.accessToken', 'e2e-token');
    window.sessionStorage.setItem('gmc.refreshToken', 'e2e-refresh');
    window.sessionStorage.setItem('gmc.tenantId', user.tenantId);
  });
  await page.goto(path);
}

test.describe('Trainer profile', () => {
  test('uses the shared role shell with grouped navigation and language switching', async ({
    page,
  }) => {
    await openAsTrainer(page, '/pt/profile');

    await expect(page.getByRole('button', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Members' })).toBeVisible();
    await page.getByRole('button', { name: 'Workout builder' }).click();
    await expect(page.getByRole('link', { name: 'Build a plan' })).toBeVisible();

    await page.getByRole('button', { name: /Tiếng Việt/ }).click();
    await expect(page.getByRole('link', { name: 'Chỉnh sửa hồ sơ' })).toBeVisible();
  });

  test('edits and persists personal and professional information', async ({ page }) => {
    await openAsTrainer(page, '/pt/profile');

    await expect(page.getByRole('heading', { name: 'Paolo Trainer' })).toBeVisible();
    await expect(page.getByText('Assigned Gym', { exact: true }).first()).toBeVisible();

    await page.getByRole('main').getByRole('link', { name: 'Edit profile' }).click();
    await page.getByLabel('Phone').fill('+84 903 111 222');
    await page
      .getByLabel('Short bio')
      .fill('Strength coach focused on safe, measurable progress for every Member.');
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page).toHaveURL(/\/pt\/profile$/);
    await expect(page.getByText('+84 903 111 222')).toBeVisible();
    await expect(
      page.getByText('Strength coach focused on safe, measurable progress for every Member.'),
    ).toBeVisible();

    await page.reload();
    await expect(page.getByText('+84 903 111 222')).toBeVisible();
  });

  test('shows the assigned Gym as read-only information', async ({ page }) => {
    await openAsTrainer(page, '/pt/profile/gym');

    await expect(page.getByText('Read only')).toBeVisible();
    await expect(page.getByText('Verified Gym')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Fit District Thảo Điền' })).toBeVisible();
    await expect(page.getByRole('button', { name: /save|edit/i })).toHaveCount(0);
    await expect(page.getByRole('textbox')).toHaveCount(0);
  });
});
