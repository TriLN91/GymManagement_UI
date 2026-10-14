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

export const fitnessHandlers = [
  http.put(path(ENDPOINTS.coaching.me.goal), echo()),
  http.put(path(ENDPOINTS.coaching.me.trainingProfile), echo()),
  http.put(path(ENDPOINTS.coaching.me.nutritionProfile), echo()),
  http.post(path(ENDPOINTS.coaching.me.bodyCheckins), echo(201)),
];
