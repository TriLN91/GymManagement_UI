import type {
  ChangePasswordPayload,
  OtpSentResponse,
  ResetPasswordPayload,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from './types';

import { apiPost } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const passwordApi = {
  forgotPassword: (email: string) =>
    apiPost<OtpSentResponse>(ENDPOINTS.auth.forgotPassword, { email }),

  verifyOtp: (payload: VerifyOtpPayload) =>
    apiPost<VerifyOtpResponse>(ENDPOINTS.auth.verifyOtp, payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiPost<boolean>(ENDPOINTS.auth.resetPassword, payload),

  changePassword: (payload: ChangePasswordPayload) =>
    apiPost<boolean>(ENDPOINTS.auth.changePassword, payload),
};
