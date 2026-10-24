import { QueryProvider } from './providers/QueryProvider';
import { SignalRProvider } from './providers/SignalRProvider';
import { AppRouter } from './router';

import { ActionRollbackBar } from '@/shared/ui/ActionRollbackBar';
import { ErrorBoundary } from '@/shared/ui/error-boundary';
import { Toaster } from '@/shared/ui/toast';

export function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <SignalRProvider>
          <AppRouter />
          <Toaster />
          <ActionRollbackBar />
        </SignalRProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
