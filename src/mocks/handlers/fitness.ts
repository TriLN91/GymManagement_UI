import { http, HttpResponse } from 'msw';

import { ENDPOINTS } from '@/shared/api/endpoints';

// Accepts the CF01 profile writes so the profile wizard works offline. Echoes the body like the backend views do.
const path = (p: string) => `*${p}`;

const echo =
  (status = 200) =>
  async ({ request }: { request: Request }) =>
    HttpResponse.json(
      { isSuccess: true, message: `${status}: OK`, data: (await request.json()) as unknown },
      { status },
    );

const mockProgressionState = {
  stateVersion: 'v1',
  businessDate: '2026-10-08',
  timeZone: 'Asia/Ho_Chi_Minh',
  ruleVersion: 'cf05-v1',
  streak: { current: 4, best: 9, scheduleConfigured: true, today: 'Pending' },
  xp: { totalConfirmed: 150, pending: [] },
  completedWorkouts: 12,
  distance: {
    totalKm: 15.5,
    primaryProvider: 'Strava',
    availableProviders: ['Strava', 'HealthConnect'],
    sourceSelectionRequired: false,
    quarantinedActivities: 0,
  },
  badges: [],
  nextBadges: [],
  activePause: null,
  days: [
    { day: '2026-10-07', status: 'Completed', expectedDayNumber: 2 },
    { day: '2026-10-08', status: 'Pending', expectedDayNumber: 1 },
  ],
};

const mockProgressionSchedule = {
  configured: true,
  isoWeekdays: [1, 2, 3, 5, 6],
  effectiveFrom: '2026-10-01',
};

export const fitnessHandlers = [
  http.put(path(ENDPOINTS.coaching.me.goal), echo()),
  http.put(path(ENDPOINTS.coaching.me.trainingProfile), echo()),
  http.put(path(ENDPOINTS.coaching.me.nutritionProfile), echo()),
  http.post(path(ENDPOINTS.coaching.me.bodyCheckins), echo(201)),

  // CF05 Progression
  http.get(path(ENDPOINTS.progression.state), () => HttpResponse.json(mockProgressionState)),
  http.get(path(ENDPOINTS.progression.schedule), () => HttpResponse.json(mockProgressionSchedule)),
  http.get(path(ENDPOINTS.progression.history), () =>
    HttpResponse.json({
      from: '2026-09-09',
      to: '2026-10-08',
      summary: {
        fitFlexWorkouts: 3,
        ptSessions: 1,
        externalActivities: 0,
        distanceKm: 0,
        scheduledCompleted: 3,
        scheduledMissed: 1,
        scheduledPaused: 0,
        xpConfirmed: 150,
      },
      items: [],
      days: [],
    }),
  ),
  http.get(path(ENDPOINTS.progression.recovery), () => HttpResponse.json([])),
];
