import { CircleAlert, Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

import type { AnalyticsDataState } from '../model/types';

import { EmptyState } from '@/shared/ui/empty';
import { Skeleton } from '@/shared/ui/skeleton';

interface AnalyticsStateProps<T> {
  resource: AnalyticsDataState<T>;
  loadingLabel: string;
  emptyLabel: string;
  errorLabel: string;
  children: (data: T) => ReactNode;
}

export function AnalyticsState<T>({
  resource,
  loadingLabel,
  emptyLabel,
  errorLabel,
  children,
}: AnalyticsStateProps<T>) {
  if (resource.state === 'loading') {
    return (
      <div className="gym-analytics-state" role="status" aria-label={loadingLabel}>
        <span className="sr-only">{loadingLabel}</span>
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (resource.state === 'error') {
    return (
      <div className="gym-analytics-state is-error" role="alert">
        <CircleAlert aria-hidden="true" size={22} />
        <strong>{resource.message || errorLabel}</strong>
      </div>
    );
  }

  if (resource.state === 'empty') {
    return <EmptyState className="gym-analytics-empty" icon={Inbox} title={emptyLabel} />;
  }

  return children(resource.data);
}
