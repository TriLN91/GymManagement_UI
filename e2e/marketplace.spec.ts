import { expect, test, type Page } from '@playwright/test';

async function openAsMember(page: Page, path: string) {
  await page.addInitScript(() => {
    const user = {
      id: 'marketplace-member',
      email: 'member@fit.local',
      fullName: 'Alex Volkov',
      roles: ['member'],
      tenantId: 'fit-e2e',
      locale: 'en',
    };
    window.localStorage.setItem('app:auth', JSON.stringify({ state: { user }, version: 1 }));
    window.localStorage.setItem('gmc.locale', 'en');
    window.sessionStorage.setItem('gmc.accessToken', 'e2e-token');
    window.sessionStorage.setItem('gmc.refreshToken', 'e2e-refresh');
    window.sessionStorage.setItem('gmc.tenantId', user.tenantId);
  });
  await page.goto(path);
}

test.describe('Member marketplace', () => {
  test('discovers a gym and completes a separated Gym plus checkout', async ({ page }) => {
    await openAsMember(page, '/app/marketplace');

    await expect(page.getByRole('heading', { name: 'Find the right place to train' })).toHaveCount(
      0,
    );
    await expect(page.getByPlaceholder('Search by name or area')).toBeVisible();
    await page.getByPlaceholder('Search by name or area').fill('Thảo Điền');
    await expect(page.getByRole('heading', { name: 'Fit District Thảo Điền' })).toBeVisible();
    await page.getByRole('link', { name: 'View gym' }).click();

    await expect(page.getByRole('heading', { name: 'Fit District Thảo Điền' })).toBeVisible();
    const offer = page.locator('.marketplace-offer').filter({ hasText: '90-day Progress' });
    await offer.getByRole('button', { name: 'Select offer' }).click();

    await expect(page.getByRole('heading', { name: 'Checkout' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Payment method' })).toBeVisible();
    await expect(page.getByText('Gym / PT service')).toBeVisible();
    await expect(page.locator('dt').filter({ hasText: 'Fit® Plus' })).toBeVisible();
    await page.getByPlaceholder('4242 4242 4242 4242').fill('4242424242424242');
    await page.getByPlaceholder('NGUYEN VAN A').fill('ALEX VOLKOV');
    await page.getByPlaceholder('12/30').fill('12/30');
    await page.getByText('Payment is simulated locally and no real charge is made.').click();
    await page.getByRole('button', { name: 'Confirm payment' }).click();

    await expect(page.getByRole('heading', { name: 'Payment successful' })).toBeVisible();
    await expect(page.getByText('Waiting for Gym service confirmation')).toBeVisible();
  });

  test('buys a trainer-specific package and activates assignment', async ({ page }) => {
    await openAsMember(page, '/app/marketplace/trainers/linh-nguyen');

    await expect(page.getByRole('heading', { name: 'Linh Nguyễn' })).toBeVisible();
    const trainerPackage = page.locator('.marketplace-package-card').filter({
      hasText: 'Strength Foundation',
    });
    await trainerPackage.getByRole('button', { name: 'Select PT package' }).click();
    await page.getByRole('button', { name: 'Bank transfer' }).click();
    await page.getByText('Payment is simulated locally and no real charge is made.').click();
    await page.getByRole('button', { name: 'Confirm payment' }).click();

    await expect(page.getByRole('heading', { name: 'Payment successful' })).toBeVisible();
    await expect(page.getByText('Trainer–Member assignment activated')).toBeVisible();
  });
});
