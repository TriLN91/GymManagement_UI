export type AnalyticsRangeKey = '7d' | '30d' | '90d' | 'custom';

export type AnalyticsMetricId = 'sales' | 'views' | 'purchases' | 'assignments' | 'trainerActivity';

export interface AnalyticsPeriod {
  startDate: string;
  endDate: string;
  timezone: 'Asia/Bangkok';
}

export interface AnalyticsSeriesPoint {
  date: string;
  value: number;
}

export interface BackendAnalyticsMetric {
  id: AnalyticsMetricId;
  unit: 'vnd' | 'count';
  currentValue: number;
  previousValue: number;
  absoluteDelta: number;
  percentageDelta: number | null;
  currentSeries: ReadonlyArray<AnalyticsSeriesPoint>;
  previousSeries: ReadonlyArray<AnalyticsSeriesPoint>;
  source: 'backend';
}

export interface BackendTrainerActivityRow {
  trainerId: string;
  trainerName: string;
  completedAppointments: number;
  previousCompletedAppointments: number;
  absoluteDelta: number;
  percentageDelta: number | null;
  source: 'backend';
}

export interface GymOwnerAnalyticsSnapshot {
  range: AnalyticsRangeKey;
  currentPeriod: AnalyticsPeriod;
  previousPeriod: AnalyticsPeriod;
  metrics: Partial<Record<AnalyticsMetricId, BackendAnalyticsMetric>>;
  trainerActivity: ReadonlyArray<BackendTrainerActivityRow>;
  generatedAt: string;
}

export type AnalyticsDataState<T> =
  | { state: 'loading' }
  | { state: 'loaded'; data: T }
  | { state: 'empty' }
  | { state: 'error'; message?: string };
