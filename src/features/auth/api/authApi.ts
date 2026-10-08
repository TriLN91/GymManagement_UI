import type {
  AuthSession,
  AuthUser,
  EmailOtpChallenge,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ResendEmailOtpPayload,
  VerifyEmailOtpPayload,
} from '@/entities/user';
import { apiGet, apiPost } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const authApi = {
  login: (payload: LoginPayload) =>
    apiPost<LoginResponse, LoginPayload>(ENDPOINTS.auth.login, payload),

  register: (payload: RegisterPayload) =>
    apiPost<AuthSession, RegisterPayload>(ENDPOINTS.auth.register, payload),

  logout: () => apiPost<void>(ENDPOINTS.auth.logout),

  me: () => apiGet<AuthUser>(ENDPOINTS.auth.me),

  forgotPassword: (email: string) => apiPost<void>(ENDPOINTS.auth.forgotPassword, { email }),

  resetPassword: (token: string, password: string) =>
    apiPost<void>(ENDPOINTS.auth.resetPassword, { token, password }),

  verifyEmailOtp: (payload: VerifyEmailOtpPayload) =>
    apiPost<AuthSession, VerifyEmailOtpPayload>(ENDPOINTS.auth.verifyEmailOtp, payload),

  resendEmailOtp: (payload: ResendEmailOtpPayload) =>
    apiPost<EmailOtpChallenge, ResendEmailOtpPayload>(ENDPOINTS.auth.resendEmailOtp, payload),
};
