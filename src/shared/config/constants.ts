// All path strings, storage keys, and query keys are frozen. Importing these is the only way
// to reference a route, a persisted key, or a TanStack query key — no inline literals.

export const BRAND_MARK = 'Fit®';

export const ROUTES = Object.freeze({
  public: Object.freeze({
    landing: '/',
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
    workoutSchedule: '/app/workout/schedule',
    workoutBuilder: '/app/workout/builder',
    aiAssessment: '/app/workout/assessment',
    aiAssessmentExercise: '/app/workout/assessment/:exerciseId',
    aiAssessmentPath: (exerciseId: string) => '/app/workout/assessment/' + exerciseId,
    workoutDay: '/app/workout/day/:dayId',
    workoutDayPath: (dayId: string) => '/app/workout/day/' + dayId,
    workoutExecution: '/app/workout/execution',
    workoutSession: '/app/workout/session/:dayId',
    workoutSessionPath: (dayId: string) => '/app/workout/session/' + dayId,
    workoutCompletion: '/app/workout/complete/:sessionId',
    workoutCompletionPath: (sessionId: string) => '/app/workout/complete/' + sessionId,
    workoutHistory: '/app/workout/history',
    achievements: '/app/workout/achievements',
    nutrition: '/app/nutrition',
    progress: '/app/progress',
    marketplace: '/app/marketplace',
    marketplaceGym: '/app/marketplace/gyms/:gymId',
    marketplaceGymPath: (gymId: string) => '/app/marketplace/gyms/' + gymId,
    marketplaceOffers: '/app/marketplace/offers',
    marketplaceTrainers: '/app/marketplace/trainers',
    marketplaceTrainer: '/app/marketplace/trainers/:trainerId',
    marketplaceTrainerPath: (trainerId: string) => '/app/marketplace/trainers/' + trainerId,
    marketplacePackages: '/app/marketplace/packages',
    marketplaceCheckout: '/app/marketplace/checkout',
    marketplacePaymentResult: '/app/marketplace/payment/:orderId',
    marketplacePaymentResultPath: (orderId: string) => '/app/marketplace/payment/' + orderId,
    profile: '/app/profile',
    profileEdit: '/app/profile/edit',
    profileSetup: '/app/profile/setup',
    profileSecurity: '/app/profile/security',
    profileAssessments: '/app/profile/assessments',
    profileAssessment: '/app/profile/assessments/:assessmentId',
    profileAssessmentPath: (assessmentId: string) => '/app/profile/assessments/' + assessmentId,
    profileAppointments: '/app/profile/appointments',
    profileWearables: '/app/profile/wearables',
    profileNotifications: '/app/profile/notifications',
  }),
  pt: Object.freeze({
    root: '/pt',
    memberData: '/pt/member-data',
    profile: '/pt/profile',
    profileEdit: '/pt/profile/edit',
    gymInfo: '/pt/profile/gym',
    members: '/pt/members',
    memberDetail: '/pt/members/:memberId',
    memberDetailPath: (memberId: string) => `/pt/members/${memberId}`,
    appointments: '/pt/appointments',
    plans: '/pt/appointments',
    workoutBuilder: '/pt/workout-builder',
    exerciseLibrary: '/pt/workout-builder/library',
    planBuilder: '/pt/workout-builder/plan',
    memberWorkout: '/pt/workout-builder/member-workout',
    coachingHistory: '/pt/history/coaching',
    income: '/pt/history/income',
  }),
  admin: Object.freeze({
    root: '/admin',
    profile: '/admin/profile',
    profileBrand: '/admin/profile/brand',
    profileBranches: '/admin/profile/branches',
    onboarding: '/admin/onboarding',
    onboardingProfile: '/admin/onboarding/profile',
    onboardingLicense: '/admin/onboarding/license',
    onboardingReview: '/admin/onboarding/review',
    onboardingStatus: '/admin/onboarding/status',
    pts: '/admin/pts',
    trainerCreate: '/admin/pts/new',
    trainerAssignments: '/admin/pts/assignments',
    trainerDetail: '/admin/pts/:trainerId',
    trainerDetailPath: (trainerId: string) => `/admin/pts/${trainerId}`,
    trainerEdit: '/admin/pts/:trainerId/edit',
    trainerEditPath: (trainerId: string) => `/admin/pts/${trainerId}/edit`,
    packages: '/admin/packages',
    packageCreate: '/admin/packages/new',
    packageDetail: '/admin/packages/:packageId',
    packageDetailPath: (packageId: string) => `/admin/packages/${packageId}`,
    packageEdit: '/admin/packages/:packageId/edit',
    packageEditPath: (packageId: string) => `/admin/packages/${packageId}/edit`,
    customers: '/admin/customers',
    orders: '/admin/orders',
    orderDetail: '/admin/orders/:orderId',
    orderDetailPath: (orderId: string) => `/admin/orders/${orderId}`,
    settlements: '/admin/settlements',
    analytics: '/admin/analytics',
    notifications: '/admin/notifications',
    accountSecurity: '/admin/account-security',
  }),
  superadmin: Object.freeze({
    root: '/superadmin',
    tenants: '/superadmin/tenants',
    analytics: '/superadmin/analytics',
    movementAssessment: '/superadmin/movement-assessment',
    movementReferenceSet: '/superadmin/movement-assessment/reference-sets/:referenceSetId',
    movementReferenceSetPath: (referenceSetId: string) =>
      `/superadmin/movement-assessment/reference-sets/${referenceSetId}`,
  }),
});

// SessionStorage: tokens + tenant. localStorage would survive tab close (SSR-AA-04 risk).
export const STORAGE_KEYS = Object.freeze({
  accessToken: 'gmc.accessToken',
  refreshToken: 'gmc.refreshToken',
  tenantId: 'gmc.tenantId',
  theme: 'gmc.theme',
  locale: 'gmc.locale',
  gymOwnerOnboarding: 'gmc.gymOwnerOnboarding',
  gymOwnerDashboardPreferences: 'gmc.gymOwnerDashboardPreferences',
  gymOwnerTrainingManagement: 'gmc.gymOwnerTrainingManagement',
});

export const QUERY_KEYS = Object.freeze({
  currentUser: () => ['auth', 'me'] as const,
  currentPlan: () => ['coaching', 'plan', 'current'] as const,
  coachingHistory: (memberId: string) => ['coaching', 'plan', 'history', memberId] as const,
  checkIns: (memberId: string) => ['coaching', 'checkins', memberId] as const,
  exercises: () => ['exercises'] as const,
  referenceSets: (exerciseId?: string) =>
    ['movement-reference-sets', { exerciseId: exerciseId ?? null }] as const,
  referenceSet: (referenceSetId: string) =>
    ['movement-reference-sets', 'detail', referenceSetId] as const,
});

export type RouteTree = typeof ROUTES;

export type Language = 'vi' | 'en';

export const LOCALE_TAGS = Object.freeze({
  vi: 'vi-VN',
  en: 'en-US',
} as const satisfies Record<Language, string>);

export const FACILITY_IDS = [
  'free-weights',
  'cardio',
  'functional',
  'locker-shower',
  'parking',
  'sauna',
  'recovery',
  'body-assessment',
] as const;
