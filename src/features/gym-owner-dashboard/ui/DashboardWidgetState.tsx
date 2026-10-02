import { CircleAlert, Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

import type { DashboardResource } from '../model/types';

import { EmptyState } from '@/shared/ui/empty';
import { Skeleton } from '@/shared/ui/skeleton';

interface DashboardWidgetStateProps<T> {
  resource: DashboardResource<T>;
  loadingLabel: string;
  emptyLabel: string;
  errorLabel: string;
  children: (data: T) => ReactNode;
}

export function DashboardWidgetState<T>({
  resource,
  loadingLabel,
  emptyLabel,
  errorLabel,
  children,
}: DashboardWidgetStateProps<T>) {
  if (resource.state === 'loading') {
    return (
      <div className="gym-dashboard-state is-loading" role="status" aria-label={loadingLabel}>
        <span className="sr-only">{loadingLabel}</span>
        <Skeleton className="h-12 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-4/5" />
      </div>
    );
  }

  if (resource.state === 'error') {
    return (
      <div className="gym-dashboard-state is-error" role="alert">
        <CircleAlert aria-hidden="true" size={22} />
        <strong>{resource.message || errorLabel}</strong>
      </div>
    );
  }

  if (
    resource.state === 'empty' ||
    (resource.state === 'loaded' && Array.isArray(resource.data) && resource.data.length === 0)
  ) {
    return <EmptyState className="gym-dashboard-empty" icon={Inbox} title={emptyLabel} />;
  }

  return resource.state === 'loaded' ? children(resource.data) : null;
}
