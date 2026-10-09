import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authApi } from '../api/authApi';

import { useAuthStore } from './useAuthStore';

import type { AuthSession, LoginPayload, RegisterPayload } from '@/entities/user';
import { tokenManager } from '@/shared/api/client';

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (session: AuthSession) => {
      tokenManager.setTokens(session.tokens.accessToken, session.tokens.refreshToken);
      setSession(session.user);
    },
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (session: AuthSession) => {
      tokenManager.setTokens(session.tokens.accessToken, session.tokens.refreshToken);
      setSession(session.user);
    },
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      // Backend revokes the refresh-token family; a failure must not block local sign-out.
      const refreshToken = tokenManager.getRefresh();
      if (refreshToken) await authApi.logout(refreshToken);
    },
    onSettled: () => {
      clear();
      queryClient.clear();
    },
  });
}
