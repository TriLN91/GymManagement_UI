import { expect, it } from 'vitest';

import type { SessionView } from '../api/types';

import { canCorrect } from './sessionCorrection';

const session = (completedAtUtc: string): SessionView => ({
  id: 's',
  revision: 1,
  workoutPlanVersionId: null,
  status: 'Completed',
  scheduledAtUtc: completedAtUtc,
  completedAtUtc,
  notes: null,
  exercises: [],
});

it('allows a correction on the business day (UTC+7) the workout was recorded', () => {
  // 20:00 UTC on the 20th is 03:00 on the 21st in Vietnam.
  expect(canCorrect(session('2026-10-20T20:00:00Z'), new Date('2026-10-21T10:00:00Z'))).toBe(true);
});

it('closes the window once the Vietnam calendar day changes', () => {
  expect(canCorrect(session('2026-10-20T10:00:00Z'), new Date('2026-10-20T18:30:00Z'))).toBe(false);
});
