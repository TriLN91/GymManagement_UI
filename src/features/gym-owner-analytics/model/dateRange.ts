import type { AnalyticsPeriod } from './types';

export interface CustomRangeValidation {
  valid: boolean;
  reason?: 'required' | 'order';
}

const DAY_IN_MS = 86_400_000;

function parseDateOnly(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  const time = Date.UTC(year, month - 1, day);
  const parsed = new Date(time);
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }
  return time;
}

function formatDateOnly(time: number) {
  return new Date(time).toISOString().slice(0, 10);
}

export function validateCustomRange(startDate: string, endDate: string): CustomRangeValidation {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (start === null || end === null) return { valid: false, reason: 'required' };
  if (start > end) return { valid: false, reason: 'order' };
  return { valid: true };
}

export function createPeriodPair(startDate: string, endDate: string) {
  const validation = validateCustomRange(startDate, endDate);
  if (!validation.valid) return null;

  const start = parseDateOnly(startDate)!;
  const end = parseDateOnly(endDate)!;
  const inclusiveDays = Math.round((end - start) / DAY_IN_MS) + 1;
  const previousEnd = start - DAY_IN_MS;
  const previousStart = previousEnd - (inclusiveDays - 1) * DAY_IN_MS;

  const currentPeriod: AnalyticsPeriod = {
    startDate,
    endDate,
    timezone: 'Asia/Bangkok',
  };
  const previousPeriod: AnalyticsPeriod = {
    startDate: formatDateOnly(previousStart),
    endDate: formatDateOnly(previousEnd),
    timezone: 'Asia/Bangkok',
  };

  return { currentPeriod, previousPeriod };
}
