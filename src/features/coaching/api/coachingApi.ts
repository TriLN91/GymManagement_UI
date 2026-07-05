import type { CheckIn, CheckInPayload, CoachingPlan } from '@/entities/plan';
import { apiGet, apiPost } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const coachingApi = {
  getCurrentPlan: () => apiGet<CoachingPlan>(ENDPOINTS.coaching.plan),
  getHistory: (memberId: string) =>
    apiGet<CoachingPlan[]>(ENDPOINTS.coaching.planHistory(memberId)),
  submitCheckIn: (payload: CheckInPayload) =>
    apiPost<CheckIn, CheckInPayload>(ENDPOINTS.coaching.checkin, payload),
  sendFeedback: (message: string) =>
    apiPost<{ reply: string }, { message: string }>(ENDPOINTS.coaching.feedback, { message }),
};