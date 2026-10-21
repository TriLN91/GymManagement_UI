import { expect, test, type Page } from '@playwright/test';

async function login(page: Page, email = 'member@demo.gym') {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password|mật khẩu/i).fill('Password1!');
  await page.getByRole('button', { name: /sign in|đăng nhập/i }).click();
  await expect(page).not.toHaveURL(/\/login$/);
}

async function stopMocks(page: Page) {
  await page.goto('/403');
  await expect(page.getByRole('link', { name: /home|trang chủ/i })).toBeVisible();
  await page.evaluate(async () => {
    const path = '/src/mocks/browser.ts';
    const { worker } = await import(/* @vite-ignore */ path);
    worker.stop();
  });
}

async function refresh(page: Page) {
  return page.evaluate(async () => {
    const path = '/src/shared/api/client.ts';
    const { tokenManager } = await import(/* @vite-ignore */ path);
    return Boolean(await tokenManager.refresh());
  });
}

test('restores a new tab/reload and synchronizes UI logout without localStorage tokens', async ({
  page,
  context,
}) => {
  await login(page);
  const second = await context.newPage();
  await second.goto('/app/profile');
  await expect(second).toHaveURL(/\/app\//);
  await expect(second.getByRole('button', { name: /sign out|đăng xuất/i })).toBeVisible();
  await second.reload();
  await expect(second).toHaveURL(/\/app\//);
  await expect(second.getByRole('button', { name: /sign out|đăng xuất/i })).toBeVisible();
  expect(
    await second.evaluate(() => {
      const access = sessionStorage.getItem('gmc.accessToken');
      const refresh = sessionStorage.getItem('gmc.refreshToken');
      return {
        accessPresent: !!access,
        refreshPresent: !!refresh,
        leaks: Object.keys(localStorage).filter((key) => {
          const value = localStorage.getItem(key)!;
          return (access && value.includes(access)) || (refresh && value.includes(refresh));
        }),
      };
    }),
  ).toEqual({ accessPresent: true, refreshPresent: true, leaks: [] });
  await second.getByRole('button', { name: /sign out|đăng xuất/i }).click();
  await expect(second).toHaveURL(/\/login$/);
  await expect(page).toHaveURL(/\/login$/);
  await page.reload();
  await expect(page).toHaveURL(/\/login$/);
});

test('serializes cross-tab rotation and preserves a real permission failure', async ({
  page,
  context,
}) => {
  await login(page);
  const second = await context.newPage();
  await second.goto('/app/profile');
  await expect(second).toHaveURL(/\/app\//);
  await stopMocks(page);
  await stopMocks(second);
  let refreshes = 0;
  await context.route('**/api/identity/refresh', async (route) => {
    refreshes++;
    await route.fulfill({
      json: {
        isSuccess: true,
        data: { accessToken: `rotated-${refreshes}`, refreshToken: `refresh-${refreshes}` },
      },
    });
  });
  await context.route('**/api/reliability-protected', (route) =>
    route.fulfill(
      route.request().headers().authorization === 'Bearer rotated-1'
        ? { json: { data: true } }
        : { status: 401, json: { message: 'Expired' } },
    ),
  );
  const request = (tab: Page) =>
    tab.evaluate(async () => {
      const path = '/src/shared/api/client.ts';
      const { apiGet } = await import(/* @vite-ignore */ path);
      return apiGet('/reliability-protected');
    });
  expect(await Promise.all([request(page), request(second)])).toEqual([true, true]);
  expect(refreshes).toBe(1);
  await context.route('**/api/reliability-forbidden', (route) =>
    route.fulfill({ status: 403, json: { message: 'Forbidden' } }),
  );
  expect(
    await second.evaluate(async () => {
      const path = '/src/shared/api/client.ts';
      const { apiGet, tokenManager } = await import(/* @vite-ignore */ path);
      try {
        await apiGet('/reliability-forbidden');
        return false;
      } catch (error) {
        return (error as { status: number }).status === 403 && !!tokenManager.getAccess();
      }
    }),
  ).toBe(true);
  expect(refreshes).toBe(1);
  await second.getByRole('link', { name: /home|trang chủ/i }).click();
  await expect(second).toHaveURL(/\/app(?:\/|$)/);
});

test('a revoked refresh logs out both tabs and cannot resurrect on reload', async ({
  page,
  context,
}) => {
  await login(page);
  const second = await context.newPage();
  await second.goto('/403');
  await stopMocks(page);
  await stopMocks(second);
  await context.route('**/api/identity/refresh', (route) =>
    route.fulfill({ status: 401, json: { message: 'Revoked' } }),
  );
  expect(await refresh(page)).toBe(false);
  await expect
    .poll(() => second.evaluate(() => sessionStorage.getItem('gmc.accessToken')))
    .toBeNull();
  await second.goto('/app/profile');
  await expect(second).toHaveURL(/\/login$/);
});

test('admin error Home returns to its own portal; browser Back and Forward remain usable', async ({
  page,
}) => {
  await login(page, 'super@demo.gym');
  await expect(page).toHaveURL(/\/superadmin/);
  await page.goto('/403');
  await page.getByRole('link', { name: /home|trang chủ/i }).click();
  await expect(page).toHaveURL(/\/superadmin/);
  await page.goto('/unknown-session-test');
  await page.getByRole('link', { name: /home|trang chủ/i }).click();
  await expect(page).toHaveURL(/\/superadmin/);
  await page.goBack();
  await page.goForward();
  await expect(page).toHaveURL(/\/superadmin/);
});

test('account switching resets every tab and preserves only the original owner draft', async ({
  page,
  context,
}) => {
  await login(page);
  await expect(page.getByRole('button', { name: /sign out|đăng xuất/i })).toBeVisible();
  await page.evaluate(async () => {
    const path = '/src/features/member-workout-builder/model/useMemberWorkoutBuilderStore.ts';
    const { useMemberWorkoutBuilderStore } = await import(/* @vite-ignore */ path);
    useMemberWorkoutBuilderStore.getState().setName('Private Member draft');
  });
  const second = await context.newPage();
  await second.goto('/403');
  await expect(second.getByRole('link', { name: /home|trang chủ/i })).toBeVisible();
  await page.getByRole('button', { name: /sign out|đăng xuất/i }).click();
  await expect(page).toHaveURL(/\/login$/);
  await login(second, 'pt@demo.gym');
  await expect(page).toHaveURL(/\/pt(?:\/|$)/);
  await expect(second.getByRole('button', { name: /sign out|đăng xuất/i })).toBeVisible();
  expect(
    await second.evaluate(async () => {
      const path = '/src/features/member-workout-builder/model/useMemberWorkoutBuilderStore.ts';
      const { useMemberWorkoutBuilderStore } = await import(/* @vite-ignore */ path);
      return useMemberWorkoutBuilderStore.getState().name;
    }),
  ).toBe('');
  await second.getByRole('button', { name: /sign out|đăng xuất/i }).click();
  await expect(second).toHaveURL(/\/login$/);
  await login(second);
  expect(
    await second.evaluate(async () => {
      const path = '/src/features/member-workout-builder/model/useMemberWorkoutBuilderStore.ts';
      const { useMemberWorkoutBuilderStore } = await import(/* @vite-ignore */ path);
      return useMemberWorkoutBuilderStore.getState().name;
    }),
  ).toBe('Private Member draft');
});

test('real Backend session restores, rotates and rejects a protected admin API for Member', async ({
  page,
  context,
}) => {
  const email = process.env.REAL_SESSION_EMAIL;
  const password = process.env.REAL_SESSION_PASSWORD;
  test.skip(
    !email || !password,
    'Requires an authorized real Member account and MSW-disabled dev server.',
  );
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email!);
  await page.getByLabel(/password|mật khẩu/i).fill(password!);
  await page.getByRole('button', { name: /sign in|đăng nhập/i }).click();
  await expect(page).toHaveURL(/\/app(?:\/|$)/);
  const second = await context.newPage();
  await second.goto('/403');
  expect(await Promise.all([refresh(page), refresh(second)])).toEqual([true, true]);
  expect(
    await second.evaluate(async () => {
      const path = '/src/shared/api/client.ts';
      const { apiGet, tokenManager } = await import(/* @vite-ignore */ path);
      try {
        await apiGet('/identity/users');
        return false;
      } catch (error) {
        return (error as { status: number }).status === 403 && !!tokenManager.getAccess();
      }
    }),
  ).toBe(true);
  // Revoke only this test's login family, then assert protected access is denied.
  await page.evaluate(async () => {
    const path = '/src/shared/api/client.ts';
    const { apiPost, tokenManager } = await import(/* @vite-ignore */ path);
    await apiPost('/identity/logout', { refreshToken: tokenManager.getRefresh() });
    tokenManager.clear();
  });
  await second.goto('/app/profile');
  await expect(second).toHaveURL(/\/login$/);
});
