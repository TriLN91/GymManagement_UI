import { useMutation } from '@tanstack/react-query';

import { authApi } from '../api/authApi';

import { useAuthStore } from './useAuthStore';

import type {
  AuthSession,
  LoginPayload,
  RegisterGymAdminPayload,
  RegisterPayload,
} from '@/entities/user';
import { tokenManager } from '@/shared/api/client';
import { AuthError } from '@/shared/api/errorTypes';

async function authenticate<T>(request: () => Promise<T>): Promise<T> {
  const version = tokenManager.getVersion();
  const session = await request();
  if (version !== tokenManager.getVersion())
    throw new AuthError(401, 'Session changed', 'SessionChanged');
  return session;
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (payload: LoginPayload) => authenticate(() => authApi.login(payload)),
    onSuccess: (session: AuthSession) => {
      tokenManager.setTokens(session.tokens.accessToken, session.tokens.refreshToken);
      setSession(session.user);
    },
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authenticate(() => authApi.register(payload)),
    onSuccess: (session: AuthSession) => {
      tokenManager.setTokens(session.tokens.accessToken, session.tokens.refreshToken);
      setSession(session.user);
    },
  });
}

export function useRegisterGymAdmin() {
  return useMutation({
    mutationFn: (payload: RegisterGymAdminPayload) => authApi.registerGymAdmin(payload),
  });
}

export function useVerifyRegisterOtp() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (payload: { email: string; otpCode: string }) =>
      authenticate(() => authApi.verifyRegisterOtp(payload)),
    onSuccess: (result) => {
      if (result.status !== 'signedIn') return;
      tokenManager.setTokens(result.session.tokens.accessToken, result.session.tokens.refreshToken);
      setSession(result.session.user);
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const revocation = tokenManager.signOut();
      useAuthStore.getState().syncSession(null);
      await revocation;
    },
  });
}
