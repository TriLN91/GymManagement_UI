import { expect, type Page } from '@playwright/test';

export async function completeGymOwnerOtp(page: Page) {
  await expect(page).toHaveURL(/\/verify-email-otp$/);
  const inputs = page.locator('input[aria-label^="Digit"]');
  await expect(inputs).toHaveCount(6);
  for (const [index, digit] of [...'654321'].entries()) {
    await inputs.nth(index).fill(digit);
  }
  await page.getByRole('button', { name: 'Verify and continue' }).click();
  await expect(page).toHaveURL(/\/admin(?:\/onboarding)?$/);
}
