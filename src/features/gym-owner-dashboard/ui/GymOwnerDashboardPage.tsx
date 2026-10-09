import type { LucideIcon } from 'lucide-react';
import {
  CalendarClock,
  CircleAlert,
  ClipboardList,
  LayoutGrid,
  Settings2,
  ShoppingBag,
  UsersRound,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { gymOwnerDashboardMockResources } from '../model/dashboardMockData';
import { countTrainersByStatus, sortAlertsBySeverity } from '../model/dashboardSelectors';
import type {
  AppointmentStatus,
  DashboardAppointmentRecord,
  DashboardAssignmentRecord,
  DashboardOperationalAlert,
  DashboardPTPurchaseRecord,
  DashboardResource,
  DashboardTrainerRecord,
  DashboardWidgetId,
  OperationalAlertSeverity,
  PTPurchaseStatus,
} from '../model/types';
import { useGymOwnerDashboardPreferences } from '../model/useGymOwnerDashboardPreferences';

import { gymOwnerDashboardCopy, type GymOwnerDashboardCopy } from './copy';
import { DashboardCustomizationDialog } from './DashboardCustomizationDialog';
import { DashboardWidgetState } from './DashboardWidgetState';

import { useLocale } from '@/shared/hooks/useLocale';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty';
import { WorkspacePage, WorkspacePanel } from '@/shared/ui/workspace';

import './gym-owner-dashboard.css';

interface DashboardWidgetProps {
  title: string;
  icon: LucideIcon;
  count?: number;
  countLabel: string;
  wide?: boolean;
  children: ReactNode;
}

function DashboardWidget({
  title,
  icon: Icon,
  count,
  countLabel,
  wide,
  children,
}: DashboardWidgetProps) {
  return (
    <WorkspacePanel className={cn('gym-dashboard-widget', wide && 'is-wide')}>
      <header className="gym-dashboard-widget__header">
        <div>
          <span aria-hidden="true">
            <Icon size={18} />
          </span>
          <h2>{title}</h2>
        </div>
        {count !== undefined ? (
          <Badge variant="accent">
            {count} {countLabel}
          </Badge>
        ) : null}
      </header>
      <div className="gym-dashboard-widget__body">{children}</div>
    </WorkspacePanel>
  );
}

function resourceCount<T>(resource: DashboardResource<T[]>) {
  return resource.state === 'loaded' ? resource.data.length : undefined;
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' }).format(
    new Date(value),
  );
}

function formatDateTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function WidgetState<T>({
  widgetId,
  resource,
  copy,
  children,
}: {
  widgetId: DashboardWidgetId;
  resource: DashboardResource<T[]>;
  copy: GymOwnerDashboardCopy;
  children: (data: T[]) => ReactNode;
}) {
  return (
    <DashboardWidgetState
      resource={resource}
      loadingLabel={copy.states.loading}
      emptyLabel={copy.states.empty[widgetId]}
      errorLabel={copy.states.error}
    >
      {children}
    </DashboardWidgetState>
  );
}

