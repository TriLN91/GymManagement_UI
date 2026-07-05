import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { tokenManager } from '@/shared/api/client';
import { env } from '@/shared/config/env';

import '@/i18n';
import '@/styles/globals.css';

async function bootstrap() {
  tokenManager.hydrate();
  useAuthStore.getState().hydrate();

  if (env.VITE_ENABLE_MSW) {
    const { worker } = await import('@/mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }

  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('Root element #root not found');

  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();