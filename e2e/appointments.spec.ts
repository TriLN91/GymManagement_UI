import { expect, test, type Page } from '@playwright/test';

// CF04 runs against the MSW handlers in src/mocks/handlers/appointments.ts, which mirror the backend rules.
async function openAs(page: Page, role: 'member' | 'pt', path: string) {
  await page.addInitScript((r) => {
    const user = {
      id: `appointments-e2e-${r}`,
      email: r === 'pt' ? 'pt@demo.gym' : 'member@demo.gym',
      fullName: r === 'pt' ? 'Paolo Trainer' : 'Maya Member',
      roles: [r],
      tenantId: 't-001',
      locale: 'en',
    };
    window.localStorage.clear();
    window.localStorage.setItem('app:auth', JSON.stringify({ state: { user }, version: 1 }));
    window.localStorage.setItem('gmc.locale', 'en');
    window.sessionStorage.setItem('gmc.accessToken', 'e2e-token');
    window.sessionStorage.setItem('gmc.refreshToken', 'e2e-refresh');
    window.sessionStorage.setItem('gmc.tenantId', user.tenantId);
  }, role);
  await page.goto(path);
}

/** Local `datetime-local` value a few days ahead, on the hour. */
function inDays(days: number, hour = 9) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00`;
}

test.use({ timezoneId: 'Asia/Ho_Chi_Minh' });

test.describe('Coaching sessions (CF04)', () => {
  test('Member proposes a session, sees the quota drop and asks for a new Trainer', async ({
    page,
  }) => {
    await openAs(page, 'member', '/app/profile/appointments');
    await expect(page.getByRole('heading', { name: 'My coaching sessions' })).toBeVisible();
    await expect(page.getByText('4 sessions left (0/4 used)')).toBeVisible();

    await page.getByLabel('Date and time').fill(inDays(5));
    await page.getByRole('button', { name: 'Send proposal' }).click();
    await expect(
      page.getByText('Proposal sent. Waiting for the other side to confirm.'),
    ).toBeVisible();
    await expect(page.getByTestId('appointment')).toHaveCount(1);
    await expect(page.getByText('Waiting for reply')).toBeVisible();
    await expect(page.getByText('3 sessions left (0/4 used)')).toBeVisible();

    // The proposer can withdraw it, which frees the session again.
    await page.getByRole('button', { name: 'Cancel session' }).click();
    await page.getByLabel('Reason').fill('Change of plans');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('4 sessions left (0/4 used)')).toBeVisible();

    await page.getByRole('button', { name: 'Request a new Trainer' }).click();
    await page.getByLabel('Why do you want to change?').fill('Schedules never match');
    await page.getByRole('button', { name: 'Send request' }).click();
    await expect(page.getByText('Your request is with the gym.', { exact: false })).toBeVisible();
  });

  test('rejects a session inside the 24 hour notice window with the server rule', async ({
    page,
  }) => {
    await openAs(page, 'member', '/app/profile/appointments');
    const soon = new Date(Date.now() + 3 * 3_600_000);
    const pad = (n: number) => String(n).padStart(2, '0');
    await page
      .getByLabel('Date and time')
      .fill(
        `${soon.getFullYear()}-${pad(soon.getMonth() + 1)}-${pad(soon.getDate())}T${pad(soon.getHours())}:00`,
      );
    await page.getByRole('button', { name: 'Send proposal' }).click();
    await expect(page.getByText('Buổi hẹn phải đặt trước ít nhất 24 giờ.').first()).toBeVisible();
    await expect(page.getByTestId('appointment')).toHaveCount(0);
  });

  test('Trainer saves availability and proposes then cancels a session', async ({ page }) => {
    await openAs(page, 'pt', '/pt/appointments');
    await expect(page.getByRole('heading', { name: 'Session schedule' })).toBeVisible();

    await page.getByRole('button', { name: 'Add window' }).click();
    await page.getByRole('button', { name: 'Save availability' }).click();
    await expect(page.getByText('Availability saved.')).toBeVisible();

    // Monday 08:00 to 12:00 local: pick the next Monday at 09:00 so the proposal fits.
    const monday = new Date();
    monday.setDate(monday.getDate() + ((8 - monday.getDay()) % 7 || 7));
    const pad = (n: number) => String(n).padStart(2, '0');
    const value = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}T09:00`;
    await page.getByLabel('Date and time').fill(value);
    await page.getByRole('button', { name: 'Send proposal' }).click();
    await expect(
      page.getByText('Proposal sent. Waiting for the other side to confirm.'),
    ).toBeVisible();
    await expect(page.getByTestId('appointment')).toHaveCount(1);

    await page.getByRole('button', { name: 'Cancel session' }).click();
    await page.getByLabel('Reason').fill('Studio closed');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('Session cancelled.')).toBeVisible();
    await expect(page.getByText('Cancelled', { exact: true })).toBeVisible();
  });
});
