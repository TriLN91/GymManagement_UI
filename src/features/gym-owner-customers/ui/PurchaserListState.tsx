import { CircleAlert, ShoppingBag } from 'lucide-react';
import type { ReactNode } from 'react';

import type { PurchaserDataState } from '../model/types';

import { EmptyState } from '@/shared/ui/empty';
import { Skeleton } from '@/shared/ui/skeleton';

export function PurchaserListState({
  resource,
  loadingLabel,
  emptyLabel,
  errorLabel,
  children,
}: {
  resource: PurchaserDataState;
  loadingLabel: string;
  emptyLabel: string;
  errorLabel: string;
  children: (records: Extract<PurchaserDataState, { state: 'loaded' }>['data']) => ReactNode;
}) {
  if (resource.state === 'loading') {
    return (
      <div className="gym-customers-state" role="status" aria-label={loadingLabel}>
        <span className="sr-only">{loadingLabel}</span>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-4/5" />
      </div>
    );
  }

  if (resource.state === 'error') {
    return (
      <div className="gym-customers-state is-error" role="alert">
        <CircleAlert aria-hidden="true" size={22} />
        <strong>{errorLabel}</strong>
      </div>
    );
  }

  if (resource.state === 'empty' || resource.data.length === 0) {
    return <EmptyState className="gym-customers-empty" icon={ShoppingBag} title={emptyLabel} />;
  }

  return <>{children(resource.data)}</>;
}