function TrainersWidget({ copy }: { copy: GymOwnerDashboardCopy }) {
  const resource = gymOwnerDashboardMockResources.trainers;
  return (
    <DashboardWidget
      title={copy.widgets.trainers}
      icon={UsersRound}
      count={resourceCount(resource)}
      countLabel={copy.records}
    >
      <WidgetState<DashboardTrainerRecord> widgetId="trainers" resource={resource} copy={copy}>
        {(records) => (
          <>
            <div className="gym-dashboard-primary-metric">
              <strong>{records.length}</strong>
              <span>{copy.trainerTotal}</span>
            </div>
            <dl className="gym-dashboard-status-grid">
              {countTrainersByStatus(records).map(({ status, count }) => (
                <div key={status}>
                  <dt>
                    <span className={`gym-dashboard-status-dot is-${status}`} />
                    {copy.trainerStatuses[status]}
                  </dt>
                  <dd>{count}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </WidgetState>
    </DashboardWidget>
  );
}

function AssignmentsWidget({ copy, locale }: { copy: GymOwnerDashboardCopy; locale: string }) {
  const resource = gymOwnerDashboardMockResources.assignments;
  return (
    <DashboardWidget
      title={copy.widgets.assignments}
      icon={ClipboardList}
      count={resourceCount(resource)}
      countLabel={copy.records}
    >
      <WidgetState<DashboardAssignmentRecord>
        widgetId="assignments"
        resource={resource}
        copy={copy}
      >
        {(records) => {
          const activeCount = records.filter((record) => record.status === 'active').length;
          const historicalCount = records.length - activeCount;
          return (
            <>
              <dl className="gym-dashboard-dual-metric">
                <div>
                  <dt>{copy.assignmentStatuses.active}</dt>
                  <dd>{activeCount}</dd>
                </div>
                <div>
                  <dt>{copy.assignmentStatuses.historical}</dt>
                  <dd>{historicalCount}</dd>
                </div>
              </dl>
              <div className="gym-dashboard-record-list">
                {records.map((record) => (
                  <article key={record.id}>
                    <div>
                      <strong>{record.memberName}</strong>
                      <Badge variant={record.status === 'active' ? 'accent' : 'neutral'}>
                        {copy.assignmentStatuses[record.status]}
                      </Badge>
                    </div>
                    <p>{record.packageName}</p>
                    <dl>
                      <div>
                        <dt>{copy.trainer}</dt>
                        <dd>{record.trainerName}</dd>
                      </div>
                      <div>
                        <dt>{copy.period}</dt>
                        <dd>
                          {formatDate(record.startsOn, locale)} –{' '}
                          {formatDate(record.endsOn, locale)}
                        </dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </>
          );
        }}
      </WidgetState>
    </DashboardWidget>
  );
}

function PTSalesWidget({ copy, locale }: { copy: GymOwnerDashboardCopy; locale: string }) {
  const resource = gymOwnerDashboardMockResources.ptSales;
  const statusVariant: Record<PTPurchaseStatus, 'accent' | 'neutral'> = {
    confirmed: 'accent',
    pending: 'neutral',
  };
  return (
    <DashboardWidget
      title={copy.widgets.ptSales}
      icon={ShoppingBag}
      count={resourceCount(resource)}
      countLabel={copy.records}
    >
      <WidgetState<DashboardPTPurchaseRecord> widgetId="ptSales" resource={resource} copy={copy}>
        {(records) => (
          <div className="gym-dashboard-compact-list">
            {records.map((record) => (
              <article key={record.id}>
                <div className="gym-dashboard-record-icon" aria-hidden="true">
                  <ShoppingBag size={16} />
                </div>
                <div>
                  <strong>{record.packageName}</strong>
                  <span>{record.trainerName}</span>
                </div>
                <div>
                  <Badge variant={statusVariant[record.status]}>
                    {copy.purchaseStatuses[record.status]}
                  </Badge>
                  <time dateTime={record.purchasedAt}>
                    {formatDate(record.purchasedAt, locale)}
                  </time>
                </div>
              </article>
            ))}
          </div>
        )}
      </WidgetState>
    </DashboardWidget>
  );
}

function AppointmentsWidget({ copy, locale }: { copy: GymOwnerDashboardCopy; locale: string }) {
  const resource = gymOwnerDashboardMockResources.appointments;
  const statusVariant: Record<AppointmentStatus, 'accent' | 'neutral' | 'destructive'> = {
    confirmed: 'accent',
    pending: 'neutral',
    cancelled: 'destructive',
  };
  return (
    <DashboardWidget
      title={copy.widgets.appointments}
      icon={CalendarClock}
      count={resourceCount(resource)}
      countLabel={copy.records}
    >
      <WidgetState<DashboardAppointmentRecord>
        widgetId="appointments"
        resource={resource}
        copy={copy}
      >
        {(records) => (
          <div className="gym-dashboard-appointment-list">
            {records.map((record) => (
              <article key={record.id} className={`is-${record.status}`}>
                <time dateTime={record.startsAt}>{formatDateTime(record.startsAt, locale)}</time>
                <div>
                  <strong>{copy.appointmentTypes[record.type]}</strong>
                  <span>
                    {record.memberName} · {record.trainerName}
                  </span>
                </div>
                <Badge variant={statusVariant[record.status]}>
                  {copy.appointmentStatuses[record.status]}
                </Badge>
              </article>
            ))}
          </div>
        )}
      </WidgetState>
    </DashboardWidget>
  );
}

function AlertsWidget({ copy, locale }: { copy: GymOwnerDashboardCopy; locale: string }) {
  const resource = gymOwnerDashboardMockResources.alerts;
  const severityVariant: Record<OperationalAlertSeverity, 'destructive' | 'neutral' | 'accent'> = {
    high: 'destructive',
    medium: 'neutral',
    low: 'accent',
  };
  return (
    <DashboardWidget
      title={copy.widgets.alerts}
      icon={CircleAlert}
      count={resourceCount(resource)}
      countLabel={copy.records}
      wide
    >
      <WidgetState<DashboardOperationalAlert> widgetId="alerts" resource={resource} copy={copy}>
        {(records) => (
          <div className="gym-dashboard-alert-list">
            {sortAlertsBySeverity(records).map((record) => (
              <article key={record.id} className={`is-${record.severity}`}>
                <span className="gym-dashboard-alert-icon" aria-hidden="true">
                  <CircleAlert size={17} />
                </span>
                <div>
                  <strong>{copy.alertMessages[record.message]}</strong>
                  <span>{record.subject}</span>
                </div>
                <div>
                  <Badge variant={severityVariant[record.severity]}>
                    {copy.severity[record.severity]}
                  </Badge>
                  <time dateTime={record.occurredAt}>
                    {formatDateTime(record.occurredAt, locale)}
                  </time>
                </div>
              </article>
            ))}
          </div>
        )}
      </WidgetState>
    </DashboardWidget>
  );
}

export function GymOwnerDashboardPage() {
  const { language, locale } = useLocale();
  const copy = gymOwnerDashboardCopy[language];
  const order = useGymOwnerDashboardPreferences((state) => state.order);
  const hidden = useGymOwnerDashboardPreferences((state) => state.hidden);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const visibleWidgets = order.filter((widgetId) => !hidden.includes(widgetId));

  const renderers: Record<DashboardWidgetId, () => ReactNode> = {
    trainers: () => <TrainersWidget copy={copy} />,
    assignments: () => <AssignmentsWidget copy={copy} locale={locale} />,
    ptSales: () => <PTSalesWidget copy={copy} locale={locale} />,
    appointments: () => <AppointmentsWidget copy={copy} locale={locale} />,
    alerts: () => <AlertsWidget copy={copy} locale={locale} />,
  };

  const handleSaved = () => {
    setSavedMessage(copy.preferencesSaved);
    window.setTimeout(() => setSavedMessage(''), 3000);
  };

  return (
    <WorkspacePage width="wide" className="gym-dashboard-page">
      <h1 className="sr-only">{copy.dashboard}</h1>
      <div className="gym-dashboard-toolbar">
        <p role="status" aria-live="polite">
          {savedMessage}
        </p>
        <Button type="button" variant="outline" onClick={() => setIsCustomizing(true)}>
          <Settings2 aria-hidden="true" size={16} />
          {copy.customize}
        </Button>
      </div>

      {visibleWidgets.length > 0 ? (
        <div className="gym-dashboard-grid">
          {visibleWidgets.map((widgetId) => (
            <div className="gym-dashboard-grid__item" key={widgetId} data-widget-id={widgetId}>
              {renderers[widgetId]()}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          className="gym-dashboard-all-hidden"
          icon={LayoutGrid}
          title={copy.allHidden}
          action={
            <Button type="button" onClick={() => setIsCustomizing(true)}>
              {copy.showWidgets}
            </Button>
          }
        />
      )}

      <DashboardCustomizationDialog
        copy={copy}
        open={isCustomizing}
        onOpenChange={setIsCustomizing}
        onSaved={handleSaved}
      />
    </WorkspacePage>
  );
}
