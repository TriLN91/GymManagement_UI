import {
  mapExercise,
  mapReferenceSet,
  mapReferenceSetProfile,
  mapReferenceSetSummary,
} from './mappers';
import type {
  CreateExerciseInput,
  CreateReferenceSetInput,
  ExerciseDto,
  ReferenceSetDto,
  ReferenceSetProfileDto,
  ReferenceSetSummaryDto,
} from './types';

import { apiGet, apiPost, apiPostForm } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const movementReferenceApi = {
  listExercises: async (): Promise<ExerciseDto[]> =>
    (await apiGet<unknown[]>(ENDPOINTS.exercises.list))
      .map(mapExercise)
      .filter((item) => item.isActive),

  createExercise: async (input: CreateExerciseInput): Promise<ExerciseDto> =>
    mapExercise(await apiPost<unknown, CreateExerciseInput>(ENDPOINTS.exercises.create, input)),

  listReferenceSets: async (exerciseId?: string): Promise<ReferenceSetSummaryDto[]> =>
    (
      await apiGet<unknown[]>(ENDPOINTS.referenceSets.list, {
        params: exerciseId ? { exerciseId } : undefined,
      })
    ).map(mapReferenceSetSummary),

  createReferenceSet: async (input: CreateReferenceSetInput): Promise<ReferenceSetDto> =>
    mapReferenceSet(
      await apiPost<unknown, CreateReferenceSetInput>(ENDPOINTS.referenceSets.list, input),
    ),

  getReferenceSet: async (referenceSetId: string): Promise<ReferenceSetDto> =>
    mapReferenceSet(await apiGet<unknown>(ENDPOINTS.referenceSets.detail(referenceSetId))),

  uploadSource: async (referenceSetId: string, video: File): Promise<ReferenceSetDto> => {
    const form = new FormData();
    form.append('video', video);
    return mapReferenceSet(
      await apiPostForm<unknown>(ENDPOINTS.referenceSets.sources(referenceSetId), form),
    );
  },

  confirmProfile: async (
    referenceSetId: string,
    profileId: string,
  ): Promise<ReferenceSetProfileDto> =>
    mapReferenceSetProfile(
      await apiPost<unknown>(ENDPOINTS.referenceSets.confirm(referenceSetId, profileId)),
    ),

  activateProfile: async (
    referenceSetId: string,
    profileId: string,
  ): Promise<ReferenceSetProfileDto> =>
    mapReferenceSetProfile(
      await apiPost<unknown>(ENDPOINTS.referenceSets.activate(referenceSetId, profileId)),
    ),
};
