import { http, HttpResponse } from 'msw';

import { ENDPOINTS } from '@/shared/api/endpoints';

// Mirrors the backend contract (ResponseDto<AuthResponseDto>) so the FE behaves the same with MSW on or off.
// Backend role names; the FE maps them in features/auth/api/mappers.ts.
const DEMO_PASSWORD = 'Password1!';
const MIN_PASSWORD_LENGTH = 6;

interface MockAccount {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
}

const accounts: Record<string, MockAccount> = {
  member: {
    userId: 'u-member',
    email: 'member@demo.gym',
    fullName: 'Maya Member',
    roles: ['User'],
  },
  pt: { userId: 'u-pt', email: 'pt@demo.gym', fullName: 'Paolo Trainer', roles: ['PT'] },
  admin: {
    userId: 'u-admin',
    email: 'admin@demo.gym',
    fullName: 'Anna Admin',
    roles: ['GymAdmin'],
  },
  super: {
    userId: 'u-super',
    email: 'super@demo.gym',
    fullName: 'Sam Super',
    roles: ['SuperAdmin'],
  },
};

const tokensFor = (account: MockAccount) => ({
  ...account,
  accessToken: `mock-access-${account.userId}`,
  refreshToken: `mock-refresh-${account.userId}`,
});

const success = (data: unknown, status = 200) =>
  HttpResponse.json({ isSuccess: true, message: `${status}: OK`, data }, { status });

const failure = (status: number, errorCode: string, message: string) =>
  HttpResponse.json({ isSuccess: false, message, data: null, errorCode }, { status });

// Gym Admin registrations waiting for a Platform Admin (mirrors backend status PendingApproval).
const pendingGymAdmins = new Set<string>();

const accountFromRefreshToken = (token: string | undefined) =>
  Object.values(accounts).find((account) => `mock-refresh-${account.userId}` === token);

// Wildcard patterns so MSW intercepts regardless of baseURL (cross-origin dev server).
const path = (p: string) => `*${p}`;

export const authHandlers = [
  http.post(path(ENDPOINTS.auth.login), async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    if (body.email && pendingGymAdmins.has(body.email) && body.password) {
      return failure(
        403,
        'AccountPendingApproval',
        '403: Tài khoản đang chờ Platform Admin duyệt; bạn chưa thể đăng nhập.',
      );
    }
    const account = Object.values(accounts).find((item) => item.email === body.email);
    if (!account || body.password !== DEMO_PASSWORD) {
      return failure(401, 'InvalidCredentials', '401: Đăng nhập thất bại');
    }
    return success(tokensFor(account));
  }),

  http.post(path(ENDPOINTS.auth.register), async ({ request }) => {
    const body = (await request.json()) as { email?: string; fullName?: string; password?: string };
    if ((body.password ?? '').length < MIN_PASSWORD_LENGTH) {
      return failure(
        400,
        'Validation',
        `400: Validation Error thất bại - Password: Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`,
      );
    }
    const account: MockAccount = {
      userId: `u-${Date.now()}`,
      email: body.email ?? '',
      fullName: body.fullName ?? '',
      roles: ['User'],
    };
    return success(tokensFor(account), 201);
  }),

  http.post(path(ENDPOINTS.auth.registerGymAdmin), async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      fullName?: string;
      gymName?: string;
      password?: string;
    };
    if ((body.password ?? '').length < MIN_PASSWORD_LENGTH) {
      return failure(
        400,
        'Validation',
        `400: Validation Error thất bại - Password: Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`,
      );
    }
    const email = body.email ?? '';
    if (pendingGymAdmins.has(email) || Object.values(accounts).some((a) => a.email === email)) {
      return failure(409, 'Conflict', '409: Email đã được đăng ký.');
    }
    pendingGymAdmins.add(email);
    return success({
      userId: `u-${Date.now()}`,
      email,
      fullName: body.fullName ?? '',
      status: 'PendingApproval',
      gymId: `g-${Date.now()}`,
      gymName: body.gymName ?? '',
    });
  }),

  http.post(path(ENDPOINTS.auth.refresh), async ({ request }) => {
    const body = (await request.json()) as { refreshToken?: string };
    const account = accountFromRefreshToken(body.refreshToken);
    if (!account) return failure(401, 'InvalidRefreshToken', '401: Làm mới phiên thất bại');
    return success(tokensFor(account));
  }),

  http.post(path(ENDPOINTS.auth.logout), () => success(null)),

  http.post(path(ENDPOINTS.auth.forgotPassword), () => success(null)),
  http.post(path(ENDPOINTS.auth.resetPassword), () => success(null)),
];
