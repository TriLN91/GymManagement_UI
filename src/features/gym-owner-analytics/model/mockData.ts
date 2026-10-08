import type {
  AnalyticsDataState,
  AnalyticsMetricId,
  AnalyticsRangeKey,
  BackendAnalyticsMetric,
  BackendTrainerActivityRow,
  GymOwnerAnalyticsSnapshot,
} from './types';

const metric = (
  id: AnalyticsMetricId,
  unit: BackendAnalyticsMetric['unit'],
  currentValue: number,
  previousValue: number,
  absoluteDelta: number,
  percentageDelta: number | null,
  currentValues: ReadonlyArray<number>,
  previousValues: ReadonlyArray<number>,
  currentDates: ReadonlyArray<string>,
  previousDates: ReadonlyArray<string>,
): BackendAnalyticsMetric => ({
  id,
  unit,
  currentValue,
  previousValue,
  absoluteDelta,
  percentageDelta,
  currentSeries: currentValues.map((value, index) => ({ date: currentDates[index]!, value })),
  previousSeries: previousValues.map((value, index) => ({ date: previousDates[index]!, value })),
  source: 'backend',
});

const activity = (
  trainerId: string,
  trainerName: string,
  completedAppointments: number,
  previousCompletedAppointments: number,
  absoluteDelta: number,
  percentageDelta: number | null,
): BackendTrainerActivityRow => ({
  trainerId,
  trainerName,
  completedAppointments,
  previousCompletedAppointments,
  absoluteDelta,
  percentageDelta,
  source: 'backend',
});

const periods = {
  '7d': {
    current: [
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
      '2026-10-05',
    ],
    previous: [
      '2026-09-22',
      '2026-09-23',
      '2026-09-24',
      '2026-09-25',
      '2026-09-26',
      '2026-09-27',
      '2026-09-28',
    ],
  },
  '30d': {
    current: [
      '2026-09-06',
      '2026-09-11',
      '2026-09-16',
      '2026-09-21',
      '2026-09-26',
      '2026-10-01',
      '2026-10-05',
    ],
    previous: [
      '2026-08-07',
      '2026-08-12',
      '2026-08-17',
      '2026-08-22',
      '2026-08-27',
      '2026-09-01',
      '2026-09-05',
    ],
  },
  '90d': {
    current: [
      '2026-07-08',
      '2026-07-23',
      '2026-08-07',
      '2026-08-22',
      '2026-09-06',
      '2026-09-21',
      '2026-10-05',
    ],
    previous: [
      '2026-04-09',
      '2026-04-24',
      '2026-05-09',
      '2026-05-24',
      '2026-06-08',
      '2026-06-23',
      '2026-07-07',
    ],
  },
} as const;

function buildSnapshot(range: Exclude<AnalyticsRangeKey, 'custom'>): GymOwnerAnalyticsSnapshot {
  const dates = periods[range];
  const scale = range === '7d' ? 1 : range === '30d' ? 4 : 11;
  const metrics: GymOwnerAnalyticsSnapshot['metrics'] = {
    sales: metric(
      'sales',
      'vnd',
      48_600_000 * scale,
      43_200_000 * scale,
      5_400_000 * scale,
      12.5,
      [5.8, 6.3, 7.1, 6.6, 7.9, 7.2, 7.7].map((value) => value * 1_000_000 * scale),
      [5.1, 6, 5.8, 6.5, 6.3, 6.8, 6.7].map((value) => value * 1_000_000 * scale),
      dates.current,
      dates.previous,
    ),
    views: metric(
      'views',
      'count',
      1840 * scale,
      1650 * scale,
      190 * scale,
      11.5,
      [210, 235, 248, 271, 286, 279, 311].map((value) => value * scale),
      [205, 214, 231, 245, 249, 252, 254].map((value) => value * scale),
      dates.current,
      dates.previous,
    ),
    purchases: metric(
      'purchases',
      'count',
      62 * scale,
      58 * scale,
      4 * scale,
      6.9,
      [7, 8, 9, 8, 11, 9, 10].map((value) => value * scale),
      [8, 7, 8, 9, 8, 9, 9].map((value) => value * scale),
      dates.current,
      dates.previous,
    ),
    assignments: metric(
      'assignments',
      'count',
      18 * scale,
      15 * scale,
      3 * scale,
      20,
      [2, 3, 2, 4, 3, 2, 2].map((value) => value * scale),
      [2, 2, 3, 2, 2, 2, 2].map((value) => value * scale),
      dates.current,
      dates.previous,
    ),
    trainerActivity: metric(
      'trainerActivity',
      'count',
      96 * scale,
      88 * scale,
      8 * scale,
      9.1,
      [12, 13, 14, 13, 15, 14, 15].map((value) => value * scale),
      [11, 12, 12, 13, 13, 13, 14].map((value) => value * scale),
      dates.current,
      dates.previous,
    ),
  };

  // The 90-day mock intentionally represents a partial backend response.
  if (range === '90d') delete metrics.views;

  const endDate = '2026-10-05';
  const startDate = range === '7d' ? '2026-09-29' : range === '30d' ? '2026-09-06' : '2026-07-08';
  const previousStart =
    range === '7d' ? '2026-09-22' : range === '30d' ? '2026-08-07' : '2026-04-09';
  const previousEnd = range === '7d' ? '2026-09-28' : range === '30d' ? '2026-09-05' : '2026-07-07';

  return {
    range,
    currentPeriod: { startDate, endDate, timezone: 'Asia/Bangkok' },
    previousPeriod: {
      startDate: previousStart,
      endDate: previousEnd,
      timezone: 'Asia/Bangkok',
    },
    metrics,
    trainerActivity: [
      activity('trainer-01', 'An Nguyễn', 31 * scale, 28 * scale, 3 * scale, 10.7),
      activity('trainer-02', 'Bình Trần', 24 * scale, 25 * scale, -1 * scale, -4),
      activity('trainer-03', 'Minh Lê', 22 * scale, 18 * scale, 4 * scale, 22.2),
      activity('trainer-04', 'Vy Phạm', 19 * scale, 17 * scale, 2 * scale, 11.8),
    ],
    generatedAt: '2026-10-05T09:30:00+07:00',
  };
}

export const analyticsPresetResources: Record<
  Exclude<AnalyticsRangeKey, 'custom'>,
  AnalyticsDataState<GymOwnerAnalyticsSnapshot>
> = {
  '7d': { state: 'loaded', data: buildSnapshot('7d') },
  '30d': { state: 'loaded', data: buildSnapshot('30d') },
  '90d': { state: 'loaded', data: buildSnapshot('90d') },
};

export function getCustomAnalyticsResource(
  startDate: string,
  endDate: string,
): AnalyticsDataState<GymOwnerAnalyticsSnapshot> {
  if (startDate !== '2026-09-01' || endDate !== '2026-09-15') return { state: 'empty' };

  const base = buildSnapshot('30d');
  return {
    state: 'loaded',
    data: {
      ...base,
      range: 'custom',
      currentPeriod: { startDate, endDate, timezone: 'Asia/Bangkok' },
      previousPeriod: {
        startDate: '2026-08-17',
        endDate: '2026-08-31',
        timezone: 'Asia/Bangkok',
      },
    },
  };
}
