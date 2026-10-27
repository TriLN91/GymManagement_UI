import {
  expect,
  test,
  type APIRequestContext,
  type APIResponse,
  type Page,
} from '@playwright/test';
import { readFileSync } from 'node:fs';

// Opt-in only: writes explicitly named demonstration records to the isolated running demo.
const enabled = process.env.FITFLEX_REVIEW2_LIVE === '1';
const api = process.env.REVIEW2_API_URL ?? 'http://localhost:5167/api';
const actorSessions = new Map<string, { Authorization: string }>();
async function data<T>(response: APIResponse): Promise<T> {
  expect(response.ok(), `${response.status()}: ${await response.text()}`).toBe(true);
  const body = await response.json();
  return (body.data ?? body) as T;
}
async function loginApi(request: APIRequestContext, email: string, password: string) {
  const cached = actorSessions.get(email);
  if (cached) return cached;
  const session = await data<{ accessToken: string }>(
    await request.post(`${api}/identity/login`, { data: { email, password } }),
  );
  const headers = { Authorization: `Bearer ${session.accessToken}` };
  actorSessions.set(email, headers);
  return headers;
}
async function loginUi(page: Page, email: string, password: string, path: string) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).not.toHaveURL(/\/login/);
  await page.goto(path);
}
test.describe('Review 2 running services (no intercepted API responses)', () => {
  test.setTimeout(120_000);
  test.skip(!enabled, 'Set FITFLEX_REVIEW2_LIVE=1 only for the isolated seeded demo.');
  test('Gym sends a real invitation and Member activates and reopens it', async ({
    request,
    page,
  }) => {
    expect(
      (
        await data<{ demoProvisioningEnabled: boolean }>(
          await request.get(`${api}/platform/pass-distribution/capabilities`),
        )
      ).demoProvisioningEnabled,
    ).toBe(true);
    const admin = await loginApi(request, 'admin@fitflex.test', 'LocalAdmin2026!');
    const owner = await loginApi(request, 'gymowner@fitflex.test', 'GymOwner2026!');
    const member = await loginApi(request, 'member@fitflex.test', 'Member2026!');
    const gym = (
      await data<{ id: string }[]>(
        await request.get(`${api}/gym-owner/brands/me`, { headers: owner }),
      )
    )[0];
    const profile = await data<{ memberProfileId: string }>(
      await request.get(`${api}/coaching/me/profile`, { headers: member }),
    );
    const code = `DEMO-R2-${Date.now()}`;
    const pass = await data<{ id: string; name: string }>(
      await request.post(`${api}/platform/pass-types`, {
        headers: admin,
        data: {
          code,
          name: `[DEMO] Review 2 ${code}`,
          description: 'Controlled demo grant; no purchase or payment.',
          aiTier: 'Basic',
          durationDays: 30,
          allowedAssessmentsCount: 1,
          featuresJson: '["MovementAssessment"]',
          wholesaleCreditPrice: 0,
          suggestedRetailPrice: 0,
        },
      }),
    );
    await data(
      await request.post(`${api}/platform/distribution-agreements`, {
        headers: admin,
        data: {
          gymId: gym.id,
          agreementNumber: code,
          packageName: 'Review 2 controlled provisioning',
          durationMonths: 1,
          branchScope: 'AllBranches',
          hasTrainerAiAccess: false,
          initialBatches: [{ passTypeId: pass.id, quantity: 2, unitPrice: 0 }],
        },
      }),
    );
    await loginUi(page, 'gymowner@fitflex.test', 'GymOwner2026!', '/admin/pass-distribution');
    await expect(
      page.getByRole('heading', { name: 'Pass Credit Inventory & Packages' }),
    ).toBeVisible();
    await expect(page.getByText(pass.name).first()).toBeVisible();
    await page.goto('/admin/pass-distribution/offers');
    await page.getByRole('button', { name: 'Send New Offer' }).click();
    await page.getByLabel('Recipient', { exact: true }).selectOption(profile.memberProfileId);
    await page.getByLabel('Pass Type', { exact: true }).selectOption(pass.id);
    const sent = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/gym-distribution/${gym.id}/offers`) &&
        response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Send Offer', exact: true }).click();
    const sentResponse = await sent;
    expect(sentResponse.ok()).toBe(true);
    const offer = (await sentResponse.json()).data as { id: string };
    // A separate browser context prevents one actor's credentials/state from leaking into another.
    const context = await page
      .context()
      .browser()!
      .newContext({
        baseURL: test.info().project.use.baseURL,
        storageState: {
          cookies: [],
          origins: [
            {
              origin: String(test.info().project.use.baseURL),
              localStorage: [{ name: 'gmc.locale', value: 'en' }],
            },
          ],
        },
      });
    const memberPage = await context.newPage();
    await loginUi(memberPage, 'member@fitflex.test', 'Member2026!', '/app/ai-pass');
    await memberPage.getByRole('button', { name: /Ưu đãi nhận thẻ/ }).click();
    await memberPage
      .getByRole('article', { name: pass.name })
      .getByRole('button', { name: 'Kích hoạt nhận thẻ' })
      .click();
    const consent = memberPage.getByRole('checkbox');
    if (await consent.count()) await consent.check();
    const accepted = memberPage.waitForResponse(
      (response) =>
        response.url().endsWith(`/offers/${offer.id}/accept`) &&
        response.request().method() === 'POST',
    );
    await memberPage
      .getByRole('button', { name: /Kích Hoạt Ngay|Xác Nhận & Thay Thế Thẻ/ })
      .click();
    expect((await accepted).ok()).toBe(true);
    await expect
      .poll(
        async () =>
          (
            await data<{ activePass: { passName: string } | null }>(
              await request.get(`${api}/member/ai-pass/current`, { headers: member }),
            )
          ).activePass?.passName,
      )
      .toBe(pass.name);
    await memberPage.reload();
    await expect(memberPage.getByText(pass.name).first()).toBeVisible();
    const replay = await data<{ success: boolean }>(
      await request.post(`${api}/member/ai-pass/offers/${offer.id}/accept`, {
        headers: member,
        data: {},
      }),
    );
    expect(replay.success).toBe(true);
    await context.close();
  });

  test('Member reviews persisted workout evidence and recovery against the real API', async ({
    request,
    page,
  }) => {
    const admin = await loginApi(request, 'admin@fitflex.test', 'LocalAdmin2026!');
    const member = await loginApi(request, 'member@fitflex.test', 'Member2026!');
    const code = `DEMO-WEEKLY-${Date.now()}`;
    await data(
      await request.put(`${api}/workouts/exercises`, {
        headers: admin,
        data: [
          {
            code,
            name: `[DEMO] Weekly evidence ${code}`,
            equipment: 'Dumbbell',
            muscleGroup: 'Quads',
            difficultyLevel: 'Beginner',
            instructions: 'Controlled integration example.',
            isActive: true,
          },
        ],
      }),
    );
    const exercise = (
      await data<{ id: string; code: string; name: string }[]>(
        await request.get(`${api}/workouts/exercises`, { headers: member }),
      )
    ).find((x) => x.code === code)!;
    for (let i = 0; i < 5; i++) {
      const session = await data<{ id: string }>(
        await request.post(`${api}/workouts/me/sessions`, {
          headers: member,
          data: {
            clientRequestId: `${code}-${i}`,
            workoutPlanVersionId: null,
            scheduledAtUtc: new Date().toISOString(),
            notes: '[DEMO] Controlled self-reported evidence; not observed exercise.',
            exercises: [
              {
                exerciseId: exercise.id,
                sortOrder: 1,
                logs: [
                  {
                    setNumber: 1,
                    repsCompleted: 10,
                    weightKg: 20,
                    durationSeconds: null,
                    perceivedExertion: 7,
                    notes: '[DEMO]',
                  },
                ],
              },
            ],
            activitySegments: [],
          },
        }),
      );
      await data(
        await request.post(`${api}/workouts/me/sessions/${session.id}/complete`, {
          headers: member,
          data: {},
        }),
      );
    }
    await loginUi(page, 'member@fitflex.test', 'Member2026!', '/app/weekly-review');
    await page.getByLabel('Exercise', { exact: true }).selectOption(exercise.id);
    await page.getByRole('button', { name: 'Evaluate this week' }).click();
    const card = page.getByRole('article', { name: exercise.name, exact: true });
    await expect(card.getByText('pending review · maintain', { exact: true })).toBeVisible();
    await expect(card.getByText(/5\/5 sessions in 25 days/)).toBeVisible();
    await card.getByText('Evidence and limitations (5 records)').click();
    await expect(card.getByText(/self-reported, not PT verification/).first()).toBeVisible();
    const reviewed = page.waitForResponse(
      (response) => response.url().endsWith('/review') && response.request().method() === 'POST',
    );
    await card.getByRole('button', { name: 'Mark as reviewed (no plan changes)' }).click();
    expect((await reviewed).ok()).toBe(true);
    await expect(card.getByText('reviewed · maintain', { exact: true })).toBeVisible();
    await page.reload();
    await expect(card.getByText('reviewed · maintain', { exact: true })).toBeVisible();
    await data(
      await request.post(`${api}/progression/me/recovery`, {
        headers: member,
        data: {
          severity: 'Severe',
          symptom: 'Fatigue',
          bodyArea: null,
          notes: '[DEMO] Recovery override exercise.',
        },
      }),
    );
    await page.getByLabel('Exercise', { exact: true }).selectOption(exercise.id);
    await page.getByRole('button', { name: 'Evaluate this week' }).click();
    await expect(
      card.getByText('pending review · reduce or recover', { exact: true }),
    ).toBeVisible();
    const reviews = await data<
      { exerciseId: string; evaluation: { evidence: { source: string; id: string }[] } }[]
    >(await request.get(`${api}/progression/me/weekly`, { headers: member }));
    const recovery = reviews
      .find((x) => x.exerciseId === exercise.id)!
      .evaluation.evidence.find((x) => x.source === 'recovery_report')!;
    await data(
      await request.post(`${api}/progression/me/weekly/recovery/${recovery.id}/resolve`, {
        headers: member,
      }),
    );
  });

  test('Admin uploads real reference video and reopens persisted extraction in the browser', async ({
    request,
    page,
  }) => {
    test.skip(!process.env.REVIEW2_VIDEO, 'Set REVIEW2_VIDEO to the existing hinge video.');
    test.setTimeout(360_000);
    const admin = await loginApi(request, 'admin@fitflex.test', 'LocalAdmin2026!');
    const name = `[DEMO] Real-video hinge ${Date.now()}`;
    const exercise = await data<{ id: string }>(
      await request.post(`${api}/admin/movement-runtime/exercises`, {
        headers: admin,
        data: {
          name,
          equipment: 'Bodyweight',
          muscleGroup: null,
          instructions: 'Controlled Review 2 reference processing.',
          pattern: 'HINGE',
          isActive: true,
          targetMuscles: [
            { code: 'hamstrings', role: 'PRIMARY' },
            { code: 'gluteus_maximus', role: 'SECONDARY' },
          ],
          metadataRevision: 0,
        },
      }),
    );
    const set = await data<{ id: string }>(
      await request.post(`${api}/admin/reference-sets`, {
        headers: admin,
        data: { exerciseId: exercise.id, pattern: 'HINGE' },
      }),
    );
    const processed = await data<{ profiles: { id: string; acceptedRepCount: number }[] }>(
      await request.post(`${api}/admin/reference-sets/${set.id}/sources`, {
        headers: admin,
        timeout: 330_000,
        multipart: {
          video: {
            name: 'demo-real-hinge.mp4',
            mimeType: 'video/mp4',
            buffer: readFileSync(process.env.REVIEW2_VIDEO!),
          },
        },
      }),
    );
    expect(processed.profiles.at(-1)!.acceptedRepCount).toBeGreaterThanOrEqual(2);
    await loginUi(
      page,
      'admin@fitflex.test',
      'LocalAdmin2026!',
      `/superadmin/movement-assessment/reference-sets/${set.id}`,
    );
    await expect(page.getByText(name).first()).toBeVisible();
    await page.reload();
    await expect(page.getByText(name).first()).toBeVisible();
  });
});
