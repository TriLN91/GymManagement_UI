import { expect, test, type Page } from '@playwright/test';

async function openWorkoutPlans(page: Page) {
  await page.addInitScript(() => {
    const user = {
      id: 'workout-e2e-member',
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

  await page.goto('/app/workout');
}

test.describe('Member workout plans', () => {
  test('shows assigned plans without filters and opens the weekly schedule', async ({ page }) => {
    await openWorkoutPlans(page);

    await expect(page.getByRole('heading', { name: 'Workout Plans' })).toHaveCount(0);
    await expect(
      page.getByRole('heading', {
        name: 'Upper Body Hypertrophy Matrix // 4-Day Split',
      }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /view weekly schedule/i })).toHaveAttribute(
      'href',
      '/app/workout/schedule',
    );

    await expect(page.getByRole('button', { name: 'Strength' })).toHaveCount(0);
    await expect(page.getByText('Full Body Kinetic Foundation')).toBeVisible();
    await expect(page.getByText('Chest & Triceps Precision')).toBeVisible();
  });

  test('switches Workout cards and Vietnamese headings without Sora fallback', async ({ page }) => {
    await openWorkoutPlans(page);

    await page.getByRole('button', { name: 'Tiếng Việt' }).click();
    await expect(page.getByRole('heading', { name: 'Kế Hoạch Tập Luyện' })).toHaveCount(0);
    const heading = page.getByRole('heading', {
      name: 'Ma Trận Tăng Cơ Thân Trên // Lịch 4 Ngày',
    });
    await expect(heading).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
    await expect(page.getByRole('link', { name: /Xem lịch tập tuần/i })).toBeVisible();

    const fontFamily = await heading.evaluate((element) => getComputedStyle(element).fontFamily);
    expect(fontFamily).toContain('Be Vietnam Pro');
    expect(fontFamily).not.toContain('Sora');

    await page.getByRole('link', { name: /Xem lịch tập tuần/i }).click();
    await expect(page.getByRole('heading', { name: 'Lịch Tập Trong Tuần' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Lưng và xô' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ngày nghỉ' })).toHaveCount(2);

    await page.getByRole('link', { name: /Thứ Ba.*Lưng và xô/i }).click();
    await expect(page.getByText('Kéo tạ đòn gập người')).toBeVisible();
    await page.getByRole('button', { name: 'Bắt đầu buổi tập' }).click();
    await expect(page.getByRole('heading', { name: 'Kéo tạ đòn gập người' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ghi kết quả thực tế' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Video hướng dẫn bài tập' })).toBeVisible();
  });

  test('uses the mobile navigation without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openWorkoutPlans(page);

    const workoutLinks = page.getByRole('link', { name: 'Workout plans' });
    await expect(workoutLinks.last()).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Upper Body Hypertrophy Matrix // 4-Day Split' }),
    ).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('expands the Member mind-map navigation groups', async ({ page }) => {
    await openWorkoutPlans(page);

    const workoutGroup = page.getByRole('button', { name: 'Workout', exact: true });
    await expect(workoutGroup).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('link', { name: 'Workout plans' })).toBeVisible();

    const marketplaceGroup = page.getByRole('button', { name: 'Marketplace', exact: true });
    await marketplaceGroup.click();
    await expect(marketplaceGroup).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('link', { name: 'Find gyms' })).toBeVisible();

    await workoutGroup.click();
    await expect(workoutGroup).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('link', { name: 'Workout plans' })).toBeHidden();
  });
});
