// Every URL string in the app lives here. Importing the constant is the only way to make a request.
// Paths are relative to VITE_API_BASE_URL (the backend serves everything under /api).
export const ENDPOINTS = {
  auth: {
    login: '/identity/login',
    register: '/identity/register',
    registerGymAdmin: '/identity/register/gym-admin',
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
      profile: '/coaching/me/profile',
      assignments: '/coaching/me/assignments',
    },
    memberProfile: (memberProfileId: string) => `/coaching/members/${memberProfileId}/profile`,
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
  // Gym Admin creates Trainer accounts for their own Gym (backend GymOwnerController).
  gymOwner: {
    myGyms: '/gym-owner/brands/me',
    trainers: '/gym-owner/trainers',
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
