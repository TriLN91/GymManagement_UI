import { expect, test, type Page } from '@playwright/test';

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
  await expect(page).toHaveURL(/\/admin/);
  await page.evaluate((state) => {
    window.localStorage.setItem('gmc.gymOwnerOnboarding', JSON.stringify({ state, version: 1 }));
  }, approvedOnboarding);
  await page.goto('/admin');
  if ((await page.locator('html').getAttribute('lang'))?.startsWith('vi')) {
    await page.getByRole('button', { name: /english/i }).click();
  }
}

test.describe('Gym Owner orders and settlement', () => {
  test('shows backend-provided financial components and opens order detail', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    await loginApprovedGymOwner(page);
    await page.goto('/admin/orders');

    const main = page.getByRole('main');
    await expect(main.getByText('Platform-provided values')).toBeVisible();
    await expect(main.getByRole('table', { name: 'Orders' })).toBeVisible();
    await expect(main.getByText('FIT-2026-1048')).toBeVisible();
    await expect(main.getByText('Gym service price')).toBeVisible();
    await expect(main.getByText('Platform commission')).toBeVisible();
    await expect(main.getByText('Net received by Gym')).toBeVisible();

    await main.getByRole('link', { name: 'View detail' }).first().click();
    await expect(page).toHaveURL(/\/admin\/orders\/FIT-2026-1048/);
    await expect(main.getByRole('heading', { name: 'Financial breakdown' })).toBeVisible();
    await expect(main.getByText('90-day Progress')).toBeVisible();
    await expect(main.getByText(/health|workout|assessment|body composition/i)).toHaveCount(0);
    expect(consoleErrors).toEqual([]);
  });

  test('submits a request to Platform without exposing an execution action', async ({ page }) => {
    await loginApprovedGymOwner(page);
    await page.goto('/admin/orders/FIT-2026-1048');

    await page.getByRole('button', { name: 'Submit refund / dispute request' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Send to Platform' }).click();
    await expect(dialog.getByRole('alert')).toHaveText('Provide a reason or supporting information.');
    await dialog.getByLabel('Request type').selectOption('dispute');
    await dialog
      .getByLabel('Reason / supporting information')
      .fill('Please review the supporting transaction details for this order.');
    await dialog.getByRole('button', { name: 'Send to Platform' }).click();

    await expect(page.getByText('Awaiting Platform review')).toBeVisible();
    await expect(page.getByText('Dispute · Submitted request')).toBeVisible();
    await expect(page.getByRole('button', { name: /approve|execute refund|reject/i })).toHaveCount(0);
  });

  test('keeps order and settlement CSV downloads separate', async ({ page }) => {
    await loginApprovedGymOwner(page);
    await page.goto('/admin/orders');
    const orderDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export orders CSV' }).click();
    expect((await orderDownload).suggestedFilename()).toBe('gym-orders.csv');

    await page.goto('/admin/settlements');
    await expect(page.getByRole('table', { name: 'Settlement periods' })).toBeVisible();
    await expect(page.getByText('Read-only settlement')).toBeVisible();
    await expect(page.getByText('Reconciled by Platform').first()).toBeVisible();
    const settlementDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export settlements CSV' }).click();
    expect((await settlementDownload).suggestedFilename()).toBe('gym-settlements.csv');
  });

  test('renders orders and settlement without narrow viewport overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginApprovedGymOwner(page);

    await page.goto('/admin/orders');
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
    await expect(page.getByText('FIT-2026-1048')).toBeVisible();

    await page.goto('/admin/settlements');
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
    await expect(page.getByText('SET-2026-09')).toBeVisible();
  });
});
