import {
  Activity,
  CalendarDays,
  Eye,
  ShoppingBag,
  UserRoundCheck,
  WalletCards,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createPeriodPair, validateCustomRange } from '../model/dateRange';
import { analyticsPresetResources, getCustomAnalyticsResource } from '../model/mockData';
import type {
  AnalyticsDataState,
  AnalyticsMetricId,
  AnalyticsRangeKey,
  BackendAnalyticsMetric,
  GymOwnerAnalyticsSnapshot,
} from '../model/types';

import { AnalyticsState } from './AnalyticsState';
import { AnalyticsTrendChart } from './AnalyticsTrendChart';
import { gymOwnerAnalyticsCopy } from './copy';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { WorkspacePage, WorkspacePanel } from '@/shared/ui/workspace';

import './gym-owner-analytics.css';

const metricOrder: ReadonlyArray<AnalyticsMetricId> = [
  'sales',
  'views',
  'purchases',
  'assignments',
  'trainerActivity',
];

const commercialMetricOrder: ReadonlyArray<AnalyticsMetricId> = ['sales', 'views', 'purchases'];

const metricIcons = {
  sales: WalletCards,
  views: Eye,
  purchases: ShoppingBag,
  assignments: UserRoundCheck,
  trainerActivity: Activity,
} as const;

function formatDateRange(startDate: string, endDate: string, locale: string) {
  const formatter = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return `${formatter.format(new Date(`${startDate}T12:00:00+07:00`))} – ${formatter.format(new Date(`${endDate}T12:00:00+07:00`))}`;
}

function formatMetricValue(metric: BackendAnalyticsMetric, value: number, locale: string) {
  if (metric.unit === 'vnd') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat(locale).format(value);
}

function formatSigned(value: number, locale: string) {
  return new Intl.NumberFormat(locale, { signDisplay: 'always', maximumFractionDigits: 1 }).format(
    value,
  );
}

function formatSignedMetricValue(metric: BackendAnalyticsMetric, value: number, locale: string) {
  const formatted = formatMetricValue(metric, Math.abs(value), locale);
  return `${value >= 0 ? '+' : '-'}${formatted}`;
}

