import { QueryProvider } from './providers/QueryProvider';
import { AppRouter } from './router';

import { ActionRollbackBar } from '@/shared/ui/ActionRollbackBar';
import { ErrorBoundary } from '@/shared/ui/error-boundary';
import { Toaster } from '@/shared/ui/toast';

export function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AppRouter />
        <Toaster />
        <ActionRollbackBar />
      </QueryProvider>
    </ErrorBoundary>
  );
}
