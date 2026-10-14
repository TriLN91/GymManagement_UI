import { expect, type Page } from '@playwright/test';

// Gym Owner sign-in has no OTP step: after the credentials are accepted the user lands in the portal.
export async function waitForGymOwnerPortal(page: Page) {
  await expect(page).toHaveURL(/\/admin(?:\/onboarding)?$/);
}
