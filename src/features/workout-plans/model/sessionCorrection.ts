import type { SessionView } from '../api/types';

/** The backend lets a session be corrected only on the business day (UTC+7) it was recorded. */
export function canCorrect(session: SessionView, now = new Date()): boolean {
  const day = (iso: string) =>
    new Date(new Date(iso).getTime() + 7 * 3_600_000).toISOString().slice(0, 10);
  return day(session.completedAtUtc ?? session.scheduledAtUtc) === day(now.toISOString());
}
