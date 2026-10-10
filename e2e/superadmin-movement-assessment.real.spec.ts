import { expect, test } from '@playwright/test';

const email = process.env.REAL_INTEGRATION_EMAIL;
const password = process.env.REAL_INTEGRATION_PASSWORD;
const videoPath = process.env.REAL_INTEGRATION_VIDEO;

test('real SuperAdmin completes the movement reference lifecycle', async ({ page }) => {
  test.skip(!email || !password || !videoPath, 'Real integration environment is not configured.');
  test.setTimeout(420_000);

  const apiOrigins = new Set<string>();
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith('/api/')) apiOrigins.add(url.origin);
  });

  await page.goto('/login');
  await page.evaluate(() => {
    window.localStorage.clear();
    window.localStorage.setItem('gmc.locale', 'en');
    window.sessionStorage.clear();
  });
  await page.reload();
  await expect(page.getByText(/demo accounts/i)).toHaveCount(0);

  await page.getByLabel(/email/i).fill(email!);
  await page.getByLabel(/password/i).fill(password!);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/superadmin$/);
  await expect
    .poll(() => page.evaluate(() => window.sessionStorage.getItem('gmc.accessToken')))
    .not.toBeNull();

  await page.reload();
  await expect(page).toHaveURL(/\/superadmin$/);
  await page.getByRole('link', { name: 'Movement Assessment' }).click();
  await expect(page.getByRole('heading', { name: 'Movement Assessment' })).toBeVisible();

  const exerciseName = `Real Browser Goblet Squat ${Date.now()}`;
  await page.getByRole('button', { name: 'Add exercise' }).click();
  await page.getByLabel('Name').fill(exerciseName);
  await page.getByLabel('Muscle group').fill('Legs');
  await page.getByLabel('Equipment').fill('Dumbbell');
  const exerciseResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/admin/movement-references/exercises') &&
      response.request().method() === 'POST',
  );
  await page.getByRole('dialog').getByRole('button', { name: 'Create' }).click();
  const exerciseResponse = await exerciseResponsePromise;
  expect(exerciseResponse.ok()).toBe(true);
  const exercise = (await exerciseResponse.json()) as { id: string };

  await page.locator('header').getByRole('button', { name: 'Create reference set' }).click();
  await expect(page.getByRole('dialog').locator('input[disabled]')).toHaveValue('SQUAT');
  const setResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/admin/reference-sets') &&
      response.request().method() === 'POST',
  );
  await page.getByRole('dialog').getByRole('button', { name: 'Create' }).click();
  const setResponse = await setResponsePromise;
  expect(setResponse.ok()).toBe(true);
  const referenceSet = (await setResponse.json()) as { id: string };
  await expect(page).toHaveURL(
    new RegExp(`/superadmin/movement-assessment/reference-sets/${referenceSet.id}$`),
  );

  const uploadButton = page.getByRole('button', { name: 'Upload and process' });
  await expect(uploadButton).toBeDisabled();
  await page.getByLabel('MP4 video').setInputFiles({
    name: 'not-a-video.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('invalid'),
  });
  await expect(page.getByRole('alert')).toHaveText('Select an MP4 video.');
  await expect(uploadButton).toBeDisabled();

  await page.getByLabel('MP4 video').setInputFiles(videoPath!);
  const uploadResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/admin/reference-sets/${referenceSet.id}/sources`) &&
      response.request().method() === 'POST',
    { timeout: 330_000 },
  );
  const uploadStartedAt = Date.now();
  await uploadButton.click();
  await expect(page.getByRole('button', { name: 'Uploading and processing…' })).toBeDisabled();
  const uploadResponse = await uploadResponsePromise;
  const uploadDurationMs = Date.now() - uploadStartedAt;
  expect(uploadResponse.ok()).toBe(true);
  const processedSet = (await uploadResponse.json()) as {
    profiles: Array<{ id: string; version: number; status: string }>;
    sources: Array<{
      acceptedRepCount: number;
      action: string;
      decision: string;
      detectedView: string;
      rejectedRepCount: number;
    }>;
  };
  const source = processedSet.sources.at(-1)!;
  const profile = processedSet.profiles.at(-1)!;

  await expect(page.getByText('Detected view: OBLIQUE_SIDE')).toBeVisible();
  await expect(page.getByText('Accepted', { exact: true })).toBeVisible();
  await expect(page.getByText('Keep', { exact: true })).toBeVisible();
  await expect(page.getByText('Review and confirm the aggregate profile')).toBeVisible();
  await page.getByText('Inspect technical evidence').click();
  await expect(page.getByText('Data quality', { exact: true })).toBeVisible();
  await expect(page.getByText('Deterministic evidence', { exact: true })).toBeVisible();
  await expect(page.getByText('TypeSafe fallback and governance')).toHaveCount(0);
  await expect(page.getByText(/normalizedTrajectory/)).toHaveCount(0);

  await page.getByRole('button', { name: 'Confirm' }).click();
  const confirmResponsePromise = page.waitForResponse((response) =>
    response.url().endsWith(`/profiles/${profile.id}/confirm`),
  );
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
  expect((await confirmResponsePromise).ok()).toBe(true);
  await expect(page.getByText('Activate the confirmed profile')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirm' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Activate' }).click();
  const activateResponsePromise = page.waitForResponse((response) =>
    response.url().endsWith(`/profiles/${profile.id}/activate`),
  );
  await page.getByRole('dialog').getByRole('button', { name: 'Activate' }).click();
  expect((await activateResponsePromise).ok()).toBe(true);
  await expect(page.getByText('Live reference')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Reference profile is live' })).toBeVisible();

  await page.reload();
  await expect(page.getByText('Live reference')).toBeVisible();

  await page.getByLabel('MP4 video').setInputFiles(videoPath!);
  const secondUploadResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/admin/reference-sets/${referenceSet.id}/sources`) &&
      response.request().method() === 'POST',
    { timeout: 330_000 },
  );
  await page.getByRole('button', { name: 'Upload and process' }).click();
  const secondUploadResponse = await secondUploadResponsePromise;
  expect(secondUploadResponse.ok()).toBe(true);
  const versionedSet = (await secondUploadResponse.json()) as {
    profiles: Array<{ id: string; version: number; status: string }>;
  };
  const newerProfile = versionedSet.profiles.reduce((latest, candidate) =>
    candidate.version > latest.version ? candidate : latest,
  );
  expect(newerProfile.version).toBeGreaterThan(profile.version);

  await page.getByRole('button', { name: 'Confirm' }).click();
  const secondConfirmResponsePromise = page.waitForResponse((response) =>
    response.url().endsWith(`/profiles/${newerProfile.id}/confirm`),
  );
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
  expect((await secondConfirmResponsePromise).ok()).toBe(true);
  await page.getByRole('button', { name: 'Activate' }).click();
  const secondActivateResponsePromise = page.waitForResponse((response) =>
    response.url().endsWith(`/profiles/${newerProfile.id}/activate`),
  );
  await page.getByRole('dialog').getByRole('button', { name: 'Activate' }).click();
  expect((await secondActivateResponsePromise).ok()).toBe(true);

  const history = page.getByRole('table');
  await expect(history.getByRole('row', { name: /v2.*Active/i })).toBeVisible();
  await expect(history.getByRole('row', { name: /v1.*Confirmed/i })).toBeVisible();
  expect([...apiOrigins]).toEqual(['http://localhost:8080']);

  console.log(
    JSON.stringify({
      exerciseId: exercise.id,
      referenceSetId: referenceSet.id,
      profileId: newerProfile.id,
      profileVersion: newerProfile.version,
      uploadDurationMs,
      detectedView: source.detectedView,
      decision: source.decision,
      action: source.action,
      acceptedRepCount: source.acceptedRepCount,
      rejectedRepCount: source.rejectedRepCount,
      apiOrigins: [...apiOrigins],
    }),
  );
});
