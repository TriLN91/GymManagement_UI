import { http, HttpResponse } from 'msw';

import { sampleCoachingPlan } from './coaching';

import type { AuthSession, AuthUser, EmailOtpChallenge } from '@/entities/user';
import { ENDPOINTS } from '@/shared/api/endpoints';

// FR-IAM-02: 4 roles, one demo account each.
const DEMO_PASSWORD = 'Password1!';
const MOCK_OTP_LENGTH = 6;
const MOCK_OTP_EXPIRY_MS = 10 * 60_000;
const MOCK_OTP_RESEND_MS = 30_000;
const MOCK_OTP_ATTEMPTS = 5;

interface MockOtpChallengeRecord extends EmailOtpChallenge {
  email: string;
}

const otpChallenges = new Map<string, MockOtpChallengeRecord>();

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

function maskEmail(email: string) {
  const [local = '', domain = ''] = email.split('@');
  const visible = local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(local.length - visible.length, 3))}@${domain}`;
}

function createOtpChallenge(email: string): EmailOtpChallenge {
  const now = Date.now();
  const challenge: MockOtpChallengeRecord = {
    challengeId: crypto.randomUUID(),
    email,
    maskedEmail: maskEmail(email),
    requiredFor: 'gym_admin_session',
    policy: {
      codeLength: MOCK_OTP_LENGTH,
      expiresAt: new Date(now + MOCK_OTP_EXPIRY_MS).toISOString(),
      resendAvailableAt: new Date(now + MOCK_OTP_RESEND_MS).toISOString(),
      attemptsRemaining: MOCK_OTP_ATTEMPTS,
    },
  };
  otpChallenges.set(challenge.challengeId, challenge);
  return {
    challengeId: challenge.challengeId,
    maskedEmail: challenge.maskedEmail,
    requiredFor: challenge.requiredFor,
    policy: challenge.policy,
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
    if (user.roles.includes('gym_admin')) {
      return HttpResponse.json({ data: createOtpChallenge(user.email) });
    }
    return HttpResponse.json({ data: buildSession(user) });
  }),

  http.post(path(ENDPOINTS.auth.verifyEmailOtp), async ({ request }) => {
    const body = (await request.json()) as { challengeId?: string; code?: string };
    const challenge = body.challengeId ? otpChallenges.get(body.challengeId) : undefined;
    if (!challenge) {
      return HttpResponse.json(
        { message: 'Verification challenge is unavailable', code: 'OTP_CHALLENGE_NOT_FOUND' },
        { status: 400 },
      );
    }
    if (Date.now() >= Date.parse(challenge.policy.expiresAt)) {
      otpChallenges.delete(challenge.challengeId);
      return HttpResponse.json(
        { message: 'Verification code expired', code: 'OTP_EXPIRED' },
        { status: 400 },
      );
    }
    const isValidShape = new RegExp(`^\\d{${challenge.policy.codeLength}}$`).test(body.code ?? '');
    if (!isValidShape || body.code === '0'.repeat(challenge.policy.codeLength)) {
      challenge.policy.attemptsRemaining = Math.max(0, challenge.policy.attemptsRemaining - 1);
      return HttpResponse.json(
        {
          message: 'Invalid verification code',
          code: 'OTP_INVALID',
          fieldErrors: { code: ['Invalid verification code'] },
        },
        { status: 400 },
      );
    }
    const user = Object.values(users).find((candidate) => candidate.email === challenge.email);
    otpChallenges.delete(challenge.challengeId);
    if (!user) {
      return HttpResponse.json({ message: 'Account unavailable' }, { status: 401 });
    }
    return HttpResponse.json({ data: buildSession(user) });
  }),

  http.post(path(ENDPOINTS.auth.resendEmailOtp), async ({ request }) => {
    const body = (await request.json()) as { challengeId?: string };
    const challenge = body.challengeId ? otpChallenges.get(body.challengeId) : undefined;
    if (!challenge) {
      return HttpResponse.json(
        { message: 'Verification challenge is unavailable', code: 'OTP_CHALLENGE_NOT_FOUND' },
        { status: 400 },
      );
    }
    if (Date.now() < Date.parse(challenge.policy.resendAvailableAt)) {
      return HttpResponse.json(
        { message: 'Verification code cannot be resent yet', code: 'OTP_RESEND_UNAVAILABLE' },
        { status: 400 },
      );
    }
    otpChallenges.delete(challenge.challengeId);
    return HttpResponse.json({ data: createOtpChallenge(challenge.email) });
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
