import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { queryClient } from '@/shared/config/queryClient';
import { notifyError } from '@/shared/lib/errorNotifier';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('errors');
  // Last-resort handlers — anything not caught by React Query or ErrorBoundary
  // surfaces here so the user sees a toast instead of a silent failure.
  useEffect(() => {
    const onError = (event: ErrorEvent): void => {
      event.preventDefault();
      notifyError(event.error ?? event.message);
    };
    const onRejection = (event: PromiseRejectionEvent): void => {
      event.preventDefault();
      notifyError(event.reason);
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    // Prime the toast namespace with a known-good title so it never appears blank.
    void t('global.title');
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, [t]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
