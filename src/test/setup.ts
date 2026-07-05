import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';

import i18n from '@/i18n';
import { handlers } from '@/mocks/handlers';

const server = setupServer(...handlers);

beforeAll(async () => {
  server.listen({ onUnhandledRequest: 'bypass' });
  // i18next.init is async; tests assert rendered text so we must wait for resources.
  // The @/i18n module calls init in module scope; wait until it reports ready.
  if (!i18n.isInitialized) {
    await new Promise<void>((resolve) => {
      i18n.on('initialized', () => resolve());
    });
  }
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});