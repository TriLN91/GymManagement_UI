// Every URL string in the app lives here. Importing the constant is the only way to make a request.
// Paths are relative to VITE_API_BASE_URL (the backend serves everything under /api).
export const ENDPOINTS = {
  assistant: {
    conversations: '/assistant/conversations',
  },
  auth: {
    login: '/identity/login',
    register: '/identity/register',
    refresh: '/identity/refresh',
    logout: '/identity/logout',
    forgotPassword: '/identity/forgot-password',
    verifyOtp: '/identity/verify-otp',
    resetPassword: '/identity/reset-password',
    changePassword: '/identity/change-password',
  },
  // `me.*` are CF01 member endpoints (backend CoachingController); the rest is mock-only
  // until the backend exposes a FE-shaped coaching API (AI work is deferred).
  coaching: {
    me: {
      goal: '/coaching/me/goal',
      trainingProfile: '/coaching/me/training-profile',
      nutritionProfile: '/coaching/me/nutrition-profile',
      bodyCheckins: '/coaching/me/body-checkins',
      plans: '/coaching/me/plans',
    },
    plan: '/coaching/plans/current',
    planHistory: (memberId: string) => `/coaching/plans/history/${memberId}`,
    checkin: '/coaching/checkins',
    feedback: '/coaching/feedback',
    history: '/coaching/plans/history',
  },
  // CF01 workout sessions (backend WorkoutController, route api/workouts).
  workouts: {
    exercises: '/workouts/exercises',
    sessions: '/workouts/me/sessions',
    complete: (sessionId: string) => `/workouts/me/sessions/${sessionId}/complete`,
  },
  // CF05 Fitness Progression (backend ProgressionController). Member-only gamification.
  progression: {
    state: '/progression/me/state',
    history: '/progression/me/history',
    schedule: '/progression/me/schedule',
    badgeSeen: (awardId: string) => `/progression/me/badges/${awardId}/seen`,
    primaryDistanceSource: '/progression/me/primary-distance-source',
    recovery: '/progression/me/recovery',
    recoveryDetail: (reportId: string) => `/progression/me/recovery/${reportId}`,
    pause: '/progression/me/pause',
    resume: '/progression/me/resume',
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
  // CF03 Gym Marketplace, Gym Owner & Branch Manager
  marketplace: {
    branches: '/marketplace/branches',
    branchDetail: (id: string) => `/marketplace/branches/${id}`,
    brandBranches: (brandId: string) => `/marketplace/brands/${brandId}/branches`,
    offers: '/marketplace/offers',
    orders: {
      checkout: '/marketplace/orders/checkout',
      detail: (id: string) => `/marketplace/orders/${id}`,
      me: '/marketplace/orders/me',
      cancel: (id: string) => `/marketplace/orders/${id}/cancel`,
      consentReassign: (appointmentId: string) =>
        `/marketplace/orders/appointments/${appointmentId}/consent-reassign`,
    },
  },
  gymOwner: {
    brands: '/gym-owner/brands',
    myBrands: '/gym-owner/brands/me',
    brandDetail: (brandId: string) => `/gym-owner/brands/${brandId}`,
    createBranch: (brandId: string) => `/gym-owner/brands/${brandId}/branches`,
    updateBranch: (branchId: string) => `/gym-owner/branches/${branchId}`,
    assignManager: (branchId: string) => `/gym-owner/branches/${branchId}/manager`,
    assignTrainer: (branchId: string) => `/gym-owner/branches/${branchId}/trainers`,
    removeTrainer: (branchId: string, trainerProfileId: string) =>
      `/gym-owner/branches/${branchId}/trainers/${trainerProfileId}`,
    trainers: '/gym-owner/trainers',
    trainersOverview: '/gym-owner/trainers/overview',
    updateTrainerStatus: (trainerProfileId: string) =>
      `/gym-owner/trainers/${trainerProfileId}/status`,
    updateTrainerBranches: (trainerProfileId: string) =>
      `/gym-owner/trainers/${trainerProfileId}/branches`,
    deleteTrainer: (trainerProfileId: string) => `/gym-owner/trainers/${trainerProfileId}`,
    relinkTrainer: (trainerProfileId: string) => `/gym-owner/trainers/${trainerProfileId}/relink`,
    brandDashboard: (brandId: string) => `/gym-owner/brands/${brandId}/dashboard`,
    branchDashboard: (branchId: string) => `/gym-owner/branches/${branchId}/dashboard`,
  },
  trainer: {
    profileStatus: '/trainer/profile/status',
    updateProfile: '/trainer/profile/me',
  },
  branchManager: {
    branchOffers: (branchId: string) => `/branch-manager/branches/${branchId}/offers`,
    updateOffer: (offerId: string) => `/branch-manager/offers/${offerId}`,
    appointments: (branchId: string) => `/branch-manager/branches/${branchId}/appointments`,
    reassignAppointment: (appointmentId: string) =>
      `/branch-manager/appointments/${appointmentId}/reassign`,
    trainersKpi: (branchId: string) => `/branch-manager/branches/${branchId}/trainers/kpi`,
  },
} as const;

export type EndpointGroup = keyof typeof ENDPOINTS;
