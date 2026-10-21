import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';
import { mapAuthResponse, type AuthResponseDto } from '@/features/auth/api/mappers';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { tokenManager } from '@/shared/api/client';
import { env } from '@/shared/config/env';
import { bindLegacyState, resetAccountStores } from '@/shared/lib/accountState';

import '@/i18n';
import '@/styles/globals.css';

async function bootstrap() {
  // Refresh failed or token revoked: sign out locally so AuthGuard sends the user to /login.
  tokenManager.onSessionExpired(() => useAuthStore.getState().clear());

  if (env.VITE_ENABLE_MSW) {
    const { worker } = await import('@/mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }

  tokenManager.onSessionChanged((user) => useAuthStore.getState().syncSession(user));
  tokenManager.onRefreshIdentity((dto) => {
    const value = dto as Partial<AuthResponseDto>;
    return value.userId && value.email && value.fullName && Array.isArray(value.roles)
      ? mapAuthResponse(value as AuthResponseDto).user
      : null;
  });
  const fallbackUser = useAuthStore.getState().user;
  tokenManager.hydrate();
  await tokenManager.connect(fallbackUser);
  bindLegacyState(tokenManager.getUser()?.id);
  resetAccountStores(tokenManager.getUser()?.id ?? null);
  useAuthStore.getState().syncSession(tokenManager.getUser());

  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('Root element #root not found');

  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
