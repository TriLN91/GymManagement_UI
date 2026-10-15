import { expect, test, type Page } from '@playwright/test';

// MSW keeps registrations in memory, so this flow only uses in-app navigation: a full page load would
// reset the mocked backend and lose the pending registration.
async function openInApp(page: Page, path: string) {
  await page.evaluate((target) => {
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

async function signIn(page: Page, email: string, password: string) {
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/mật khẩu|password/i).fill(password);
  await page.getByRole('button', { name: /sign in|đăng nhập/i }).click();
}

test.describe('Gym Admin registration and approval', () => {
  test('a Gym Admin waits for approval, then signs in after a Platform Admin approves', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
      window.localStorage.setItem('gmc.locale', 'en');
    });
    await page.goto('/register');

    // Trainer self-registration does not exist: only Member and Gym Admin are offered.
    await expect(page.getByRole('radio')).toHaveCount(2);
    await expect(page.getByRole('radio', { name: /trainer/i })).toHaveCount(0);

    await page.getByRole('radio', { name: /Gym Admin/ }).click();
    await page.getByLabel('Your full name').fill('Gina Owner');
    await page.getByLabel('Gym name').fill('Granite Gym');
    await page.getByLabel('Registration email').fill('gina@granite.gym');
    await page.getByLabel('Initial password', { exact: true }).fill('Pass-12345');
    await page.getByLabel('Confirm password').fill('Pass-12345');
    await page.getByRole('button', { name: /continue creating account/i }).click();

    await expect(page.getByRole('heading', { name: 'Registration received' })).toBeVisible();
    await page.getByRole('link', { name: 'Back to sign in' }).click();

    // Correct password, but the account is still pending: the login explains why.
    await signIn(page, 'gina@granite.gym', 'Pass-12345');
    await expect(page.getByRole('alert')).toContainText('waiting for Platform Admin approval');

    // A Platform Admin finds the registration and approves it.
    await signIn(page, 'super@demo.gym', 'Password1!');
    await expect(page).toHaveURL(/\/superadmin$/);
    await openInApp(page, '/superadmin/approvals/gyms');
    await expect(page.getByText('Granite Gym')).toBeVisible();
    await page
      .locator('.platform-approval-card')
      .filter({ hasText: 'Granite Gym' })
      .getByRole('link', { name: 'Detail' })
      .click();
    await page.getByRole('button', { name: 'Approve', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Approve', exact: true }).click();
    await expect(page.getByText('Approved', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/login$/);

    // Approved: the Gym Admin now enters the platform.
    await signIn(page, 'gina@granite.gym', 'Pass-12345');
    await expect(page).toHaveURL(/\/admin$/);
  });

  test('a rejected Gym Admin cannot sign in', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
      window.localStorage.setItem('gmc.locale', 'en');
    });
    await page.goto('/register');
    await page.getByRole('radio', { name: /Gym Admin/ }).click();
    await page.getByLabel('Your full name').fill('Rex Owner');
    await page.getByLabel('Gym name').fill('Rex Gym');
    await page.getByLabel('Registration email').fill('rex@rex.gym');
    await page.getByLabel('Initial password', { exact: true }).fill('Pass-12345');
    await page.getByLabel('Confirm password').fill('Pass-12345');
    await page.getByRole('button', { name: /continue creating account/i }).click();
    await page.getByRole('link', { name: 'Back to sign in' }).click();

    await signIn(page, 'super@demo.gym', 'Password1!');
    await expect(page).toHaveURL(/\/superadmin$/);
    await openInApp(page, '/superadmin/approvals/gyms');
    await page
      .locator('.platform-approval-card')
      .filter({ hasText: 'Rex Gym' })
      .getByRole('link', { name: 'Detail' })
      .click();
    await page.getByRole('button', { name: 'Reject', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Reason').selectOption('documentation_incomplete');
    await dialog.getByLabel('Note for applicant').fill('Missing business license.');
    await dialog.getByRole('button', { name: 'Reject', exact: true }).click();
    await expect(page.getByText('Rejected', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Sign out' }).click();
    await signIn(page, 'rex@rex.gym', 'Pass-12345');
    await expect(page.getByRole('alert')).toContainText('registration was rejected');
  });
});
