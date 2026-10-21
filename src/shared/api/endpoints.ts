// Every URL string in the app lives here. Importing the constant is the only way to make a request.
// Paths are relative to VITE_API_BASE_URL (the backend serves everything under /api).
export const ENDPOINTS = {
  trainerServices: {
    forTrainer: (trainerProfileId: string) => `/gym-owner/trainers/${trainerProfileId}/services`,
    active: (serviceId: string) => `/gym-owner/trainer-services/${serviceId}/active`,
  },
  marketplaceReview: {
    branches: '/admin/approvals/branches',
    approveBranch: (id: string) => `/admin/approvals/branches/${id}/approve`,
    rejectBranch: (id: string) => `/admin/approvals/branches/${id}/reject`,
    offers: '/admin/approvals/offers',
    approveOffer: (id: string) => `/admin/approvals/offers/${id}/approve`,
    rejectOffer: (id: string) => `/admin/approvals/offers/${id}/reject`,
  },
  staffInvitations: {
    list: '/gym-owner/invitations',
    revoke: (id: string) => `/gym-owner/invitations/${id}/revoke`,
    preview: '/staff-invitations/preview',
    accept: '/staff-invitations/accept',
  },
  notifications: {
    mine: '/notifications/mine',
    read: (id: string) => `/notifications/${id}/read`,
    readAll: '/notifications/read-all',
  },
  assistant: {
    conversations: '/assistant/conversations',
  },
  auth: {
    login: '/identity/login',
    register: '/identity/register',
    registerGymAdmin: '/identity/register/gym-admin',
    registerSendOtp: '/identity/register/send-otp',
    registerVerifyOtp: '/identity/register/verify-otp',
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
      profile: '/coaching/me/profile',
      assignments: '/coaching/me/assignments',
      plans: '/coaching/me/plans',
    },
    memberProfile: (memberProfileId: string) => `/coaching/members/${memberProfileId}/profile`,
    memberPlans: (memberProfileId: string) => `/coaching/members/${memberProfileId}/plans`,
    memberBodyCheckins: (memberId: string) => `/coaching/members/${memberId}/body-checkins`,
    plan: '/coaching/plans/current',
    planHistory: (memberId: string) => `/coaching/plans/history/${memberId}`,
    checkin: '/coaching/checkins',
    feedback: '/coaching/feedback',
    history: '/coaching/plans/history',
  },
  // Platform Admin review of Gym Admin self-registrations (backend AdminRegistrationsController).
  adminRegistrations: {
    gymAdmins: '/admin/registrations/gym-admins',
    gymAdmin: (userId: string) => `/admin/registrations/gym-admins/${userId}`,
    approve: (userId: string) => `/admin/registrations/gym-admins/${userId}/approve`,
    reject: (userId: string) => `/admin/registrations/gym-admins/${userId}/reject`,
  },
  // CF04: coaching sessions, Trainer availability and change of primary Trainer (backend AppointmentsController).
  planFeedback: {
    create: (assignmentId: string) => `/coaching/assignments/${assignmentId}/plan-feedback`,
    mine: '/coaching/me/plan-feedback',
    received: '/coaching/plan-feedback/received',
    reply: (id: string) => `/coaching/plan-feedback/${id}/reply`,
  },
  appointments: {
    mine: '/appointments/mine',
    assignments: '/appointments/assignments',
    availability: '/appointments/availability',
    create: '/appointments',
    detail: (id: string) => `/appointments/${id}`,
    accept: (id: string) => `/appointments/${id}/accept`,
    decline: (id: string) => `/appointments/${id}/decline`,
    cancel: (id: string) => `/appointments/${id}/cancel`,
    complete: (id: string) => `/appointments/${id}/complete`,
    noShow: (id: string) => `/appointments/${id}/no-show`,
    trainerNoShow: (id: string) => `/appointments/${id}/trainer-no-show`,
    reschedule: (id: string) => `/appointments/${id}/reschedule`,
    changeAccept: (changeId: string) => `/appointments/changes/${changeId}/accept`,
    changeDecline: (changeId: string) => `/appointments/changes/${changeId}/decline`,
    changeWithdraw: (changeId: string) => `/appointments/changes/${changeId}/withdraw`,
    trainerAvailability: '/trainer/availability',
    consentReassign: (id: string) => `/marketplace/orders/appointments/${id}/consent-reassign`,
  },
  trainerChanges: {
    list: '/coaching/trainer-changes',
    managedAssignments: '/coaching/assignments/managed',
    request: (assignmentId: string) =>
      `/coaching/assignments/${assignmentId}/trainer-changes/request`,
    propose: (assignmentId: string) => `/coaching/assignments/${assignmentId}/trainer-changes`,
    respond: (changeId: string) => `/coaching/trainer-changes/${changeId}/respond`,
  },
  // CF01 workout sessions (backend WorkoutController, route api/workouts).
  workouts: {
    exercises: '/workouts/exercises',
    sessions: '/workouts/me/sessions',
    session: (sessionId: string) => `/workouts/me/sessions/${sessionId}`,
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
      invoiceHtml: (id: string) => `/marketplace/orders/${id}/invoice/html`,
      sendInvoiceEmail: (id: string) => `/marketplace/orders/${id}/invoice/send-email`,
    },
  },
  gymOwner: {
    brands: '/gym-owner/brands',
    myBrands: '/gym-owner/brands/me',
    myGyms: '/gym-owner/brands/me',
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
