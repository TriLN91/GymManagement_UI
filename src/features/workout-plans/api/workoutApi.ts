import type { ExerciseView, PlansView, SessionInput, SessionView } from './types';

import { apiGet, apiPost } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

const W = ENDPOINTS.workouts;

export const workoutApi = {
  getPlans: () => apiGet<PlansView>(ENDPOINTS.coaching.me.plans),
  getExercises: () => apiGet<ExerciseView[]>(W.exercises),
  getSessions: (page = 1, pageSize = 50) =>
    apiGet<SessionView[]>(W.sessions, { params: { page, pageSize } }),
  /** Idempotent by clientRequestId: a retry with the same payload returns the stored session. */
  createSession: (input: SessionInput) => apiPost<SessionView, SessionInput>(W.sessions, input),
  /** Idempotent: completing a completed session returns it unchanged. */
  completeSession: (sessionId: string, completedAtUtc: string) =>
    apiPost<SessionView, { completedAtUtc: string }>(W.complete(sessionId), { completedAtUtc }),
};
