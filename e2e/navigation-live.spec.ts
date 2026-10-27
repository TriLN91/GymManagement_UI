import { expect, test, type Page } from '@playwright/test';

// Read-only workspace checks against the existing isolated demo. No mocked business success.
test.skip(process.env.FITFLEX_NAV_LIVE !== '1', 'Requires the isolated running demo accounts.');
async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

test('Member groups, active selection, history, reload and legacy deep links', async ({ page }) => {
  await login(page, 'member@fitflex.test', 'Member2026!');
  await page.goto('/app/weekly-review');
  const sidebar = page.locator('aside.member-sidebar');
  await expect(sidebar.locator('[aria-controls="member-nav-progress"]')).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await expect(sidebar.locator('a[href="/app/ai-pass"]')).toHaveCount(1);
  await sidebar.locator('a[href="/app/ai-pass"]').click();
  await expect(page.getByRole('heading', { name: /my ai pass|thẻ ai/i }).first()).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/app\/weekly-review$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Weekly progression review' })).toBeVisible();
  await page.goto('/app/workout/schedule');
  await expect(sidebar.locator('a.is-active')).toHaveCount(1);
  await expect(sidebar.locator('a.is-active')).toHaveAttribute('href', '/app/workout/schedule');
  await page.goto('/app/marketplace/checkout');
  await expect(page.getByRole('heading', { name: 'Legacy commerce is unavailable' })).toBeVisible();
  await expect(page.getByRole('button', { name: /pay|purchase/i })).toHaveCount(0);
  await page.goto('/app/profile/wearables');
  await expect(page.getByRole('status')).toContainText('No connection has been changed');
});

test('Gym Admin approved workspace hides onboarding and exposes distribution transitions', async ({
  page,
}) => {
  await login(page, 'gymowner@fitflex.test', 'GymOwner2026!');
  await page.goto('/admin/pass-distribution');
  const sidebar = page.locator('aside.member-sidebar');
  await expect(sidebar.locator('[aria-controls="owner-nav-onboarding"]')).toHaveCount(0);
  await sidebar.locator('a[href="/admin/pass-distribution/offers"]').click();
  await expect(page.getByRole('heading', { name: 'Pass Distribution Offers' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: /new offer/i })).toBeEnabled();
  await expect(sidebar.locator('a[href="/admin/orders"]')).toHaveCount(0);
  await expect(sidebar.locator('a[href="/admin/analytics"]')).toHaveCount(0);
});

test('Branch Manager gets a scoped workspace, read-only inventory, and permission recovery', async ({
  page,
}) => {
  await login(page, 'branchmanager@fitflex.test', 'Manager2026!');
  await expect(page).toHaveURL(/\/branch\/pass-distribution\/offers$/);
  const sidebar = page.locator('aside.member-sidebar');
  await expect(sidebar.getByRole('link')).toHaveCount(2);
  await sidebar.locator('a[href="/branch/pass-distribution"]').click();
  await expect(page.getByRole('heading', { name: /Inventory/ }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Provision Demo Credits' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /new template/i })).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'Distribution Agreements' })).toHaveCount(0);
  await page.goto('/admin/orders');
  await expect(page).toHaveURL(/\/403$/);
  await page.getByRole('link', { name: /home/i }).click();
  await expect(page).toHaveURL(/\/branch\/pass-distribution\/offers$/);
});

test('Trainer with an incomplete server profile is guided to an actionable profile screen', async ({
  page,
}) => {
  await login(page, 'trainer@fitflex.test', 'Trainer2026!');
  await page.goto('/pt/appointments');
  await expect(page).toHaveURL(/\/pt\/profile\/edit$/);
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue('Lê Huấn Luyện Viên PT');
  await expect(page.getByRole('button', { name: 'Save changes' })).toBeEnabled();
  const sidebar = page.locator('aside.member-sidebar');
  await expect(sidebar.locator('a[href="/pt/history/income"]')).toHaveCount(0);
  await sidebar.locator('a[href="/pt/profile/gym"]').click();
  await expect(page).toHaveURL(/\/pt\/profile\/gym$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/pt\/profile\/edit$/);
});

test('Platform Admin reference workspace is discoverable and reloadable', async ({ page }) => {
  await login(page, 'admin@fitflex.test', 'LocalAdmin2026!');
  await page.goto('/superadmin/movement-assessment');
  const sidebar = page.locator('aside.member-sidebar');
  await expect(sidebar.locator('a[href="/superadmin/movement-assessment"]')).toBeVisible();
  await expect(page.getByRole('heading').first()).toBeVisible();
  await page.reload();
  await expect(sidebar.locator('a[href="/superadmin/movement-assessment"]')).toHaveClass(
    /is-active/,
  );
  await expect(sidebar.locator('a[href="/superadmin/transactions/orders"]')).toHaveCount(0);
  await expect(sidebar.locator('a[href="/superadmin/analytics/platform"]')).toHaveCount(0);
  await page.goto('/superadmin/tenants');
  await expect(page).toHaveURL(/\/superadmin\/gyms$/);
  await page.goto('/does-not-exist');
  await page.getByRole('link', { name: /home/i }).click();
  await expect(page).toHaveURL(/\/superadmin$/);
});

test('distribution context failure is retryable and does not appear as empty inventory', async ({
  page,
}) => {
  await login(page, 'gymowner@fitflex.test', 'GymOwner2026!');
  await page.route('**/api/gym-distribution/context', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Temporary failure' }),
    }),
  );
  await page.goto('/admin/pass-distribution');
  await expect(page.getByRole('alert')).toContainText('Could not load your Gym organizations');
  await expect(page.getByText('No credits in inventory.', { exact: true })).toHaveCount(0);
  await page.unroute('**/api/gym-distribution/context');
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Pass Credit Inventory/ })).toBeVisible();
});
