import { CircleAlert, Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

import type { ManagementDataState } from '../model/types';

import { EmptyState } from '@/shared/ui/empty';
import { Skeleton } from '@/shared/ui/skeleton';

export function ManagementState({
  state,
  isEmpty,
  loadingLabel,
  emptyLabel,
  errorLabel,
  children,
}: {
  state: ManagementDataState;
  isEmpty: boolean;
  loadingLabel: string;
  emptyLabel: string;
  errorLabel: string;
  children: ReactNode;
}) {
  if (state === 'loading') {
    return (
      <div className="gym-training-state" role="status" aria-label={loadingLabel}>
        <span className="sr-only">{loadingLabel}</span>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-4/5" />
      </div>
    );
  }
  if (state === 'error') {
    return (
      <div className="gym-training-state is-error" role="alert">
        <CircleAlert aria-hidden="true" size={22} />
        <strong>{errorLabel}</strong>
      </div>
    );
  }
  if (state === 'empty' || isEmpty) {
    return <EmptyState className="gym-training-empty" icon={Inbox} title={emptyLabel} />;
  }
  return <>{children}</>;
}
