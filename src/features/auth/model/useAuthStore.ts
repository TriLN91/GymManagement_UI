import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { AuthUser, Role } from '@/entities/user';
import { tokenManager } from '@/shared/api/client';
import { STORAGE_KEYS } from '@/shared/config/constants';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  hydrate: () => void;
  setSession: (user: AuthUser) => void;
  updateUser: (updates: Pick<AuthUser, 'fullName' | 'email' | 'avatarUrl'>) => void;
  clear: () => void;
  hasRole: (role: Role | ReadonlyArray<Role>) => boolean;
}

// SSR-AA-03: tokens live in sessionStorage (memory + session via TokenManager) — never in localStorage.
// Only the non-secret `user` record is persisted to localStorage; hydrate() drops it when no token exists.
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isHydrated: false,

        hydrate: () => {
          tokenManager.hydrate();
          const isAuthenticated = tokenManager.getAccess() !== null;
          set({
            isHydrated: true,
            isAuthenticated,
            user: isAuthenticated ? get().user : null,
          });
        },

        setSession: (user) => {
          // Tenant is optional until the backend has the concept.
          if (user.tenantId) sessionStorage.setItem(STORAGE_KEYS.tenantId, user.tenantId);
          else sessionStorage.removeItem(STORAGE_KEYS.tenantId);
          set({ user, isAuthenticated: true });
        },

        updateUser: (updates) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null,
          })),

        clear: () => {
          tokenManager.clear();
          sessionStorage.removeItem(STORAGE_KEYS.tenantId);
          set({ user: null, isAuthenticated: false });
        },

        hasRole: (role) => {
          const user = get().user;
          if (!user) return false;
          const roles = Array.isArray(role) ? role : [role];
          return user.roles.some((r) => roles.includes(r));
        },
      }),
      {
        name: 'app:auth',
        // Only persist the user record; tokens and flags are runtime-only.
        partialize: (state) => ({ user: state.user }),
        version: 1,
      },
    ),
    { name: 'auth-store' },
  ),
);
