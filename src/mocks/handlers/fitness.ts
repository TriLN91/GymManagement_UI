import { http, HttpResponse } from 'msw';

import { ENDPOINTS } from '@/shared/api/endpoints';

// Stateful stand-in for the CF01 profile endpoints so the profile wizard works offline: writes are
// remembered (until the page reloads) and read back by GET me/profile and GET me/body-checkins,
// like the backend does. Shapes follow ProfileView / BodyView.
const path = (p: string) => `*${p}`;

interface MockProfileState {
  goal: Record<string, unknown> | null;
  training: Record<string, unknown> | null;
  nutrition: Record<string, unknown> | null;
  body: Array<Record<string, unknown>>;
}

const state: MockProfileState = { goal: null, training: null, nutrition: null, body: [] };

const ok = (data: unknown, status = 200) =>
  HttpResponse.json({ isSuccess: true, message: `${status}: OK`, data }, { status });

const save =
  (key: 'goal' | 'training' | 'nutrition') =>
  async ({ request }: { request: Request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    state[key] = body;
    return ok(body);
  };

export const fitnessHandlers = [
  http.put(path(ENDPOINTS.coaching.me.goal), save('goal')),
  http.put(path(ENDPOINTS.coaching.me.trainingProfile), save('training')),
  http.put(path(ENDPOINTS.coaching.me.nutritionProfile), save('nutrition')),
  http.post(path(ENDPOINTS.coaching.me.bodyCheckins), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    state.body.unshift({ id: crypto.randomUUID(), ...body });
    return ok(body, 201);
  }),

  http.get(path(ENDPOINTS.coaching.me.profile), () =>
    ok({
      memberProfileId: 'mp-demo',
      revision: 1,
      goal: state.goal,
      training: state.training,
      nutrition: state.nutrition,
      missingWorkoutInput: [],
      missingNutritionInput: [],
    }),
  ),
  http.get(path(ENDPOINTS.coaching.me.bodyCheckins), ({ request }) => {
    const pageSize = Number(new URL(request.url).searchParams.get('pageSize') ?? 30);
    return ok(state.body.slice(0, pageSize));
  }),
];
