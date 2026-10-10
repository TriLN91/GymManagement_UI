import { AlertTriangle, ListFilter, RotateCcw, Settings2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { loadPlatformDashboard } from '../model/dashboardRepository';
import {
  PLATFORM_WIDGET_IDS,
  type PlatformDashboardData,
  type PlatformDashboardResource,
  type PlatformQueueItem,
  type PlatformWidgetId,
} from '../model/types';
import { usePlatformDashboardPreferences } from '../model/usePlatformDashboardPreferences';

import { platformCopy, type PlatformCopy } from './copy';
import { PlatformDashboardCustomizationDialog } from './PlatformDashboardCustomizationDialog';

import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty';
import { Skeleton } from '@/shared/ui/skeleton';

import './platform-dashboard.css';

function QueueItem({ item, copy }: { item: PlatformQueueItem; copy: PlatformCopy }) {
  return (
    <li className="platform-queue-item">
      <span className={`platform-queue-item__marker is-${item.priority}`} aria-hidden="true" />
      <span className="platform-queue-item__identity">
        <strong>{copy.itemKinds[item.kind]}</strong>
        <small>{item.reference}</small>
      </span>
      <span className={`platform-priority is-${item.priority}`}>
        {copy.priority[item.priority]}
      </span>
    </li>
  );
}

function QueueWidget({
  id,
  items,
  copy,
}: {
  id: PlatformWidgetId;
  items: PlatformQueueItem[];
  copy: PlatformCopy;
}) {
  return (
    <Card variant="panel" className="platform-widget">
      <div className="platform-widget__header">
        <h2>{copy.widgetTitles[id]}</h2>
        <span>{items.length}</span>
      </div>
      {items.length > 0 ? (
        <ul className="platform-widget__items">
          {items.map((item) => (
            <QueueItem key={item.id} item={item} copy={copy} />
          ))}
        </ul>
      ) : (
        <div className="platform-widget__empty">{copy.noData}</div>
      )}
    </Card>
  );
}

function DashboardContent({ data, copy }: { data: PlatformDashboardData; copy: PlatformCopy }) {
  const order = usePlatformDashboardPreferences((state) => state.order);
  const hidden = usePlatformDashboardPreferences((state) => state.hidden);
  const visible = order.filter((id) => !hidden.includes(id));
  const total = PLATFORM_WIDGET_IDS.reduce((sum, id) => sum + data[id].length, 0);

  if (total === 0) {
    return <EmptyState icon={ListFilter} title={copy.noData} />;
  }

  if (visible.length === 0) {
    return <EmptyState icon={Settings2} title={copy.noWidgets} />;
  }

  return (
    <>
      <section className="platform-summary" aria-label={copy.overview}>
        {PLATFORM_WIDGET_IDS.map((id) => (
          <div className={`platform-summary__item is-${id}`} key={id}>
            <span>{copy.widgetTitles[id]}</span>
            <strong>{data[id].length}</strong>
            <small>{copy.items}</small>
          </div>
        ))}
      </section>
      <section className="platform-widget-grid" aria-label={copy.overview}>
        {visible.map((id) => (
          <QueueWidget key={id} id={id} items={data[id]} copy={copy} />
        ))}
      </section>
    </>
  );
}

export function PlatformDashboardPage() {
  const { i18n } = useTranslation('common');
  const copy = platformCopy[i18n.resolvedLanguage === 'vi' ? 'vi' : 'en'];
  const [resource, setResource] = useState<PlatformDashboardResource>({ state: 'loading' });
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const load = useCallback(() => {
    setResource({ state: 'loading' });
    void loadPlatformDashboard()
      .then((data) => {
        const count = PLATFORM_WIDGET_IDS.reduce((sum, id) => sum + data[id].length, 0);
        setResource(count ? { state: 'loaded', data } : { state: 'empty' });
      })
      .catch(() => setResource({ state: 'error' }));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="platform-dashboard">
      <h1 className="sr-only">{copy.dashboard}</h1>
      <div className="platform-dashboard__toolbar">
        <div className="platform-dashboard__tools">
          <span className="platform-sample-label">{copy.sample}</span>
          <Button type="button" variant="outline" onClick={() => setCustomizeOpen(true)}>
            <Settings2 aria-hidden="true" size={16} />
            {copy.customize}
          </Button>
        </div>
      </div>

      {resource.state === 'loading' ? (
        <div className="platform-dashboard__loading" role="status" aria-label={copy.loading}>
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-60 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      ) : resource.state === 'error' ? (
        <EmptyState
          icon={AlertTriangle}
          title={copy.loadError}
          action={
            <Button type="button" onClick={load}>
              <RotateCcw aria-hidden="true" size={16} />
              {copy.retry}
            </Button>
          }
        />
      ) : resource.state === 'empty' ? (
        <EmptyState icon={ListFilter} title={copy.noData} />
      ) : (
        <DashboardContent data={resource.data} copy={copy} />
      )}

      <PlatformDashboardCustomizationDialog
        copy={copy}
        open={customizeOpen}
        onOpenChange={setCustomizeOpen}
      />
    </div>
  );
}
