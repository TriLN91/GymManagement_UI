// Every URL string in the app lives here. Importing the constant is the only way to make a request.
// Paths are relative to VITE_API_BASE_URL (the backend serves everything under /api).
export const ENDPOINTS = {
  auth: {
    login: '/identity/login',
    register: '/identity/register',
    refresh: '/identity/refresh',
    logout: '/identity/logout',
    // Not implemented by the backend yet (MSW only).
    forgotPassword: '/identity/forgot-password',
    resetPassword: '/identity/reset-password',
  },
  // Mock-only until the backend exposes a FE-shaped coaching API (AI work is deferred).
  coaching: {
    plan: '/coaching/plans/current',
    planHistory: (memberId: string) => `/coaching/plans/history/${memberId}`,
    checkin: '/coaching/checkins',
    feedback: '/coaching/feedback',
    history: '/coaching/plans/history',
  },
} as const;

export type EndpointGroup = keyof typeof ENDPOINTS;
