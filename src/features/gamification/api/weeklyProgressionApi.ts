import { apiGet, apiPost } from '@/shared/api/client';

export const progressionGoals = [
  'Strength',
  'Hypertrophy',
  'Cardio',
  'FatLoss',
  'Endurance',
  'GeneralFitness',
  'Mobility',
] as const;
export type ProgressionGoal = (typeof progressionGoals)[number];
export interface ReviewEvidence {
  source: string;
  id: string;
  occurredAtUtc: string;
  use: string;
  detail: string;
}
export interface WeeklyReview {
  id: string;
  exerciseId: string;
  goal: ProgressionGoal;
  weekOf: string;
  assignmentId: string | null;
  status: string;
  evidenceAsOfUtc: string;
  reviewedAtUtc: string | null;
  evaluation: {
    ruleVersion: string;
    exerciseName: string;
    windowDays: number;
    requiredSessions: number;
    validSessions: number;
    completionRatio: number | null;
    averageRpe: number | null;
    performanceTrendPercent: number | null;
    conclusion: string;
    suggestedLoadChangePercent: number | null;
    reason: string;
    handoff: string;
    evidence: ReviewEvidence[];
    limitations: string[];
  };
}
const root = '/progression/me/weekly';
export const weeklyProgressionApi = {
  exercises: () =>
    apiGet<{ id: string; name: string; muscleGroup: string | null }[]>(`${root}/exercises`),
  history: () => apiGet<WeeklyReview[]>(root),
  evaluate: (exerciseId: string, goal: ProgressionGoal) =>
    apiPost<WeeklyReview, { exerciseId: string; goal: string }>(`${root}/evaluate`, {
      exerciseId,
      goal,
    }),
  review: (id: string) => apiPost<WeeklyReview>(`${root}/${id}/review`),
  resolveRecovery: (id: string) => apiPost<boolean>(`${root}/recovery/${id}/resolve`),
};
