import type { CompletedWorkoutSession } from '@/features/workout-plans/model/workoutFlowTypes';

const DAY_MS = 86_400_000;

function localDay(value: string | Date): number {
  const date = typeof value === 'string' ? new Date(value) : value;
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(value: Date): number {
  const date = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const mondayOffset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - mondayOffset);
  return localDay(date);
}

function currentActivityStreak(completedAt: ReadonlyArray<string>, now: Date): number {
  const days = [...new Set(completedAt.map(localDay))].sort((a, b) => b - a);
  const latest = days[0];
  if (latest === undefined || localDay(now) - latest > DAY_MS) return 0;

  let streak = 1;
  for (let index = 1; index < days.length; index += 1) {
    const laterDay = days[index - 1];
    const earlierDay = days[index];
    if (laterDay === undefined || earlierDay === undefined || laterDay - earlierDay !== DAY_MS) {
      break;
    }
    streak += 1;
  }
  return streak;
}

function longestActivityStreak(completedAt: ReadonlyArray<string>): number {
  const days = [...new Set(completedAt.map(localDay))].sort((a, b) => a - b);
  let longest = 0;
  let current = 0;
  days.forEach((day, index) => {
    const previous = days[index - 1];
    current = previous !== undefined && day - previous === DAY_MS ? current + 1 : 1;
    longest = Math.max(longest, current);
  });
  return longest;
}

function bestPeriodCount(
  sessions: ReadonlyArray<CompletedWorkoutSession>,
  key: (date: Date) => string,
): number {
  const counts = new Map<string, number>();
  sessions.forEach((session) => {
    const period = key(new Date(session.completedAt));
    counts.set(period, (counts.get(period) ?? 0) + 1);
  });
  return Math.max(0, ...counts.values());
}

function personalBestStats(sessions: ReadonlyArray<CompletedWorkoutSession>) {
  const bestByExercise = new Map<string, number>();
  let recordBreaks = 0;
  let highestLoadKg = 0;

  [...sessions]
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
    .forEach((session) => {
      Object.entries(session.logs).forEach(([exerciseId, log]) => {
        if (log.trackingType !== 'strength') return;
        const sessionBest = Math.max(
          0,
          ...log.sets.filter((set) => set.completed).map((set) => set.loadKg),
        );
        if (sessionBest <= 0) return;
        const previous = bestByExercise.get(exerciseId);
        if (previous !== undefined && sessionBest > previous) recordBreaks += 1;
        bestByExercise.set(exerciseId, Math.max(previous ?? 0, sessionBest));
        highestLoadKg = Math.max(highestLoadKg, sessionBest);
      });
    });

  return { recordBreaks, highestLoadKg };
}

export interface AchievementProgress {
  totalSessions: number;
  totalVolumeKg: number;
  currentStreak: number;
  longestStreak: number;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
  sessionsThisYear: number;
  activeMonths: number;
  bestWeekSessions: number;
  bestMonthSessions: number;
  bestYearSessions: number;
  recordBreaks: number;
  highestLoadKg: number;
}

export function calculateAchievementProgress(
  sessions: ReadonlyArray<CompletedWorkoutSession>,
  now = new Date(),
): AchievementProgress {
  const weekStart = startOfWeek(now);
  const monthStart = localDay(new Date(now.getFullYear(), now.getMonth(), 1));
  const yearStart = localDay(new Date(now.getFullYear(), 0, 1));
  const activeMonths = new Set(
    sessions.map((session) => {
      const date = new Date(session.completedAt);
      return `${date.getFullYear()}-${date.getMonth()}`;
    }),
  ).size;
  const { recordBreaks, highestLoadKg } = personalBestStats(sessions);

  return {
    totalSessions: sessions.length,
    totalVolumeKg: sessions.reduce((total, session) => total + session.totals.totalVolumeKg, 0),
    currentStreak: currentActivityStreak(
      sessions.map((session) => session.completedAt),
      now,
    ),
    longestStreak: longestActivityStreak(sessions.map((session) => session.completedAt)),
    sessionsThisWeek: sessions.filter((session) => localDay(session.completedAt) >= weekStart)
      .length,
    sessionsThisMonth: sessions.filter((session) => localDay(session.completedAt) >= monthStart)
      .length,
    sessionsThisYear: sessions.filter((session) => localDay(session.completedAt) >= yearStart)
      .length,
    activeMonths,
    bestWeekSessions: bestPeriodCount(sessions, (date) => {
      const weekDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const mondayOffset = (weekDate.getDay() + 6) % 7;
      weekDate.setDate(weekDate.getDate() - mondayOffset);
      return `${weekDate.getFullYear()}-${weekDate.getMonth()}-${weekDate.getDate()}`;
    }),
    bestMonthSessions: bestPeriodCount(
      sessions,
      (date) => `${date.getFullYear()}-${date.getMonth()}`,
    ),
    bestYearSessions: bestPeriodCount(sessions, (date) => `${date.getFullYear()}`),
    recordBreaks,
    highestLoadKg,
  };
}
