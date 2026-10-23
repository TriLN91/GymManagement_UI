import { http, HttpResponse } from 'msw';

import { emailTaken, gymAdminRegistry, trainerRegistry } from './mockRegistry';

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

const passwordTooShort = () =>
  failure(
    400,
    'Validation',
    `400: Validation Error thất bại - Password: Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`,
  );

// Accounts created through the mocked registration flow: approved Gym Admins and the Trainers they create.
const dynamicAccounts = (): Array<MockAccount & { password: string }> => [
  ...gymAdminRegistry
    .filter((item) => item.status === 'Active')
    .map((item) => ({
      userId: item.userId,
      email: item.email,
      fullName: item.fullName,
      roles: ['GymAdmin'],
      password: item.password,
    })),
  ...trainerRegistry.map((item) => ({
    userId: item.userId,
    email: item.email,
    fullName: item.fullName,
    roles: ['Trainer'],
    password: item.password,
  })),
];

const accountFromRefreshToken = (token: string | undefined) =>
  [...Object.values(accounts), ...dynamicAccounts()].find(
    (account) => `mock-refresh-${account.userId}` === token,
  );

// Wildcard patterns so MSW intercepts regardless of baseURL (cross-origin dev server).
const path = (p: string) => `*${p}`;

export const authHandlers = [
  http.post(path(ENDPOINTS.auth.login), async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };

    // Same order as the backend: a correct password on a not-yet-approved account explains why.
    const registration = gymAdminRegistry.find((item) => item.email === body.email);
    if (registration && body.password === registration.password) {
      if (registration.status === 'PendingApproval') {
        return failure(
          403,
          'AccountPendingApproval',
          '403: Tài khoản đang chờ Platform Admin duyệt; bạn chưa thể đăng nhập.',
        );
      }
      if (registration.status === 'Rejected') {
        return failure(403, 'AccountRejected', '403: Đăng ký tài khoản đã bị từ chối.');
      }
    }

    const demo = Object.values(accounts).find((item) => item.email === body.email);
    if (demo && body.password === DEMO_PASSWORD) return success(tokensFor(demo));

    const dynamic = dynamicAccounts().find((item) => item.email === body.email);
    if (dynamic && body.password === dynamic.password) return success(tokensFor(dynamic));

    return failure(401, 'InvalidCredentials', '401: Đăng nhập thất bại');
  }),

  http.post(path(ENDPOINTS.auth.register), async ({ request }) => {
    const body = (await request.json()) as { email?: string; fullName?: string; password?: string };
    if ((body.password ?? '').length < MIN_PASSWORD_LENGTH) return passwordTooShort();
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
    if ((body.password ?? '').length < MIN_PASSWORD_LENGTH) return passwordTooShort();
    const email = body.email ?? '';
    if (emailTaken(email) || Object.values(accounts).some((item) => item.email === email)) {
      return failure(409, 'Conflict', '409: Email đã được đăng ký.');
    }
    const registration = {
      userId: crypto.randomUUID(),
      email,
      password: body.password ?? '',
      fullName: body.fullName ?? '',
      phoneNumber: null,
      gymId: crypto.randomUUID(),
      gymName: body.gymName ?? '',
      legalName: null,
      taxCode: null,
      status: 'PendingApproval' as const,
      createdAtUtc: new Date().toISOString(),
    };
    gymAdminRegistry.push(registration);
    // Like the backend, no tokens are returned: the account waits for a Platform Admin.
    return success({
      userId: registration.userId,
      email,
      fullName: registration.fullName,
      status: registration.status,
      gymId: registration.gymId,
      gymName: registration.gymName,
    });
  }),

  http.post(path(ENDPOINTS.auth.registerSendOtp), async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      fullName?: string;
      role?: string;
      gymName?: string;
    };
    const requested = (body.role ?? 'Member').toLowerCase();
    if (requested === 'trainer' || requested === 'pt') {
      return failure(
        400,
        'Validation',
        '400: Tài khoản huấn luyện viên do Gym Admin tạo; không thể tự đăng ký.',
      );
    }
    const isGymAdmin = requested === 'gymadmin' || requested === 'gym_admin';
    if (isGymAdmin && !(body.gymName ?? '').trim()) {
      return failure(400, 'Validation', '400: Cần nhập tên phòng gym khi đăng ký Gym Admin.');
    }
    if (emailTaken(body.email ?? ''))
      return failure(409, 'Conflict', '409: Email đã được đăng ký.');
    if ((body.password ?? '').length < MIN_PASSWORD_LENGTH) {
      return failure(
        400,
        'Validation',
        `400: Validation Error thất bại - Password: Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`,
      );
    }
    sessionStorage.setItem(
      'fitflex:mock-registration',
      JSON.stringify({
        email: body.email,
        password: body.password,
        fullName: body.fullName,
        role: isGymAdmin ? 'GymAdmin' : 'Member',
        gymName: body.gymName,
      }),
    );
    return success({
      email: body.email,
      expiryMinutes: 15,
      message: 'Mã OTP xác thực đã được gửi về email của bạn.',
      isEmailSent: true,
      debugOtpCode: '123456',
    });
  }),

  http.post(path(ENDPOINTS.auth.registerResendOtp), async ({ request }) => {
    const body = (await request.json()) as { email?: string };
    if (!body.email) {
      return failure(400, 'Validation', '400: Cần nhập email để gửi lại mã OTP.');
    }
    return success({
      email: body.email,
      expiryMinutes: 15,
      message: 'Mã OTP xác thực mới đã được gửi về email của bạn.',
      isEmailSent: true,
      debugOtpCode: '123456',
    });
  }),

  http.post(path(ENDPOINTS.auth.registerVerifyOtp), async ({ request }) => {
    const body = (await request.json()) as { email?: string; otpCode?: string };
    if (body.otpCode !== '123456' && body.otpCode !== '888888') {
      return failure(400, 'InvalidOtp', 'Mã OTP không chính xác. Vui lòng kiểm tra lại.');
    }
    const stored = JSON.parse(sessionStorage.getItem('fitflex:mock-registration') ?? '{}') as {
      password?: string;
      fullName?: string;
      role?: string;
      gymName?: string;
    };
    const email = body.email ?? '';
    if (stored.role === 'GymAdmin') {
      // Like the backend, no tokens are returned: the account waits for a Platform Admin.
      const userId = crypto.randomUUID();
      gymAdminRegistry.push({
        userId,
        email,
        password: stored.password ?? '',
        fullName: stored.fullName ?? '',
        phoneNumber: null,
        gymId: crypto.randomUUID(),
        gymName: stored.gymName ?? '',
        legalName: null,
        taxCode: null,
        status: 'PendingApproval' as const,
        createdAtUtc: new Date().toISOString(),
      });
      return success({
        userId,
        email,
        fullName: stored.fullName ?? '',
        accessToken: '',
        refreshToken: '',
        roles: ['GymAdmin'],
        pendingApproval: true,
      });
    }
    const account: MockAccount = {
      userId: `u-${Date.now()}`,
      email,
      fullName: stored.fullName ?? 'User',
      roles: ['Member'],
    };
    return success(tokensFor(account), 201);
  }),

  http.post(path(ENDPOINTS.auth.refresh), async ({ request }) => {
    const body = (await request.json()) as { refreshToken?: string };
    const account = accountFromRefreshToken(body.refreshToken);
    if (!account) return failure(401, 'InvalidRefreshToken', '401: Làm mới phiên thất bại');
    return success(tokensFor(account));
  }),

  http.post(path(ENDPOINTS.auth.logout), () => success(null)),

  http.post(path(ENDPOINTS.auth.changePassword), async ({ request }) => {
    if (!request.headers.get('Authorization')?.startsWith('Bearer ')) {
      return failure(401, 'Unauthorized', 'Sign in to change your password.');
    }
    const body = (await request.json()) as { currentPassword?: string; newPassword?: string };
    if (body.currentPassword !== DEMO_PASSWORD) {
      return failure(400, 'PasswordMismatch', 'The current password is incorrect.');
    }
    if (
      (body.newPassword ?? '').length < MIN_PASSWORD_LENGTH ||
      body.newPassword === body.currentPassword
    ) {
      return failure(
        400,
        'Validation',
        'Choose a different password with at least six characters.',
      );
    }
    return success(true);
  }),

  http.post(path(ENDPOINTS.auth.forgotPassword), async ({ request }) => {
    const body = (await request.json()) as { email: string };
    sessionStorage.setItem('fitflex:mock-reset-email', body.email);
    sessionStorage.removeItem('fitflex:mock-reset-verified');
    return success({
      email: body.email,
      expiryMinutes: 15,
      isEmailSent: true,
      debugOtpCode: '123456',
      message: 'OTP sent',
    });
  }),
  http.post(path(ENDPOINTS.auth.verifyOtp), async ({ request }) => {
    const body = (await request.json()) as { email: string; otpCode: string };
    const valid =
      body.email === sessionStorage.getItem('fitflex:mock-reset-email') &&
      body.otpCode === '123456';
    if (valid) sessionStorage.setItem('fitflex:mock-reset-verified', body.email);
    return success({
      isValid: valid,
      resetToken: valid ? 'mock-verified-reset' : null,
      message: valid ? 'Verified' : 'Invalid OTP',
    });
  }),
  http.post(path(ENDPOINTS.auth.resetPassword), async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      resetToken: string;
      newPassword: string;
    };
    if (
      body.email !== sessionStorage.getItem('fitflex:mock-reset-email') ||
      body.email !== sessionStorage.getItem('fitflex:mock-reset-verified') ||
      body.resetToken !== 'mock-verified-reset' ||
      body.newPassword.length < MIN_PASSWORD_LENGTH
    )
      return failure(400, 'InvalidResetToken', 'Reset rejected');
    sessionStorage.removeItem('fitflex:mock-reset-email');
    sessionStorage.removeItem('fitflex:mock-reset-verified');
    return success(true);
  }),
];
