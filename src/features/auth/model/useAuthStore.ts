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
  clear: () => void;
  hasRole: (role: Role | ReadonlyArray<Role>) => boolean;
}

// SSR-AA-03 spirit: tokens live in sessionStorage (memory + session via TokenManager) — never localStorage.
// We persist only `user` so refresh keeps the user signed in until token expiry clears them out.
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isHydrated: false,

        hydrate: () => {
          tokenManager.hydrate();
          set({
            isHydrated: true,
            isAuthenticated: tokenManager.getAccess() !== null,
          });
        },

        setSession: (user) => {
          sessionStorage.setItem(STORAGE_KEYS.tenantId, user.tenantId);
          set({ user, isAuthenticated: true });
        },

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