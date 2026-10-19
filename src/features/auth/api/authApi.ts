import { mapAuthResponse, type AuthResponseDto } from './mappers';

import type { AuthSession, LoginPayload, RegisterPayload } from '@/entities/user';
import { apiPost } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

export interface OtpSentResponse {
  email: string;
  expiryMinutes: number;
  message: string;
  isEmailSent: boolean;
  debugOtpCode?: string;
}

export interface VerifyOtpResponse {
  isValid: boolean;
  resetToken: string;
  message: string;
}

export interface ResetPasswordPayload {
  email: string;
  resetToken: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthSession> =>
    mapAuthResponse(await apiPost<AuthResponseDto, LoginPayload>(ENDPOINTS.auth.login, payload)),

  register: async (payload: RegisterPayload): Promise<AuthSession> =>
    mapAuthResponse(
      await apiPost<AuthResponseDto, RegisterPayload>(ENDPOINTS.auth.register, payload),
    ),

  logout: (refreshToken: string) => apiPost<void>(ENDPOINTS.auth.logout, { refreshToken }),

  forgotPassword: (email: string) =>
    apiPost<OtpSentResponse>(ENDPOINTS.auth.forgotPassword, { email }),

  verifyOtp: (payload: { email: string; otpCode: string }) =>
    apiPost<VerifyOtpResponse>(ENDPOINTS.auth.verifyOtp, payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiPost<boolean>(ENDPOINTS.auth.resetPassword, payload),

  changePassword: (payload: ChangePasswordPayload) =>
    apiPost<boolean>(ENDPOINTS.auth.changePassword, payload),
};
