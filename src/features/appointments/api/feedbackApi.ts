import type { CreateFeedbackBody, PlanFeedbackDto } from './types';

import { apiGet, apiPost } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

const F = ENDPOINTS.planFeedback;

export const feedbackApi = {
  create: (assignmentId: string, body: CreateFeedbackBody) =>
    apiPost<PlanFeedbackDto>(F.create(assignmentId), body),
  listMine: () => apiGet<PlanFeedbackDto[]>(F.mine),
  listReceived: () => apiGet<PlanFeedbackDto[]>(F.received),
  reply: (id: string, reply: string) => apiPost<PlanFeedbackDto>(F.reply(id), { reply }),
};
