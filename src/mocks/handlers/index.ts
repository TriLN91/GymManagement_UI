import { http, HttpResponse } from 'msw';

import { sampleCoachingPlan } from './coaching';

import type { AuthSession, AuthUser } from '@/entities/user';
import { ENDPOINTS } from '@/shared/api/endpoints';

// FR-IAM-02: 4 roles, one demo account each.
const DEMO_PASSWORD = 'Password1!';

const users: Record<string, AuthUser> = {
  member: {
    id: 'u-member',
    email: 'member@demo.gym',
    fullName: 'Maya Member',
    roles: ['member'],
    tenantId: 't-001',
  },
  pt: {
    id: 'u-pt',
    email: 'pt@demo.gym',
    fullName: 'Paolo Trainer',
    roles: ['pt'],
    tenantId: 't-001',
  },
  admin: {
    id: 'u-admin',
    email: 'admin@demo.gym',
    fullName: 'Anna Admin',
    roles: ['gym_admin'],
    tenantId: 't-001',
  },
  super: {
    id: 'u-super',
    email: 'super@demo.gym',
    fullName: 'Sam Super',
    roles: ['super_admin'],
    tenantId: 't-platform',
  },
};

function buildSession(user: AuthUser): AuthSession {
  return {
    user,
    tokens: {
      accessToken: `mock-access-${user.id}`,
      refreshToken: `mock-refresh-${user.id}`,
      expiresIn: 900,
    },
  };
}

// Wildcard patterns so MSW intercepts regardless of baseURL (cross-origin dev server).
const path = (p: string) => `*${p}`;

export const handlers = [
  http.post(path(ENDPOINTS.auth.login), async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email ?? '';
    const password = body.password ?? '';
    if (password !== DEMO_PASSWORD) {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    const user = Object.values(users).find((u) => u.email === email);
    if (!user) return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    return HttpResponse.json({ data: buildSession(user) });
  }),

  http.post(path(ENDPOINTS.auth.register), async ({ request }) => {
    const body = (await request.json()) as { email?: string; fullName?: string };
    const user: AuthUser = {
      id: `u-${Date.now()}`,
      email: body.email ?? '',
      fullName: body.fullName ?? '',
      roles: ['member'],
      tenantId: 't-001',
    };
    return HttpResponse.json({ data: buildSession(user) }, { status: 201 });
  }),

  http.post(path(ENDPOINTS.auth.logout), () => HttpResponse.json({ data: null })),

  http.post(path(ENDPOINTS.auth.refresh), () => {
    const user = users.member as AuthUser;
    return HttpResponse.json({ data: buildSession(user) });
  }),

  http.get(path(ENDPOINTS.auth.me), () => HttpResponse.json({ data: users.member as AuthUser })),

  http.post(path(ENDPOINTS.auth.forgotPassword), () => HttpResponse.json({ data: null })),
  http.post(path(ENDPOINTS.auth.resetPassword), () => HttpResponse.json({ data: null })),

  http.get(path(ENDPOINTS.coaching.plan), () => HttpResponse.json({ data: sampleCoachingPlan })),

  http.post(path(ENDPOINTS.coaching.checkin), async ({ request }) => {
    const payload = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ data: { id: 'checkin-001', ...payload } }, { status: 201 });
  }),
];