export function GymOwnerAnalyticsPage() {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === 'vi';
  const copy = gymOwnerAnalyticsCopy[isVi ? 'vi' : 'en'];
  const locale = isVi ? 'vi-VN' : 'en-US';
  const [range, setRange] = useState<AnalyticsRangeKey>('30d');
  const [customStart, setCustomStart] = useState('2026-09-01');
  const [customEnd, setCustomEnd] = useState('2026-09-15');
  const [customError, setCustomError] = useState<string | null>(null);
  const [customResource, setCustomResource] = useState<
    AnalyticsDataState<GymOwnerAnalyticsSnapshot>
  >(() => getCustomAnalyticsResource('2026-09-01', '2026-09-15'));
  const [selectedCommercialMetric, setSelectedCommercialMetric] =
    useState<AnalyticsMetricId>('sales');

  const resource = range === 'custom' ? customResource : analyticsPresetResources[range];

  const applyCustomRange = () => {
    const validation = validateCustomRange(customStart, customEnd);
    if (!validation.valid) {
      setCustomError(validation.reason === 'order' ? copy.rangeOrder : copy.rangeRequired);
      return;
    }
    setCustomError(null);
    setCustomResource(getCustomAnalyticsResource(customStart, customEnd));
  };

  const customPeriod = useMemo(
    () => createPeriodPair(customStart, customEnd),
    [customEnd, customStart],
  );

  return (
    <WorkspacePage width="wide" className="gym-analytics-page">
      <h1 className="sr-only">{copy.pageTitle}</h1>

      <div className="gym-analytics-range" aria-label={copy.range}>
        <div className="gym-analytics-range__presets" role="group" aria-label={copy.range}>
          {(['7d', '30d', '90d', 'custom'] as const).map((key) => (
            <button
              key={key}
              type="button"
              className={range === key ? 'is-selected' : undefined}
              aria-pressed={range === key}
              onClick={() => setRange(key)}
            >
              {key === '7d'
                ? copy.last7Days
                : key === '30d'
                  ? copy.last30Days
                  : key === '90d'
                    ? copy.last90Days
                    : copy.custom}
            </button>
          ))}
        </div>

        {range === 'custom' ? (
          <div className="gym-analytics-custom-range">
            <div>
              <Label htmlFor="analytics-start">{copy.startDate}</Label>
              <Input
                id="analytics-start"
                type="date"
                value={customStart}
                aria-invalid={Boolean(customError)}
                onChange={(event) => setCustomStart(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="analytics-end">{copy.endDate}</Label>
              <Input
                id="analytics-end"
                type="date"
                value={customEnd}
                aria-invalid={Boolean(customError)}
                onChange={(event) => setCustomEnd(event.target.value)}
              />
            </div>
            <Button type="button" onClick={applyCustomRange}>
              {copy.apply}
            </Button>
            {customError ? (
              <p className="gym-analytics-range-error" role="alert">
                {customError}
              </p>
            ) : null}
            {!customError && customPeriod ? (
              <span className="gym-analytics-sample-note">{copy.sampleRange}</span>
            ) : null}
          </div>
        ) : null}
      </div>

      <p className="gym-analytics-notice">{copy.backendNotice}</p>

      <AnalyticsState
        resource={resource}
        loadingLabel={copy.loading}
        emptyLabel={copy.empty}
        errorLabel={copy.error}
      >
        {(snapshot) => {
          const hasPartialData = metricOrder.some((id) => !snapshot.metrics[id]);
          const availableCommercialMetricId = snapshot.metrics[selectedCommercialMetric]
            ? selectedCommercialMetric
            : commercialMetricOrder.find((id) => snapshot.metrics[id]);
          const commercialMetric = availableCommercialMetricId
            ? snapshot.metrics[availableCommercialMetricId]
            : undefined;
          const assignmentMetric = snapshot.metrics.assignments;

          return (
            <div className="gym-analytics-content">
              <div className="gym-analytics-periods">
                <CalendarDays aria-hidden="true" size={17} />
                <span>
                  <strong>{copy.currentPeriod}:</strong>{' '}
                  {formatDateRange(
                    snapshot.currentPeriod.startDate,
                    snapshot.currentPeriod.endDate,
                    locale,
                  )}
                </span>
                <span>
                  <strong>{copy.previousPeriod}:</strong>{' '}
                  {formatDateRange(
                    snapshot.previousPeriod.startDate,
                    snapshot.previousPeriod.endDate,
                    locale,
                  )}
                </span>
                <small>{copy.timezone}</small>
              </div>

              {hasPartialData ? (
                <p className="gym-analytics-partial" role="status">
                  {copy.partial}
                </p>
              ) : null}

              <section className="gym-analytics-metrics" aria-label={copy.pageTitle}>
                {metricOrder.map((id) => {
                  const metricValue = snapshot.metrics[id];
                  const Icon = metricIcons[id];
                  return (
                    <article key={id} className="gym-analytics-metric">
                      <div className="gym-analytics-metric__label">
                        <Icon aria-hidden="true" size={16} />
                        <span>{copy[id]}</span>
                      </div>
                      {metricValue ? (
                        <>
                          <strong>
                            {formatMetricValue(metricValue, metricValue.currentValue, locale)}
                          </strong>
                          <dl>
                            <div>
                              <dt>{copy.previous}</dt>
                              <dd>
                                {formatMetricValue(metricValue, metricValue.previousValue, locale)}
                              </dd>
                            </div>
                            <div>
                              <dt>{copy.absoluteChange}</dt>
                              <dd>
                                {formatSignedMetricValue(
                                  metricValue,
                                  metricValue.absoluteDelta,
                                  locale,
                                )}
                              </dd>
                            </div>
                            <div>
                              <dt>{copy.percentageChange}</dt>
                              <dd>
                                {metricValue.percentageDelta === null
                                  ? copy.comparisonUnavailable
                                  : `${formatSigned(metricValue.percentageDelta, locale)}%`}
                              </dd>
                            </div>
                          </dl>
                        </>
                      ) : (
                        <span className="gym-analytics-unavailable">{copy.unavailable}</span>
                      )}
                    </article>
                  );
                })}
              </section>

              <WorkspacePanel className="gym-analytics-panel">
                <div className="gym-analytics-panel__header">
                  <h2>{copy.commercialTrend}</h2>
                  <div
                    className="gym-analytics-chart-tabs"
                    role="group"
                    aria-label={copy.commercialTrend}
                  >
                    {commercialMetricOrder.map((id) => (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={availableCommercialMetricId === id}
                        className={availableCommercialMetricId === id ? 'is-selected' : undefined}
                        disabled={!snapshot.metrics[id]}
                        onClick={() => setSelectedCommercialMetric(id)}
                      >
                        {copy[id]}
                      </button>
                    ))}
                  </div>
                </div>
                {commercialMetric ? (
                  <AnalyticsTrendChart
                    metric={commercialMetric}
                    copy={copy}
                    formatValue={(value) => formatMetricValue(commercialMetric, value, locale)}
                  />
                ) : (
                  <p className="gym-analytics-inline-empty">{copy.unavailable}</p>
                )}
              </WorkspacePanel>

              <div className="gym-analytics-lower-grid">
                <WorkspacePanel className="gym-analytics-panel">
                  <div className="gym-analytics-panel__header">
                    <h2>{copy.assignmentTrend}</h2>
                  </div>
                  {assignmentMetric ? (
                    <AnalyticsTrendChart
                      metric={assignmentMetric}
                      copy={copy}
                      formatValue={(value) => new Intl.NumberFormat(locale).format(value)}
                    />
                  ) : (
                    <p className="gym-analytics-inline-empty">{copy.unavailable}</p>
                  )}
                </WorkspacePanel>

                <WorkspacePanel className="gym-analytics-panel">
                  <div className="gym-analytics-panel__header">
                    <div>
                      <h2>{copy.activityByTrainer}</h2>
                      <span>{copy.completedAppointmentsOnly}</span>
                    </div>
                    <Badge variant="neutral">{copy.trainerActivity}</Badge>
                  </div>
                  <TableContainer className="gym-analytics-table-shell">
                    <Table aria-label={copy.activityByTrainer} className="gym-analytics-table">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{copy.trainer}</TableHead>
                          <TableHead className="is-number">{copy.completedAppointments}</TableHead>
                          <TableHead className="is-number">{copy.previous}</TableHead>
                          <TableHead className="is-number">{copy.change}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {snapshot.trainerActivity.map((row) => (
                          <TableRow key={row.trainerId}>
                            <TableCell data-label={copy.trainer}>
                              <strong>{row.trainerName}</strong>
                            </TableCell>
                            <TableCell
                              data-label={copy.completedAppointments}
                              className="is-number"
                            >
                              {new Intl.NumberFormat(locale).format(row.completedAppointments)}
                            </TableCell>
                            <TableCell data-label={copy.previous} className="is-number">
                              {new Intl.NumberFormat(locale).format(
                                row.previousCompletedAppointments,
                              )}
                            </TableCell>
                            <TableCell data-label={copy.change} className="is-number">
                              {formatSigned(row.absoluteDelta, locale)} ·{' '}
                              {row.percentageDelta === null
                                ? copy.comparisonUnavailable
                                : `${formatSigned(row.percentageDelta, locale)}%`}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </WorkspacePanel>
              </div>
            </div>
          );
        }}
      </AnalyticsState>
    </WorkspacePage>
  );
}
