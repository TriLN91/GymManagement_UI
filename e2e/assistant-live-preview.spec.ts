import { readFileSync } from 'node:fs';

import { expect, test } from '@playwright/test';

type PreviewCredentials = { email: string; password: string };

const credentialFile = process.env.FITFLEX_PREVIEW_CREDENTIAL_FILE;
test.skip(!credentialFile, 'Set FITFLEX_PREVIEW_CREDENTIAL_FILE for the real-backend preview check.');

test('member completes the persisted assistant preview flow', async ({ page }) => {
  const credentials = JSON.parse(readFileSync(credentialFile!, 'utf8')) as PreviewCredentials;
  await page.goto('/login');
  await page.evaluate(() => {
    window.localStorage.clear();
    window.localStorage.setItem('gmc.locale', 'en');
    window.sessionStorage.clear();
  });
  await page.reload();
  await page.getByLabel(/email/i).fill(credentials.email);
  await page.getByLabel(/password/i).fill(credentials.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/app$/);

  await page.goto('/app/assistant');
  await expect(page.getByText('Development simulation — no live LLM')).toBeVisible();
  await page.getByRole('button', { name: /new/i }).click();
  await page.screenshot({ path: 'docs/architecture/screenshots/ai-assistant-welcome.png', fullPage: true });

  const composer = page.getByLabel('Message FitFlex Assistant');
  await composer.fill('Help me personalize my fitness experience');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('button', { name: 'Build strength' })).toBeVisible();
  await page.screenshot({ path: 'docs/architecture/screenshots/ai-assistant-choice.png', fullPage: true });

  await page.getByRole('button', { name: 'Build strength' }).click();
  await expect(page.getByRole('heading', { name: 'Tell me about your routine' })).toBeVisible();
  await page.getByLabel('Workout days per week').fill('3');
  await page.getByLabel('Minutes per session').fill('45');
  await page.getByLabel('Available equipment').fill('Dumbbells');
  await page.screenshot({ path: 'docs/architecture/screenshots/ai-assistant-form.png', fullPage: true });
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText(/Thanks — I saved your answers/)).toBeVisible();

  await composer.fill('What goal did I tell you earlier?');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText(/selected “strength” as your goal/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/selected “strength” as your goal/)).toBeVisible();
  await page.screenshot({ path: 'docs/architecture/screenshots/ai-assistant-persisted-context.png', fullPage: true });

  await page.getByRole('button', { name: /new/i }).click();
  await composer.fill('Show me my current training plan');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByLabel('Your current training plan')).toBeVisible();
  await page.screenshot({ path: 'docs/architecture/screenshots/ai-assistant-tool-result.png', fullPage: true });
});
