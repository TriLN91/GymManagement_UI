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
    {
      window.localStorage.clear();
      window.localStorage.setItem('gmc.locale', 'en');
    }
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

  // Step 1 is the health notice: nothing to fill in.
  await expect(page.getByRole('note')).toContainText('medical professional');
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 2: body metrics are required, including the activity level used for calories.
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('Complete the required fields before continuing.')).toBeVisible();

  await page.getByLabel('Date of birth').fill('1994-06-10');
  await page.getByLabel('Sex at birth').selectOption('male');
  await page.getByLabel('Height').fill('178');
  await page.getByLabel('Weight').fill('78');
  // Without an activity level the estimate asks for the missing input.
  await expect(page.getByText('Enter your date of birth, sex')).toBeVisible();
  await page.getByRole('button', { name: 'Sedentary' }).click();
  await expect(page.getByText('Enter your date of birth, sex')).toHaveCount(0);
  await expect(page.getByText('Maintenance calories (TDEE)')).toBeVisible();
  await expect(page.getByText('Resting energy (BMR)')).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByRole('button', { name: 'Build muscle' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  for (const question of await page.locator('.profile-feature-question').all()) {
    await question.getByRole('button', { name: 'No', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByRole('button', { name: 'Beginner · under 6 months' }).click();
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
  await page.getByRole('button', { name: 'Save profile & go to Dashboard' }).click();
  await expect(page).toHaveURL(/\/app$/);
});

test('lets the member open any step from the stepper and blocks saving until all are valid', async ({
  page,
}) => {
  await openAsMember(page);

  // Jump straight to the last step without filling anything first.
  await page.locator('.profile-stepper button').last().click();
  await page.getByRole('button', { name: /Save profile/ }).click();
  await expect(page.getByText('Complete the required fields before continuing.')).toBeVisible();

  // Saving sends the member back to the first incomplete step.
  await expect(page.locator('.profile-stepper button.is-active')).toContainText('Body');

  // And any step can be opened directly.
  await page.locator('.profile-stepper button').nth(4).click();
  await expect(page.locator('.profile-stepper button.is-active')).toContainText('Training');
});

test('shows the health notice without asking the member to pick anything', async ({ page }) => {
  await openAsMember(page);
  await page.locator('.profile-stepper button').first().click();

  await expect(page.getByRole('note')).toContainText('medical professional');
  await expect(page.getByRole('note').getByRole('listitem').first()).toBeVisible();

  // Nothing to fill in: Continue moves straight on.
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('.profile-stepper button.is-active')).toContainText('Body');
});

test('suggests which half of the body to train based on injuries', async ({ page }) => {
  await openAsMember(page);
  await page.locator('.profile-stepper button').nth(3).click();

  const upper = page.locator('.profile-feature-question').nth(0);
  const lower = page.locator('.profile-feature-question').nth(1);
  await expect(page.getByRole('note')).toHaveCount(0);

  // Upper-body injury only: train the lower body.
  await upper.getByRole('button', { name: 'Yes', exact: true }).click();
  await lower.getByRole('button', { name: 'No', exact: true }).click();
  await expect(page.getByRole('note')).toContainText('focus on lower-body training');

  // Lower-body injury only: train the upper body.
  await upper.getByRole('button', { name: 'No', exact: true }).click();
  await lower.getByRole('button', { name: 'Yes', exact: true }).click();
  await expect(page.getByRole('note')).toContainText('focus on upper-body training');

  // Both injured: rest.
  await upper.getByRole('button', { name: 'Yes', exact: true }).click();
  await expect(page.getByRole('note')).toContainText('take a break from training');

  // No injuries: no advice.
  await upper.getByRole('button', { name: 'No', exact: true }).click();
  await lower.getByRole('button', { name: 'No', exact: true }).click();
  await expect(page.getByRole('note')).toHaveCount(0);
});
