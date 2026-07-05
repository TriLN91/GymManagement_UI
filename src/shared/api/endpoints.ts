// Every URL string in the app lives here. Importing the constant is the only way to make a request.
export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  coaching: {
    plan: '/coaching/plans/current',
    planHistory: (memberId: string) => `/coaching/plans/history/${memberId}`,
    checkin: '/coaching/checkins',
    feedback: '/coaching/feedback',
    history: '/coaching/plans/history',
  },
} as const;

export type EndpointGroup = keyof typeof ENDPOINTS;