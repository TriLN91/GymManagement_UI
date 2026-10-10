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
  // `me.*` are CF01 member endpoints (backend CoachingController); the rest is mock-only
  // until the backend exposes a FE-shaped coaching API (AI work is deferred).
  coaching: {
    me: {
      goal: '/coaching/me/goal',
      trainingProfile: '/coaching/me/training-profile',
      nutritionProfile: '/coaching/me/nutrition-profile',
      bodyCheckins: '/coaching/me/body-checkins',
    },
    plan: '/coaching/plans/current',
    planHistory: (memberId: string) => `/coaching/plans/history/${memberId}`,
    checkin: '/coaching/checkins',
    feedback: '/coaching/feedback',
    history: '/coaching/plans/history',
  },
  exercises: {
    list: '/workout/exercises',
    detail: (exerciseId: string) => `/workout/exercises/${exerciseId}`,
    create: '/admin/movement-references/exercises',
  },
  referenceSets: {
    list: '/admin/reference-sets',
    detail: (referenceSetId: string) => `/admin/reference-sets/${referenceSetId}`,
    sources: (referenceSetId: string) => `/admin/reference-sets/${referenceSetId}/sources`,
    confirm: (referenceSetId: string, profileId: string) =>
      `/admin/reference-sets/${referenceSetId}/profiles/${profileId}/confirm`,
    activate: (referenceSetId: string, profileId: string) =>
      `/admin/reference-sets/${referenceSetId}/profiles/${profileId}/activate`,
  },
} as const;

export type EndpointGroup = keyof typeof ENDPOINTS;
