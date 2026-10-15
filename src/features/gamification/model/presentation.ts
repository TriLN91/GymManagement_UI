import type { BadgeTarget, ScheduledDayStatus } from '../api/types';

/** ISO weekdays as the backend expects them: 1 = Monday … 7 = Sunday. */
export const ISO_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7] as const;

/** Business dates are UTC+7 calendar dates (yyyy-MM-dd); never re-bucket them in the browser timezone. */
export function parseBusinessDate(value: string): { year: number; month: number; day: number } {
  const [year, month, day] = value.split('-').map(Number);
  return { year: year ?? 0, month: month ?? 0, day: day ?? 0 };
}

export function isoWeekdayOf(value: string): number {
  const { year, month, day } = parseBusinessDate(value);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return weekday === 0 ? 7 : weekday;
}

export function formatBusinessDate(value: string, locale: string): string {
  const { year, month, day } = parseBusinessDate(value);
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function toggleWeekday(selected: ReadonlyArray<number>, weekday: number): number[] {
  return selected.includes(weekday)
    ? selected.filter((x) => x !== weekday)
    : [...selected, weekday].sort((a, b) => a - b);
}

export function sameWeekdays(a: ReadonlyArray<number>, b: ReadonlyArray<number>): boolean {
  return (
    a.length === b.length && [...a].sort().every((value, index) => value === [...b].sort()[index])
  );
}

const STATUS_CLASS: Record<ScheduledDayStatus, string> = {
  NoPlan: 'is-no-plan',
  Rest: 'is-rest',
  Paused: 'is-paused',
  Completed: 'is-completed',
  Missed: 'is-missed',
  Pending: 'is-pending',
  Upcoming: 'is-upcoming',
};

export function dayStatusClass(status: ScheduledDayStatus): string {
  return STATUS_CLASS[status];
}

export function targetPercent(target: BadgeTarget): number {
  if (target.threshold <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((target.current / target.threshold) * 100)));
}

/** Highest-priority next target per badge code (smallest remaining gap), so the list stays short. */
export function nextTargetsByCode(targets: ReadonlyArray<BadgeTarget>): BadgeTarget[] {
  const byCode = new Map<string, BadgeTarget>();
  for (const target of targets) {
    const current = byCode.get(target.code);
    if (!current || target.threshold < current.threshold) byCode.set(target.code, target);
  }
  return [...byCode.values()];
}
