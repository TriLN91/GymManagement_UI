import type {
  ExerciseView,
  PlansView,
  SessionCorrectionBody,
  SessionInput,
  SessionView,
} from './types';

import { apiGet, apiPost, apiPut } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

const W = ENDPOINTS.workouts;

export const workoutApi = {
  getPlans: () => apiGet<PlansView>(ENDPOINTS.coaching.me.plans),
  getExercises: () => apiGet<ExerciseView[]>(W.exercises),
  getSessions: (page = 1, pageSize = 50) =>
    apiGet<SessionView[]>(W.sessions, { params: { page, pageSize } }),
  /** Idempotent by clientRequestId: a retry with the same payload returns the stored session. */
  createSession: (input: SessionInput) => apiPost<SessionView, SessionInput>(W.sessions, input),
  /** Fixes the logs of a session. Only allowed on the day it was recorded (UTC+7): later it is 409 `CorrectionWindowClosed`. */
  correctSession: (sessionId: string, body: SessionCorrectionBody) =>
    apiPut<SessionView, SessionCorrectionBody>(ENDPOINTS.workouts.session(sessionId), body),
  /** Idempotent: completing a completed session returns it unchanged. */
  completeSession: (sessionId: string, completedAtUtc: string) =>
    apiPost<SessionView, { completedAtUtc: string }>(W.complete(sessionId), { completedAtUtc }),
};
