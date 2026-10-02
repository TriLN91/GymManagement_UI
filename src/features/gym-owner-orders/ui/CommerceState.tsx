import { CircleAlert, Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

import type { CommerceDataState } from '../model/types';

import { EmptyState } from '@/shared/ui/empty';
import { Skeleton } from '@/shared/ui/skeleton';

interface CommerceStateProps<T> {
  resource: CommerceDataState<T>;
  loadingLabel: string;
  emptyLabel: string;
  errorLabel: string;
  children: (data: T) => ReactNode;
}

export function CommerceState<T>({
  resource,
  loadingLabel,
  emptyLabel,
  errorLabel,
  children,
}: CommerceStateProps<T>) {
  if (resource.state === 'loading') {
    return (
      <div className="gym-commerce-state" role="status" aria-label={loadingLabel}>
        <span className="sr-only">{loadingLabel}</span>
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (resource.state === 'error') {
    return (
      <div className="gym-commerce-state is-error" role="alert">
        <CircleAlert aria-hidden="true" size={22} />
        <strong>{resource.message || errorLabel}</strong>
      </div>
    );
  }

  if (
    resource.state === 'empty' ||
    (resource.state === 'loaded' && Array.isArray(resource.data) && resource.data.length === 0)
  ) {
    return <EmptyState className="gym-commerce-empty" icon={Inbox} title={emptyLabel} />;
  }

  return resource.state === 'loaded' ? children(resource.data) : null;
}
