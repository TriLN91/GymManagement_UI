import { beforeEach, describe, expect, it } from 'vitest';

import { useAuthStore } from './useAuthStore';

import type { AuthUser } from '@/entities/user';

const member: AuthUser = {
  id: 'u-1',
  email: 'm@d.gym',
  fullName: 'Test Member',
  roles: ['member'],
  tenantId: 't-1',
};

const pt: AuthUser = { ...member, id: 'u-2', roles: ['pt'] };

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clear();
    sessionStorage.clear();
  });

  it('hasRole returns false when no user', () => {
    expect(useAuthStore.getState().hasRole('member')).toBe(false);
  });

  it('setSession marks authenticated and stores tenant', () => {
    useAuthStore.getState().setSession(member);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(member);
    expect(state.isAuthenticated).toBe(true);
    expect(sessionStorage.getItem('gmc.tenantId')).toBe('t-1');
  });

  it('hasRole supports single and array', () => {
    useAuthStore.getState().setSession(pt);
    expect(useAuthStore.getState().hasRole('pt')).toBe(true);
    expect(useAuthStore.getState().hasRole(['pt', 'gym_admin'])).toBe(true);
    expect(useAuthStore.getState().hasRole(['member', 'gym_admin'])).toBe(false);
  });

  it('clear resets state', () => {
    useAuthStore.getState().setSession(member);
    useAuthStore.getState().clear();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(sessionStorage.getItem('gmc.tenantId')).toBeNull();
  });

  it('keeps an OTP challenge in runtime state without authenticating or persisting it', () => {
    useAuthStore.getState().setPendingOtpChallenge({
      challengeId: 'challenge-runtime-only',
      maskedEmail: 'ad***@demo.gym',
      requiredFor: 'gym_admin_session',
      policy: {
        codeLength: 6,
        expiresAt: '2026-10-05T10:10:00+07:00',
        resendAvailableAt: '2026-10-05T10:01:00+07:00',
        attemptsRemaining: 5,
      },
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.pendingOtpChallenge?.challengeId).toBe('challenge-runtime-only');
    expect(localStorage.getItem('app:auth')).not.toContain('challenge-runtime-only');
    expect(sessionStorage.getItem('gmc.accessToken')).toBeNull();
  });
});
