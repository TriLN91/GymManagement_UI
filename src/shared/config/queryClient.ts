import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { AuthError, NetworkError, ValidationError } from '@/shared/api/errorTypes';
import { notifyError } from '@/shared/lib/errorNotifier';

function reportQuery(error: unknown): void {
  // Network/auth/validation errors are surfaced by their own UI hooks (login
  // form, error states, redirect to /login). Toasting them here would double up.
  if (
    error instanceof AuthError ||
    error instanceof ValidationError ||
    error instanceof NetworkError
  ) {
    return;
  }
  notifyError(error);
}

function reportMutation(error: unknown): void {
  // Validation errors are mapped onto form fields by callers — don't toast.
  // Auth errors are redirected by useAuth. Everything else is user-facing.
  if (error instanceof ValidationError || error instanceof AuthError) return;
  notifyError(error);
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: reportQuery }),
  mutationCache: new MutationCache({ onError: reportMutation }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        if (error instanceof AuthError || error instanceof ValidationError) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});
