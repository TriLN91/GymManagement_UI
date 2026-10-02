import { expect, test, type Page } from '@playwright/test';

const completeApplication = {
  brand: {
    name: 'Fit Central',
    description: 'A verified training space for members.',
    contactPhone: '0901234567',
  },
  branches: [
    {
      id: 'branch-main',
      name: 'Fit Central District 1',
      city: 'Ho Chi Minh City',
      area: 'District 1',
      address: '12 Nguyen Hue',
      contactPhone: '0907654321',
      operatingHours: '06:00 - 22:00',
      facilities: ['free-weights'],
    },
  ],
  license: {
    name: 'business-license.pdf',
    size: 1024,
    type: 'application/pdf',
    uploadedAt: '2026-09-30T02:00:00.000Z',
  },
  rejectionReason: null,
  submissionCount: 0,
  submittedAt: null,
};

async function loginAsGymOwner(page: Page) {
  await page.goto('/login');
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.localStorage.setItem('gmc.locale', 'en');
  });
  await page.reload();
  await page.getByLabel(/email/i).fill('admin@demo.gym');
  await page.getByLabel(/password/i).fill('Password1!');
  await page.getByRole('button', { name: /sign in|đăng nhập/i }).click();
  await expect(page).toHaveURL(/\/admin\/onboarding$/);
  if ((await page.locator('html').getAttribute('lang'))?.startsWith('vi')) {
    await page.getByRole('button', { name: /english/i }).click();
  }
}

async function seedApplication(page: Page, state: Record<string, unknown>) {
  await page.evaluate((value) => {
    window.localStorage.setItem(
      'gmc.gymOwnerOnboarding',
      JSON.stringify({ state: value, version: 1 }),
    );
  }, state);
}

test.describe('Gym Owner onboarding and approval', () => {
  test('completes brand, branch, license, review and submission', async ({ page }) => {
    await loginAsGymOwner(page);

    await page.goto('/admin/onboarding/profile');
    await page.getByLabel('Gym brand name').fill('Fit Central');
    await page.getByLabel('Contact phone').nth(0).fill('0901234567');
    await page.getByLabel('Marketplace description').fill('A verified training space for members.');
    await page.getByLabel('Branch name').fill('Fit Central District 1');
    await page.getByLabel('Province / City').fill('Ho Chi Minh City');
    await page.getByLabel('Area').fill('District 1');
    await page.getByLabel('Contact phone').nth(1).fill('0907654321');
    await page.getByLabel('Address').fill('12 Nguyen Hue');
    await page.getByLabel('Operating hours').fill('06:00 - 22:00');
    await page.getByText('Free weights', { exact: true }).click();
    await page.getByRole('button', { name: /save and continue/i }).click();

    await expect(page).toHaveURL(/\/admin\/onboarding\/license$/);
    await page.locator('input[type="file"]').setInputFiles({
      name: 'business-license.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('mock business license'),
    });
    await expect(page.getByText('business-license.pdf')).toBeVisible();
    await page.getByRole('button', { name: /save and continue/i }).click();

    await expect(page).toHaveURL(/\/admin\/onboarding\/review$/);
    await expect(page.getByText('Fit Central', { exact: true })).toBeVisible();
    await expect(page.getByText('Fit Central District 1', { exact: false })).toBeVisible();
    await page.getByRole('button', { name: /submit application/i }).click();
    await page.getByRole('button', { name: /confirm submission/i }).click();

    await expect(page).toHaveURL(/\/admin\/onboarding\/status$/);
    await expect(page.getByText('Application submitted')).toBeVisible();
    await expect(page.getByText('Submitted', { exact: true })).toBeVisible();
  });

  test('shows rejection reason, allows edit, then resubmits under review', async ({ page }) => {
    await loginAsGymOwner(page);
    await seedApplication(page, {
      ...completeApplication,
      status: 'rejected',
      rejectionReason: 'The uploaded license image is not clear enough.',
      submissionCount: 1,
      submittedAt: '2026-09-30T02:00:00.000Z',
    });

    await page.goto('/admin/onboarding/status');
    await expect(page.getByText('The uploaded license image is not clear enough.')).toBeVisible();
    await page.getByRole('link', { name: /edit application/i }).click();
    await page.getByLabel('Gym brand name').fill('Fit Central Updated');
    await page.getByRole('button', { name: /save and continue/i }).click();
    await page.getByRole('button', { name: /save and continue/i }).click();
    await page.getByRole('button', { name: /resubmit application/i }).click();
    await page.getByRole('button', { name: /confirm resubmission/i }).click();

    await expect(page).toHaveURL(/\/admin\/onboarding\/status$/);
    await expect(page.getByText('Application under review')).toBeVisible();
    await expect(page.getByText('Under review', { exact: true })).toBeVisible();
  });

  test('only approved Gym Owner can reach the dashboard', async ({ page }) => {
    await loginAsGymOwner(page);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/onboarding$/);

    await seedApplication(page, {
      ...completeApplication,
      status: 'approved',
      submissionCount: 1,
      submittedAt: '2026-09-30T02:00:00.000Z',
    });
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole('heading', { name: /trainers|huấn luyện viên/i })).toBeVisible();
  });

  test('uses the existing mobile drawer shell without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAsGymOwner(page);

    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
    const menuButton = page.getByRole('button', { name: /open menu/i });
    await menuButton.click();
    await expect(
      page.getByRole('complementary').getByRole('navigation', { name: /partner workspace/i }),
    ).toBeVisible();
  });
});
