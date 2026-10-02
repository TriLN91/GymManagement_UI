export const DASHBOARD_WIDGET_IDS = [
  'trainers',
  'assignments',
  'ptSales',
  'appointments',
  'alerts',
] as const;

export type DashboardWidgetId = (typeof DASHBOARD_WIDGET_IDS)[number];
export type DashboardDataState = 'loading' | 'loaded' | 'empty' | 'error';

export type DashboardResource<T> =
  | { state: 'loading' }
  | { state: 'loaded'; data: T }
  | { state: 'empty' }
  | { state: 'error'; message?: string };

export type TrainerOperationalStatus = 'active' | 'hidden' | 'suspended' | 'unlinked';

export interface DashboardTrainerRecord {
  id: string;
  name: string;
  status: TrainerOperationalStatus;
}

export type AssignmentStatus = 'active' | 'historical';

export interface DashboardAssignmentRecord {
  id: string;
  memberName: string;
  packageName: string;
  trainerName: string;
  startsOn: string;
  endsOn: string;
  status: AssignmentStatus;
}

export type PTPurchaseStatus = 'confirmed' | 'pending';

export interface DashboardPTPurchaseRecord {
  id: string;
  packageName: string;
  trainerName: string;
  purchasedAt: string;
  status: PTPurchaseStatus;
}

export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled';
export type AppointmentType = 'assessment' | 'coaching' | 'planReview';

export interface DashboardAppointmentRecord {
  id: string;
  memberName: string;
  trainerName: string;
  startsAt: string;
  status: AppointmentStatus;
  type: AppointmentType;
}

export type OperationalAlertSeverity = 'high' | 'medium' | 'low';
export type OperationalAlertMessage =
  'assignmentRequired' | 'trainerReviewPending' | 'appointmentCancelled' | 'appointmentUpcoming';

export interface DashboardOperationalAlert {
  id: string;
  severity: OperationalAlertSeverity;
  message: OperationalAlertMessage;
  subject: string;
  occurredAt: string;
}

export interface GymOwnerDashboardResources {
  trainers: DashboardResource<DashboardTrainerRecord[]>;
  assignments: DashboardResource<DashboardAssignmentRecord[]>;
  ptSales: DashboardResource<DashboardPTPurchaseRecord[]>;
  appointments: DashboardResource<DashboardAppointmentRecord[]>;
  alerts: DashboardResource<DashboardOperationalAlert[]>;
}

export interface DashboardPreferences {
  order: DashboardWidgetId[];
  hidden: DashboardWidgetId[];
}
