import { http, HttpResponse } from 'msw';

import { authHandlers } from './auth';
import { sampleCoachingPlan } from './coaching';
import { fitnessHandlers } from './fitness';

import { ENDPOINTS } from '@/shared/api/endpoints';

// Wildcard patterns so MSW intercepts regardless of baseURL (cross-origin dev server).
const path = (p: string) => `*${p}`;

export const handlers = [
  ...authHandlers,
  ...fitnessHandlers,

  http.get(path(ENDPOINTS.coaching.plan), () => HttpResponse.json({ data: sampleCoachingPlan })),

  http.post(path(ENDPOINTS.coaching.checkin), async ({ request }) => {
    const payload = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ data: { id: 'checkin-001', ...payload } }, { status: 201 });
  }),
];
