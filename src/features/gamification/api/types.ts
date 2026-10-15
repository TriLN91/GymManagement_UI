// Mirrors AIFitness.Core.DTOs.ProgressionDtos (JSON camelCase, enums as strings, DateOnly as yyyy-MM-dd).

export type ScheduledDayStatus =
  'NoPlan' | 'Rest' | 'Paused' | 'Completed' | 'Missed' | 'Pending' | 'Upcoming';
export type XpRewardType = 'WorkoutCompleted' | 'PlanCompleted';
export type RecoverySeverity = 'Mild' | 'Severe';
export type RecoverySymptom = 'Soreness' | 'Fatigue' | 'Pain' | 'Injury' | 'Other';

export interface ScheduledDay {
  day: string;
  status: ScheduledDayStatus;
  expectedDayNumber: number | null;
  versionId?: string | null;
}

export interface BadgeAward {
  id: string;
  code: string;
  name: string;
  tier: string;
  threshold: number;
  reason: string;
  awardedAtUtc: string;
  seen: boolean;
  ruleVersion: string;
}

export interface BadgeTarget {
  code: string;
  name: string;
  tier: string;
  threshold: number;
  current: number;
}

export interface DistanceSummary {
  totalKm: number | null;
  primaryProvider: string | null;
  availableProviders: string[];
  sourceSelectionRequired: boolean;
  quarantinedActivities: number;
}

export interface TrainingPause {
  id: string;
  startDay: string;
  endDay: string | null;
  recoveryReportId: string | null;
  reason: string | null;
  resumeProposedAtUtc: string | null;
  resumeProposalNote: string | null;
}

export interface ProgressionState {
  stateVersion: string;
  businessDate: string;
  timeZone: string;
  ruleVersion: string;
  streak: {
    current: number;
    best: number;
    scheduleConfigured: boolean;
    today: ScheduledDayStatus | null;
  };
  xp: {
    totalConfirmed: number;
    pending: Array<{
      businessDate: string;
      provisionalAmount: number;
      rewardType: XpRewardType;
      confirmsAtUtc: string;
    }>;
  };
  completedWorkouts: number;
  distance: DistanceSummary;
  badges: BadgeAward[];
  nextBadges: BadgeTarget[];
  activePause: TrainingPause | null;
  days: ScheduledDay[];
}

export interface ScheduleWindow {
  id: string;
  workoutPlanId: string;
  isoWeekdays: number[];
  effectiveFromDay: string;
  effectiveToDay: string | null;
}

export interface ScheduleOverview {
  current: ScheduleWindow | null;
  upcoming: ScheduleWindow | null;
  hasActivePlan: boolean;
  planDayNumbers: number[];
  businessDate: string;
}

export type HistoryItemType = 'FitFlexWorkout' | 'PtSession' | 'ExternalActivity';

export interface HistoryItem {
  type: HistoryItemType;
  id: string;
  occurredAtUtc: string;
  businessDate: string;
  title: string;
  durationMinutes: number | null;
  distanceKm: number | null;
  planDayNumber: number | null;
  isMainSession: boolean;
  xpAwarded: number | null;
  provider: string | null;
  countingNote: string;
}

export interface ProgressionHistory {
  from: string;
  to: string;
  summary: {
    fitFlexWorkouts: number;
    ptSessions: number;
    externalActivities: number;
    distanceKm: number;
    scheduledCompleted: number;
    scheduledMissed: number;
    scheduledPaused: number;
    xpConfirmed: number;
  };
  items: HistoryItem[];
  days: ScheduledDay[];
}

export interface RecoveryReport {
  id: string;
  businessDate: string;
  reportedAtUtc: string;
  severity: RecoverySeverity;
  symptom: RecoverySymptom;
  bodyArea: string | null;
  notes: string | null;
  revision: number;
  editable: boolean;
}

export interface RecoveryInput {
  severity: RecoverySeverity;
  symptom: RecoverySymptom;
  bodyArea: string | null;
  notes: string | null;
}
