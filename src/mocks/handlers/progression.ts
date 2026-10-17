import { http, HttpResponse } from 'msw';

import { MOCK_PLAN_ID, MOCK_VERSION_ID, mockSessions } from './workouts';

import { ENDPOINTS } from '@/shared/api/endpoints';

// Mirrors ProgressionController (CF05). Derived from the in-memory workout sessions of ./workouts.
const path = (p: string) => `*${p}`;

const ok = (data: unknown) =>
  HttpResponse.json({ isSuccess: true, message: '200: OK', data }, { status: 200 });

const BUSINESS_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const businessDate = (at: Date) =>
  new Date(at.getTime() + BUSINESS_OFFSET_MS).toISOString().slice(0, 10);
const addDays = (date: string, days: number) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
const isoWeekday = (date: string) => ((new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7) + 1;

const XP_PER_WORKOUT = 50;

function completedSessions() {
  return mockSessions.filter((session) => session.status === 'Completed' && session.completedAtUtc);
}

function buildDays(today: string) {
  const monday = addDays(today, 1 - isoWeekday(today));
  const completedDates = new Set(
    completedSessions().map((session) => businessDate(new Date(session.completedAtUtc!))),
  );
  return Array.from({ length: 7 }, (_, index) => {
    const day = addDays(monday, index);
    if (completedDates.has(day))
      return { day, status: 'Completed', expectedDayNumber: 1, versionId: MOCK_VERSION_ID };
    if (day === today)
      return { day, status: 'Pending', expectedDayNumber: 1, versionId: MOCK_VERSION_ID };
    if (day === addDays(today, 1))
      return { day, status: 'Upcoming', expectedDayNumber: 2, versionId: MOCK_VERSION_ID };
    return { day, status: 'Rest', expectedDayNumber: null, versionId: null };
  });
}

function state() {
  const today = businessDate(new Date());
  const days = buildDays(today);
  const completed = completedSessions().length;
  return {
    stateVersion: `mock-${completed}`,
    businessDate: today,
    timeZone: 'UTC+7',
    ruleVersion: 'mock',
    streak: {
      current: completed > 0 ? 1 : 0,
      best: completed > 0 ? 1 : 0,
      scheduleConfigured: true,
      today: days.find((item) => item.day === today)?.status ?? null,
    },
    xp: { totalConfirmed: completed * XP_PER_WORKOUT, pending: [] },
    completedWorkouts: completed,
    distance: {
      totalKm: null,
      primaryProvider: null,
      availableProviders: [],
      sourceSelectionRequired: false,
      quarantinedActivities: 0,
    },
    badges: [],
    nextBadges: [
      {
        code: 'first-workout',
        name: 'First workout',
        tier: 'Bronze',
        threshold: 1,
        current: completed,
      },
    ],
    activePause: null,
    days,
  };
}

let recoveryReports: Array<Record<string, unknown>> = [];

export const progressionHandlers = [
  http.get(path(ENDPOINTS.progression.state), () => ok(state())),

  http.get(path(ENDPOINTS.progression.history), () => {
    const today = businessDate(new Date());
    const items = completedSessions().map((session) => ({
      type: 'FitFlexWorkout',
      id: session.id,
      occurredAtUtc: session.completedAtUtc,
      businessDate: businessDate(new Date(session.completedAtUtc!)),
      title: 'Workout',
      durationMinutes: null,
      distanceKm: null,
      planDayNumber: session.planDayNumber,
      isMainSession: session.planDayNumber !== null,
      xpAwarded: XP_PER_WORKOUT,
      provider: null,
      countingNote: '',
    }));
    return ok({
      from: addDays(today, -29),
      to: today,
      summary: {
        fitFlexWorkouts: items.length,
        ptSessions: 0,
        externalActivities: 0,
        distanceKm: 0,
        scheduledCompleted: items.length,
        scheduledMissed: 0,
        scheduledPaused: 0,
        xpConfirmed: items.length * XP_PER_WORKOUT,
      },
      items,
      days: buildDays(today),
    });
  }),

  http.get(path(ENDPOINTS.progression.schedule), () =>
    ok({
      current: {
        id: 'schedule-1',
        workoutPlanId: MOCK_PLAN_ID,
        isoWeekdays: [1, 2, 3, 4, 5, 6, 7],
        effectiveFromDay: '2026-10-01',
        effectiveToDay: null,
      },
      upcoming: null,
      hasActivePlan: true,
      planDayNumbers: [1, 2],
      businessDate: businessDate(new Date()),
    }),
  ),
  http.put(path(ENDPOINTS.progression.schedule), async ({ request }) => {
    const input = (await request.json()) as { isoWeekdays: number[] };
    return ok({
      current: {
        id: 'schedule-1',
        workoutPlanId: MOCK_PLAN_ID,
        isoWeekdays: input.isoWeekdays,
        effectiveFromDay: businessDate(new Date()),
        effectiveToDay: null,
      },
      upcoming: null,
      hasActivePlan: true,
      planDayNumbers: [1, 2],
      businessDate: businessDate(new Date()),
    });
  }),

  http.post(path('/progression/me/badges/:awardId/seen'), () => ok({})),
  http.put(path(ENDPOINTS.progression.primaryDistanceSource), () => ok(state().distance)),
  http.get(path(ENDPOINTS.progression.recovery), () => ok(recoveryReports)),
  http.post(path(ENDPOINTS.progression.recovery), async ({ request }) => {
    const input = (await request.json()) as Record<string, unknown>;
    const report = {
      id: `recovery-${recoveryReports.length + 1}`,
      businessDate: businessDate(new Date()),
      reportedAtUtc: new Date().toISOString(),
      revision: 1,
      editable: true,
      ...input,
    };
    recoveryReports = [report, ...recoveryReports];
    return ok(report);
  }),
  http.post(path(ENDPOINTS.progression.pause), async ({ request }) => {
    const input = (await request.json()) as {
      recoveryReportId: string | null;
      reason: string | null;
    };
    return ok({
      id: 'pause-1',
      startDay: businessDate(new Date()),
      endDay: null,
      recoveryReportId: input.recoveryReportId,
      reason: input.reason,
      resumeProposedAtUtc: null,
      resumeProposalNote: null,
    });
  }),
  http.post(path(ENDPOINTS.progression.resume), () =>
    ok({
      id: 'pause-1',
      startDay: businessDate(new Date()),
      endDay: businessDate(new Date()),
      recoveryReportId: null,
      reason: null,
      resumeProposedAtUtc: null,
      resumeProposalNote: null,
    }),
  ),
];
