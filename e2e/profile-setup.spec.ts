import { expect, test, type Page } from '@playwright/test';

async function openAsMember(page: Page) {
  await page.addInitScript(() => {
    const user = {
      id: 'profile-member',
      email: 'member@fit.local',
      fullName: 'Alex Volkov',
      roles: ['member'],
      tenantId: 'fit-e2e',
      locale: 'en',
    };
    { window.localStorage.clear(); window.localStorage.setItem('gmc.locale', 'en'); };
    window.localStorage.setItem('app:auth', JSON.stringify({ state: { user }, version: 1 }));
    window.localStorage.setItem('gmc.locale', 'en');
    window.sessionStorage.setItem('gmc.accessToken', 'e2e-token');
    window.sessionStorage.setItem('gmc.refreshToken', 'e2e-refresh');
    window.sessionStorage.setItem('gmc.tenantId', user.tenantId);
  });
  await page.goto('/app/profile/setup');
}

test('collects a complete fitness profile and produces a readiness result', async ({ page }) => {
  await openAsMember(page);

  await expect(
    page.getByRole('heading', { name: 'Build the foundation for your plan' }),
  ).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Back to Dashboard' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('Complete the required fields before continuing.')).toBeVisible();

  await page.getByLabel('Date of birth').fill('1994-06-10');
  await page.getByLabel('Sex at birth').selectOption('male');
  await page.getByLabel('Height').fill('178');
  await page.getByLabel('Weight').fill('78');
  await page.getByLabel('Measurement source').selectOption('self_reported');
  await page.getByRole('button', { name: 'Continue' }).click();

  await page
    .locator('.profile-choice-grid')
    .first()
    .getByRole('button', { name: 'Build muscle' })
    .click();
  await page.getByRole('button', { name: 'Continue' }).click();

  for (const question of await page.locator('.profile-question').all()) {
    await question.getByRole('button', { name: 'No', exact: true }).click();
  }
  await page.getByRole('button', { name: 'None', exact: true }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.locator('.profile-feature-question').getByRole('button', { name: 'No' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByRole('button', { name: 'Beginner · under 6 months' }).click();
  await page.getByRole('button', { name: 'Sedentary' }).click();
  await page.getByRole('button', { name: 'Mon', exact: true }).click();
  await page.getByRole('button', { name: '60 min' }).click();
  await page.getByRole('button', { name: 'Gym', exact: true }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByLabel('Average sleep').fill('7.5');
  await page.getByRole('button', { name: '2 · Low' }).click();
  await page.getByRole('button', { name: 'Mostly sitting' }).click();
  await page.locator('.profile-feature-question').getByRole('button', { name: 'No' }).click();
  await page.getByText('I confirm this information is accurate').click();
  await page.getByText('I understand this is activity screening').click();
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { name: 'Ready for plan creation' })).toBeVisible();
  await expect(page.getByText('100%')).toBeVisible();
  await page.getByRole('button', { name: 'Save profile & view Workout Plans' }).click();
  await expect(page).toHaveURL(/\/app\/workout$/);
});
