import type {
  DashboardOperationalAlert,
  DashboardTrainerRecord,
  OperationalAlertSeverity,
  TrainerOperationalStatus,
} from './types';

export const TRAINER_STATUS_ORDER: TrainerOperationalStatus[] = [
  'active',
  'hidden',
  'suspended',
  'unlinked',
];

const alertPriority: Record<OperationalAlertSeverity, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function countTrainersByStatus(records: DashboardTrainerRecord[]) {
  return TRAINER_STATUS_ORDER.map((status) => ({
    status,
    count: records.filter((record) => record.status === status).length,
  }));
}

export function sortAlertsBySeverity(records: DashboardOperationalAlert[]) {
  return [...records].sort((left, right) => {
    const severityDifference = alertPriority[right.severity] - alertPriority[left.severity];
    if (severityDifference !== 0) return severityDifference;
    return right.occurredAt.localeCompare(left.occurredAt);
  });
}
