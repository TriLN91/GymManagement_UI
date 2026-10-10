import { expect, test, type Page } from '@playwright/test';

async function loginPlatformAdmin(page: Page) {
  await page.goto('/login');
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.localStorage.setItem('gmc.locale', 'en');
  });
  await page.reload();
  await page.getByLabel(/email/i).fill('super@demo.gym');
  await page.getByLabel(/password/i).fill('Password1!');
  await page.getByRole('button', { name: /đăng nhập/i }).click();
  await expect(page).toHaveURL(/\/superadmin$/);
}

test.describe('Platform Admin M2', () => {
  test('opens a minimal queue card in a separate detail page and approves it', async ({ page }) => {
    await loginPlatformAdmin(page);
    await page.goto('/superadmin/approvals/gyms');
    await expect(page.getByText('Northstar Fitness')).toBeVisible();
    await page.getByRole('link', { name: 'Detail' }).click();
    await expect(page).toHaveURL(/\/superadmin\/approvals\/gyms\/gym-1042$/);
    await expect(page.getByRole('heading', { name: 'Northstar Fitness' })).toBeVisible();
    await expect(page.getByText('Submitted documents')).toBeVisible();
    await page.getByRole('button', { name: 'Approve', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Approve', exact: true }).click();
    await expect(page.getByText('Approved', { exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Back to queue' }).click();
    await expect(page.getByText('There are no pending records in this queue.')).toBeVisible();
  });

  test('requires a reason and a note before rejecting a Trainer profile', async ({ page }) => {
    await loginPlatformAdmin(page);
    await page.goto('/superadmin/approvals/trainers/trainer-2041');
    await page.getByRole('button', { name: 'Reject', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Reject', exact: true }).click();
    await expect(dialog.getByRole('alert')).toBeVisible();
    await dialog.getByLabel('Reason').selectOption('documentation_incomplete');
    await dialog.getByLabel('Note for applicant').fill('Please upload the current certificate.');
    await dialog.getByRole('button', { name: 'Reject', exact: true }).click();
    await expect(page.getByText('Rejected', { exact: true })).toBeVisible();
    await expect(
      page.getByLabel('Review history').getByText('Please upload the current certificate.'),
    ).toBeVisible();
  });

  test('suspends an account from minimum operational information only', async ({ page }) => {
    await loginPlatformAdmin(page);
    await page.goto('/superadmin/accounts');
    await expect(page.getByText('Only the minimum operational account information is available here.')).toBeVisible();
    const row = page.locator('tr').filter({ hasText: 'Anh Tran' });
    await row.getByRole('button', { name: 'Suspend' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Suspend' }).click();
    await expect(row.getByText('Suspended', { exact: true })).toBeVisible();
  });
});
