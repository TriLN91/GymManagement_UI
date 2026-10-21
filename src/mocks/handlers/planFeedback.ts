import { http, HttpResponse } from 'msw';

import type { PlanFeedbackDto } from '@/features/appointments/api/types';
import { ENDPOINTS } from '@/shared/api/endpoints';

// In-memory feedback between the demo Member and Trainer of src/mocks/handlers/appointments.ts (reset on reload).
const path = (p: string) => `*${p}`;
const F = ENDPOINTS.planFeedback;
const ok = (data: unknown) =>
  HttpResponse.json({ isSuccess: true, message: '200: OK', data }, { status: 200 });
const fail = (status: number, message: string) =>
  HttpResponse.json({ isSuccess: false, message, data: null, errorCode: 'Domain' }, { status });

const feedback: PlanFeedbackDto[] = [];
let sequence = 0;

export const planFeedbackHandlers = [
  http.get(path(F.mine), () => ok([...feedback].reverse())),
  http.get(path(F.received), () => ok([...feedback].reverse())),

  http.post(
    path('/coaching/assignments/:assignmentId/plan-feedback'),
    async ({ params, request }) => {
      const body = (await request.json()) as Pick<PlanFeedbackDto, 'kind' | 'domain' | 'message'>;
      if (body.message.trim().length < 3) return fail(400, 'Nội dung quá ngắn.');
      const created: PlanFeedbackDto = {
        id: `feedback-${++sequence}`,
        assignmentId: String(params.assignmentId),
        memberProfileId: 'mp-demo',
        memberName: 'Maya Member',
        trainerProfileId: 'tp-demo',
        trainerName: 'Paolo Trainer',
        kind: body.kind,
        domain: body.domain,
        message: body.message.trim(),
        trainerReply: null,
        repliedAtUtc: null,
        createdAtUtc: new Date().toISOString(),
      };
      feedback.push(created);
      return ok(created);
    },
  ),

  http.post(path('/coaching/plan-feedback/:id/reply'), async ({ params, request }) => {
    const found = feedback.find((f) => f.id === params.id);
    if (!found) return fail(404, '404: Không tìm thấy');
    if (found.repliedAtUtc) return fail(409, 'Phản hồi này đã được trả lời.');
    const body = (await request.json()) as { reply: string };
    found.trainerReply = body.reply.trim();
    found.repliedAtUtc = new Date().toISOString();
    return ok(found);
  }),
];
