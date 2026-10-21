import { mapAuthResponse } from './mappers';
import type { AuthResponseDto, RegisterOtpSentResponse, VerifyRegisterOtpPayload } from './types';

import type {
  AuthSession,
  LoginPayload,
  PendingRegistration,
  RegisterGymAdminPayload,
  RegisterPayload,
} from '@/entities/user';
import { apiPost } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

export type VerifyRegisterOtpResult =
  { status: 'signedIn'; session: AuthSession } | { status: 'pending'; email: string };

export const sessionApi = {
  login: async (payload: LoginPayload): Promise<AuthSession> =>
    mapAuthResponse(await apiPost<AuthResponseDto, LoginPayload>(ENDPOINTS.auth.login, payload)),

  register: async (payload: RegisterPayload): Promise<AuthSession> =>
    mapAuthResponse(
      await apiPost<AuthResponseDto, RegisterPayload>(ENDPOINTS.auth.register, payload),
    ),

  // Returns no tokens: the account stays pending until a Platform Admin approves it.
  registerGymAdmin: (payload: RegisterGymAdminPayload) =>
    apiPost<PendingRegistration, RegisterGymAdminPayload>(ENDPOINTS.auth.registerGymAdmin, payload),

  sendRegisterOtp: (payload: RegisterPayload): Promise<RegisterOtpSentResponse> =>
    apiPost<RegisterOtpSentResponse, RegisterPayload>(ENDPOINTS.auth.registerSendOtp, payload),

  verifyRegisterOtp: async (
    payload: VerifyRegisterOtpPayload,
  ): Promise<VerifyRegisterOtpResult> => {
    const dto = await apiPost<AuthResponseDto, VerifyRegisterOtpPayload>(
      ENDPOINTS.auth.registerVerifyOtp,
      payload,
    );
    // A Gym Admin gets no tokens: the account waits for a Platform Admin.
    if (dto.pendingApproval) return { status: 'pending', email: dto.email };
    return { status: 'signedIn', session: mapAuthResponse(dto) };
  },

  logout: (refreshToken: string) => apiPost<void>(ENDPOINTS.auth.logout, { refreshToken }),
};
