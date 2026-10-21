import { beforeEach, expect, it } from 'vitest';

import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { useMemberWorkoutBuilderStore } from '@/features/member-workout-builder/model/useMemberWorkoutBuilderStore';
import { tokenManager } from '@/shared/api/client';
import { queryClient } from '@/shared/config/queryClient';
import { accountStorage, bindLegacyState, resetAccountStores } from '@/shared/lib/accountState';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  useAuthStore.getState().clear();
});

it('isolates drafts and query data when switching accounts, and restores the original draft', () => {
  const login = (id: string) => {
    tokenManager.setTokens(`access-${id}`, `refresh-${id}`);
    useAuthStore
      .getState()
      .setSession({ id, email: `${id}@example.com`, fullName: id, roles: ['member'] });
  };
  login('a');
  useMemberWorkoutBuilderStore.getState().setName('Private A draft');
  queryClient.setQueryData(['private'], 'A secret');
  login('b');
  expect(useMemberWorkoutBuilderStore.getState().name).toBe('');
  expect(queryClient.getQueryData(['private'])).toBeUndefined();
  login('a');
  expect(useMemberWorkoutBuilderStore.getState().name).toBe('Private A draft');
  useAuthStore.getState().clear();
  expect(useMemberWorkoutBuilderStore.getState().name).toBe('');
});

it('never imports another account legacy state', () => {
  bindLegacyState('a');
  localStorage.setItem('legacy', JSON.stringify({ state: { secret: 'A' }, version: 0 }));
  localStorage.setItem('app:auth', JSON.stringify({ state: { user: { id: 'b' } } }));
  expect(accountStorage?.getItem('legacy')).toBeNull();
  resetAccountStores(null);
});
