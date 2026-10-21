// Bodies of the backend CF04 endpoints (AppointmentDtos.cs): camelCase JSON, enums as strings.
export type AppointmentStatus =
  'Proposed' | 'Scheduled' | 'Completed' | 'NoShow' | 'Cancelled' | 'Reassigned' | 'TrainerNoShow';
export type ChangeRequestStatus = 'Pending' | 'Accepted' | 'Declined' | 'Withdrawn';
export type TrainerChangeStatus =
  'PendingManager' | 'PendingMember' | 'Applied' | 'DeclinedByMember' | 'Withdrawn';

export interface AppointmentChangeDto {
  id: string;
  appointmentId: string;
  requestedByRole: string;
  oldScheduledAtUtc: string;
  newScheduledAtUtc: string;
  reason: string;
  isEmergency: boolean;
  status: ChangeRequestStatus;
  awaitingMyResponse: boolean;
  createdAtUtc: string;
  decidedAtUtc: string | null;
  decisionNote: string | null;
}

export interface AppointmentDto {
  id: string;
  coachingAssignmentId: string | null;
  gymId: string;
  gymBranchId: string | null;
  gymBranchName: string | null;
  memberProfileId: string;
  memberName: string;
  trainerProfileId: string;
  trainerName: string;
  originalTrainerProfileId: string;
  originalTrainerName: string;
  scheduledAtUtc: string;
  durationMinutes: number;
  status: AppointmentStatus;
  notes: string | null;
  proposedByRole: string | null;
  awaitingMyResponse: boolean;
  isReassigned: boolean;
  reassignmentReason: string | null;
  memberConsentApproved: boolean;
  consumedSession: boolean;
  cancelReason: string | null;
  cancelledAtUtc: string | null;
  completedAtUtc: string | null;
  /** True while the Member is owed a replacement session (the Trainer side ended this one, nothing was charged). */
  needsMakeup: boolean;
  /** For a make-up session: the earlier session it replaces. */
  makeupOfAppointmentId: string | null;
  pendingChange: AppointmentChangeDto | null;
}

export interface TrainerChangeDto {
  id: string;
  assignmentId: string;
  memberProfileId: string;
  memberName: string;
  currentTrainerProfileId: string;
  currentTrainerName: string;
  proposedTrainerProfileId: string | null;
  proposedTrainerName: string | null;
  requestedByRole: string;
  reason: string;
  effectiveAtUtc: string | null;
  status: TrainerChangeStatus;
  createdAtUtc: string;
  decidedAtUtc: string | null;
}

export interface SessionAssignmentDto {
  id: string;
  memberProfileId: string;
  memberName: string;
  trainerProfileId: string;
  trainerName: string;
  gymBranchId: string | null;
  gymBranchName: string | null;
  status: string;
  startsAtUtc: string;
  endsAtUtc: string;
  totalSessions: number;
  sessionsUsed: number;
  /** Null when the package has no session limit. */
  sessionsRemaining: number | null;
  /** Hours of notice needed to cancel or move a session free of charge (set by the Offering). */
  minNoticeHours: number;
  openTrainerChange: TrainerChangeDto | null;
}

export interface ManagedAssignmentDto {
  id: string;
  memberProfileId: string;
  memberName: string;
  trainerProfileId: string;
  trainerName: string;
  gymBranchId: string | null;
  gymBranchName: string | null;
  status: string;
  startsAtUtc: string;
  endsAtUtc: string;
  totalSessions: number;
  sessionsUsed: number;
  openTrainerChange: TrainerChangeDto | null;
}

export interface AvailabilitySlotDto {
  id?: string;
  gymBranchId: string | null;
  /** 0 = Sunday to 6 = Saturday. */
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface AvailabilityDto {
  trainerProfileId: string;
  utcOffsetHours: number;
  slots: AvailabilitySlotDto[];
}

/** The backend rejects unknown fields: send exactly these keys. */
export interface ProposeAppointmentBody {
  coachingAssignmentId: string;
  scheduledAtUtc: string;
  durationMinutes: number;
  notes?: string;
  /** Book the replacement for a session that has `needsMakeup`. */
  makeupOfAppointmentId?: string;
}
export interface CancelAppointmentBody {
  reason: string;
  isEmergency: boolean;
}
export interface RescheduleAppointmentBody {
  newScheduledAtUtc: string;
  reason: string;
  isEmergency: boolean;
}
export interface ProposeTrainerChangeBody {
  newTrainerProfileId: string;
  reason?: string;
  changeId?: string;
}
