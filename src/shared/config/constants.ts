// All path strings, storage keys, and query keys are frozen. Importing these is the only way
// to reference a route, a persisted key, or a TanStack query key — no inline literals.

export const ROUTES = Object.freeze({
  public: Object.freeze({
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    forbidden: '/403',
    notFound: '/404',
  }),
  member: Object.freeze({
    root: '/app',
    coaching: '/app/coaching',
    workout: '/app/workout',
    nutrition: '/app/nutrition',
    progress: '/app/progress',
  }),
  pt: Object.freeze({
    root: '/pt',
    members: '/pt/members',
    plans: '/pt/plans',
  }),
  admin: Object.freeze({
    root: '/admin',
    pts: '/admin/pts',
    packages: '/admin/packages',
  }),
  superadmin: Object.freeze({
    root: '/superadmin',
    tenants: '/superadmin/tenants',
    analytics: '/superadmin/analytics',
  }),
});

// SessionStorage: tokens + tenant. localStorage would survive tab close (SSR-AA-04 risk).
export const STORAGE_KEYS = Object.freeze({
  accessToken: 'gmc.accessToken',
  refreshToken: 'gmc.refreshToken',
  tenantId: 'gmc.tenantId',
  theme: 'gmc.theme',
  locale: 'gmc.locale',
});

export const QUERY_KEYS = Object.freeze({
  currentUser: () => ['auth', 'me'] as const,
  currentPlan: () => ['coaching', 'plan', 'current'] as const,
  coachingHistory: (memberId: string) => ['coaching', 'plan', 'history', memberId] as const,
  checkIns: (memberId: string) => ['coaching', 'checkins', memberId] as const,
});

export type RouteTree = typeof ROUTES;
