import type { RuntimeConfiguration, RuntimeVersion } from './runtimeTypes';
import type { ExerciseDto } from './types';

import { apiGet, apiPost, apiPut } from '@/shared/api/client';

export const runtimeBase = '/admin/movement-runtime';
export type Capability = RuntimeConfiguration['capability'] & {
  pattern: string;
  available: boolean;
  views?: string[];
};
export type Readiness = {
  id: string;
  exerciseId: string;
  status: string;
  version: number;
  view: string;
  available: boolean;
};
export type ExerciseRevision = {
  id: string;
  version: number;
  snapshotJson: string;
  createdAtUtc: string;
};
export type ExerciseInput = {
  name: string;
  equipment: string;
  muscleGroup: string;
  instructions: string;
  pattern: string;
  isActive: boolean;
};
export type ExerciseMetadataCatalog = { equipment: string[]; muscleGroups: string[] };
export const movementRuntimeApi = {
  metadataCatalog: () => apiGet<ExerciseMetadataCatalog>(`${runtimeBase}/metadata-catalog`),
  exercises: () => apiGet<ExerciseDto[]>(`${runtimeBase}/exercises`),
  capabilities: () => apiGet<Capability[]>(`${runtimeBase}/capabilities`),
  readiness: () => apiGet<Readiness[]>(`${runtimeBase}/readiness`),
  versions: (exerciseId: string) =>
    apiGet<RuntimeVersion[]>(`${runtimeBase}/configurations`, { params: { exerciseId } }),
  history: (exerciseId: string) =>
    apiGet<ExerciseRevision[]>(`${runtimeBase}/exercises/${exerciseId}/history`),
  createExercise: (input: ExerciseInput) => apiPost<ExerciseDto>(`${runtimeBase}/exercises`, input),
  updateExercise: (id: string, input: ExerciseInput) =>
    apiPut<ExerciseDto>(`${runtimeBase}/exercises/${id}`, input),
  propose: (profileId: string) => apiPost<RuntimeVersion>(`${runtimeBase}/proposals/${profileId}`),
  review: (
    id: string,
    input: { regions: string[]; features: string[]; enabledRules: string[]; note: string },
  ) => apiPut<RuntimeVersion>(`${runtimeBase}/configurations/${id}/review`, input),
  transition: (id: string, action: 'publish' | 'reject') =>
    apiPost<RuntimeVersion>(`${runtimeBase}/configurations/${id}/${action}`),
};
