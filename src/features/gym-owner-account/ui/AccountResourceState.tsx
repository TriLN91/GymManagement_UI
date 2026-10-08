import { CircleAlert, Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

import type { AccountResourceState } from '../model/types';

import { EmptyState } from '@/shared/ui/empty';
import { Skeleton } from '@/shared/ui/skeleton';

interface AccountResourceStateProps<T> {
  resource: AccountResourceState<T>;
  loadingLabel: string;
  emptyLabel: string;
  errorLabel: string;
  children: (data: T) => ReactNode;
}

export function AccountResourceStateView<T>({
  resource,
  loadingLabel,
  emptyLabel,
  errorLabel,
  children,
}: AccountResourceStateProps<T>) {
  if (resource.state === 'loading') {
    return (
      <div className="gym-account-state" role="status" aria-label={loadingLabel}>
        <span className="sr-only">{loadingLabel}</span>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }
  if (resource.state === 'error') {
    return (
      <div className="gym-account-state is-error" role="alert">
        <CircleAlert aria-hidden="true" size={21} />
        <strong>{resource.message || errorLabel}</strong>
      </div>
    );
  }
  if (resource.state === 'empty') {
    return <EmptyState className="gym-account-empty" icon={Inbox} title={emptyLabel} />;
  }
  return children(resource.data);
}
