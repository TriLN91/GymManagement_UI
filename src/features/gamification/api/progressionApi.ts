import type {
  BadgeAward,
  DistanceSummary,
  ProgressionHistory,
  ProgressionState,
  RecoveryInput,
  RecoveryReport,
  ScheduleOverview,
  TrainingPause,
} from './types';

import { apiGet, apiPost, apiPut } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

const P = ENDPOINTS.progression;

export const progressionApi = {
  getState: () => apiGet<ProgressionState>(P.state),
  getHistory: (from?: string, to?: string) =>
    apiGet<ProgressionHistory>(P.history, { params: { from, to } }),
  getSchedule: () => apiGet<ScheduleOverview>(P.schedule),
  setSchedule: (isoWeekdays: number[]) =>
    apiPut<ScheduleOverview, { isoWeekdays: number[] }>(P.schedule, { isoWeekdays }),
  markBadgeSeen: (awardId: string) => apiPost<BadgeAward>(P.badgeSeen(awardId)),
  setPrimaryDistanceSource: (provider: string | null) =>
    apiPut<DistanceSummary, { provider: string | null }>(P.primaryDistanceSource, { provider }),
  getRecovery: () => apiGet<RecoveryReport[]>(P.recovery),
  reportRecovery: (input: RecoveryInput) =>
    apiPost<RecoveryReport, RecoveryInput>(P.recovery, input),
  pause: (recoveryReportId: string | null, reason: string | null) =>
    apiPost<TrainingPause, { recoveryReportId: string | null; reason: string | null }>(P.pause, {
      recoveryReportId,
      reason,
    }),
  resume: () => apiPost<TrainingPause>(P.resume),
};
