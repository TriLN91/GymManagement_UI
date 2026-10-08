import { expect, test, type Page } from '@playwright/test';

import { completeGymOwnerOtp } from './helpers/gymOwnerAuth';

const approvedOnboarding = {
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
      facilities: ['free-weights', 'cardio'],
    },
  ],
  license: {
    name: 'business-license.pdf',
    size: 1024,
    type: 'application/pdf',
    uploadedAt: '2026-10-01T00:00:00.000Z',
  },
  status: 'approved',
  rejectionReason: null,
  submissionCount: 1,
  submittedAt: '2026-10-01T00:00:00.000Z',
};

async function loginApprovedGymOwner(page: Page) {
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
  await completeGymOwnerOtp(page);
  await expect(page).toHaveURL(/\/admin/);
  await page.evaluate((state) => {
    window.localStorage.setItem('gmc.gymOwnerOnboarding', JSON.stringify({ state, version: 1 }));
  }, approvedOnboarding);
  await page.goto('/admin');
  if ((await page.locator('html').getAttribute('lang'))?.startsWith('vi')) {
    await page.getByRole('button', { name: /english/i }).click();
  }
}

test.describe('Gym Owner Trainer and PT Package management', () => {
  test('creates a Trainer draft and submits it to Platform without owner approval', async ({
    page,
  }) => {
    await loginApprovedGymOwner(page);
    await page.goto('/admin/pts');
    await expect(page.getByText('Pending Platform approval').first()).toBeVisible();
    await expect(page.getByText('Suspended').first()).toBeVisible();

    await page.getByRole('link', { name: 'Create Trainer profile' }).click();
    await page.getByLabel('Full name').fill('Mira Coach');
    await page.getByLabel('Email').fill('mira@fit.local');
    await page.getByLabel('Phone').fill('0901112233');
    await page.getByLabel('Years of experience').fill('5');
    await page.getByLabel('Professional bio').fill('Strength and movement coach.');
    await page.getByLabel('Self-introduction').fill('Clear coaching and measurable progress.');
    await page.getByLabel('Strength').check();
    await page.getByRole('button', { name: 'Save profile' }).click();

    await expect(page.getByRole('heading', { name: 'Mira Coach' })).toBeVisible();
    await expect(page.getByText('Draft').first()).toBeVisible();
    await page.getByRole('button', { name: 'Submit for Platform approval' }).click();
    await expect(page.getByRole('dialog')).toContainText('Platform');
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm submission' }).click();
    await expect(page.getByText('Pending Platform approval').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Edit' })).toHaveCount(0);
    await expect(page.getByText('Gym Owner cannot approve it.')).toBeVisible();
  });

  test('enforces operational lifecycle and terminal Unlinked state', async ({ page }) => {
    await loginApprovedGymOwner(page);
    await page.goto('/admin/pts/trainer-minh');
    await expect(page.getByText('Active').first()).toBeVisible();

    await page.getByRole('button', { name: 'Hide Trainer' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('Hidden').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Restore Active status' })).toBeVisible();

    await page.getByRole('button', { name: 'Unlink Trainer' }).click();
    await expect(page.getByRole('dialog')).toContainText('terminal');
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('Unlinked').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Manage status' })).toHaveCount(0);
  });

  test('resolves only an assignment exception with an approved Active Trainer', async ({
    page,
  }) => {
    await loginApprovedGymOwner(page);
    await page.goto('/admin/pts/assignments');

    const openCard = page.locator('.gym-assignment-exception-list section').filter({
      hasText: 'Mai Nguyen',
    });
    const replacement = openCard.getByLabel('Replacement Trainer');
    await expect(replacement.locator('option')).toHaveCount(2);
    await replacement.selectOption({ label: 'Minh Tran' });
    await openCard.getByRole('button', { name: 'Confirm assignment' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm assignment' }).click();

    await expect(openCard.getByText('Resolved')).toBeVisible();
    await expect(openCard.getByText('Minh Tran')).toBeVisible();
    await expect(page.getByText('Hana Kim').first()).toBeVisible();
  });

  test('creates, edits and publishes a PT package while keeping unpublish blocked', async ({
    page,
  }) => {
    await loginApprovedGymOwner(page);
    await page.goto('/admin/packages');
    await page.getByRole('link', { name: 'Create PT package' }).click();

    await page.getByLabel('Assigned Trainer').selectOption({ label: 'Minh Tran' });
    await page.getByLabel('Package name — English').fill('Mobility Starter');
    await page.getByLabel('Package name — Vietnamese').fill('Khởi động linh hoạt');
    await page.getByLabel('Sessions included').fill('6');
    await page.getByLabel('Validity in days').fill('30');
    await page.getByLabel('Gym service price (VND)').fill('2500000');
    await page.getByLabel('Features — English').fill('Initial assessment\nPersonal plan');
    await page.getByLabel('Features — Vietnamese').fill('Đánh giá đầu kỳ\nKế hoạch cá nhân');
    await page.getByRole('button', { name: 'Save draft' }).click();

    await expect(page.getByRole('heading', { name: 'Mobility Starter' })).toBeVisible();
    await page.getByRole('link', { name: 'Edit' }).click();
    await page.getByLabel('Sessions included').fill('8');
    await page.getByRole('button', { name: 'Save draft' }).click();
    await expect(page.getByText('8').first()).toBeVisible();

    await page.getByRole('button', { name: 'Publish' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm publication' }).click();
    await expect(page.getByText('Published').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Edit' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Unpublish' })).toBeDisabled();
  });

  test('keeps lists and assignment controls within a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginApprovedGymOwner(page);
    await page.goto('/admin/pts');
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
    await page.goto('/admin/pts/assignments');
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
    await expect(page.getByLabel('Replacement Trainer')).toBeVisible();
  });
});
