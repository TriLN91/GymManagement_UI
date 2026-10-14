import { defineConfig, devices } from '@playwright/test';

// Point E2E_BASE_URL at an already running dev server when port 5173 is taken.
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:5173';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: baseURL,
    trace: 'on-first-retry',
    // The app defaults to Vietnamese; most specs assert English copy, so they start in English.
    // Specs that need Vietnamese (landing) or a clean slate (i18n, auth) override this.
    storageState: {
      cookies: [],
      origins: [{ origin: baseURL, localStorage: [{ name: 'gmc.locale', value: 'en' }] }],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      VITE_ENABLE_MSW: 'true',
    },
  },
});
