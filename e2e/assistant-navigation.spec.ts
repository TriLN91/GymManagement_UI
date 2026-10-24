import { expect, test, type Page } from '@playwright/test';

async function promiseReturningScroll(page: Page) {
  await page.addInitScript(() => {
    const scroll = Element.prototype.scrollIntoView;
    // Exercise Chrome 155's return contract even on older CI Chromium.
    Element.prototype.scrollIntoView = function (options) {
      scroll.call(this, options);
      return Promise.resolve();
    };
  });
}

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password|mật khẩu/i).fill(password);
  await page.getByRole('button', { name: /sign in|đăng nhập/i }).click();
  await expect(page).toHaveURL(/\/app(?:\/|$)/);
}

async function navigateAwayAndBack(page: Page) {
  const profileGroup = page.locator('button[aria-controls="member-nav-profile"]');
  if ((await profileGroup.getAttribute('aria-expanded')) !== 'true') await profileGroup.click();
  await page.locator('a[href="/app/profile"]:visible').first().click();
  await expect(page).toHaveURL(/\/app\/profile$/);
  const workoutGroup = page.locator('button[aria-controls="member-nav-workout"]');
  if ((await workoutGroup.getAttribute('aria-expanded')) !== 'true') await workoutGroup.click();
  await page.locator('a[href="/app/assistant"]:visible').first().click();
  await expect(page.getByLabel('Message FitFlex Assistant')).toBeVisible();
}

test('Assistant survives Promise-returning scroll, conversation updates, navigation and reload', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await promiseReturningScroll(page);
  await login(page, 'member@demo.gym', 'Password1!');
  await page.goto('/app/assistant');
  await expect(page.getByLabel('Message FitFlex Assistant')).toBeVisible();
  await page.getByRole('button', { name: 'New', exact: true }).click();
  await expect(
    page.locator('.assistant-conversations button').filter({ hasText: 'New conversation' }),
  ).toBeVisible();
  await page.getByLabel('Message FitFlex Assistant').fill('Hello Assistant');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('This is a mock reply from the MSW assistant.')).toBeVisible();
  for (let visit = 0; visit < 2; visit++) await navigateAwayAndBack(page);
  await page.goBack();
  await expect(page).toHaveURL(/\/app\/profile$/);
  await page.goForward();
  await expect(page.getByLabel('Message FitFlex Assistant')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Message FitFlex Assistant')).toBeVisible();
  await expect(page.getByText('destroy is not a function', { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
]) {
  test(`long Assistant history scrolls independently at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await promiseReturningScroll(page);
    await login(page, 'member@demo.gym', 'Password1!');
    await page.goto('/app/assistant');
    await page.getByRole('button', { name: 'New', exact: true }).click();
    await page
      .getByLabel('Message FitFlex Assistant')
      .fill('Scroll regression sample message. '.repeat(75));
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByText('This is a mock reply from the MSW assistant.')).toBeVisible();
    const history = page.locator('.assistant-messages');
    await expect
      .poll(() => history.evaluate((element) => element.scrollHeight > element.clientHeight))
      .toBe(true);
    await expect
      .poll(() =>
        history.evaluate(
          (element) => element.scrollHeight - element.clientHeight - element.scrollTop,
        ),
      )
      .toBeLessThan(2);
    const bottom = await history.evaluate((element) => element.scrollTop);
    await history.hover();
    await page.mouse.wheel(0, -350);
    await expect
      .poll(() => history.evaluate((element) => element.scrollTop))
      .toBeLessThan(bottom - 100);
    const scrolledUp = await history.evaluate((element) => element.scrollTop);
    await page.mouse.wheel(0, 350);
    await expect
      .poll(() => history.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(scrolledUp + 100);
    const composer = await page.locator('.assistant-composer').boundingBox();
    expect(composer).not.toBeNull();
    expect(composer!.y).toBeGreaterThanOrEqual(0);
    expect(composer!.y + composer!.height).toBeLessThanOrEqual(viewport.height);
    await expect(page.getByLabel('Message FitFlex Assistant')).toBeVisible();
  });
}

test('real Backend preserves Assistant interactions across route changes and reload', async ({
  page,
  request,
}) => {
  test.setTimeout(60_000);
  const email = process.env.REAL_ASSISTANT_EMAIL;
  const password = process.env.REAL_ASSISTANT_PASSWORD;
  test.skip(!email || !password, 'Requires an authorized demo Member and an MSW-disabled server.');
  const errors: string[] = [];
  const apiRequests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (outgoing) => {
    if (outgoing.url().includes('/api/assistant/conversations')) apiRequests.push(outgoing.url());
  });
  await promiseReturningScroll(page);
  await login(page, email!, password!);
  await page.goto('/app/assistant');
  await expect(page.getByLabel('Message FitFlex Assistant')).toBeVisible();
  const creation = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().endsWith('/api/assistant/conversations'),
  );
  await page.getByRole('button', { name: 'New', exact: true }).click();
  const created = await creation;
  expect(created.ok()).toBe(true);
  const { data: conversation } = (await created.json()) as { data: { id: string } };
  const access = await page.evaluate(() => sessionStorage.getItem('gmc.accessToken'));
  try {
    await page
      .getByLabel('Message FitFlex Assistant')
      .fill('Help me personalize my fitness experience');
    await page.getByRole('button', { name: 'Send message' }).click();
    await page.getByRole('button', { name: 'Build strength' }).click();
    await page.getByLabel('Workout days per week').fill('3');
    await page.getByLabel('Minutes per session').fill('45');
    await page.getByLabel('Available equipment').fill('Dumbbells');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    const saved = page.getByText(/Thanks — I saved your answers/);
    await expect(saved).toBeVisible();
    for (let visit = 0; visit < 2; visit++) {
      await navigateAwayAndBack(page);
      await expect(saved).toBeVisible();
    }
    await page.reload();
    await expect(saved).toBeVisible();
    expect(apiRequests.some((url) => url.endsWith('/events'))).toBe(true);
    expect(apiRequests.some((url) => /\/runs\/[^/]+$/.test(url))).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    const removed = await request.delete(
      `${new URL(created.url()).origin}/api/assistant/conversations/${conversation.id}`,
      {
        headers: { Authorization: `Bearer ${access}` },
      },
    );
    expect(removed.ok()).toBe(true);
  }
});
