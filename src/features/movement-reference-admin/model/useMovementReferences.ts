import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { movementReferenceApi } from '../api/movementReferenceApi';
import type { CreateExerciseInput, CreateReferenceSetInput } from '../api/types';

import { QUERY_KEYS } from '@/shared/config/constants';

export function useExercises() {
  return useQuery({
    queryKey: QUERY_KEYS.exercises(),
    queryFn: movementReferenceApi.listExercises,
    staleTime: 60_000,
  });
}

export function useReferenceSets(exerciseId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.referenceSets(exerciseId),
    queryFn: () => movementReferenceApi.listReferenceSets(exerciseId),
  });
}

export function useReferenceSet(referenceSetId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.referenceSet(referenceSetId),
    queryFn: () => movementReferenceApi.getReferenceSet(referenceSetId),
    enabled: Boolean(referenceSetId),
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExerciseInput) => movementReferenceApi.createExercise(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.exercises() }),
  });
}

export function useCreateReferenceSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReferenceSetInput) => movementReferenceApi.createReferenceSet(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['movement-reference-sets'] }),
  });
}

function useRefreshReferenceSet(referenceSetId: string) {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.referenceSet(referenceSetId) }),
      queryClient.invalidateQueries({ queryKey: ['movement-reference-sets'] }),
    ]);
  };
}

export function useUploadReferenceSource(referenceSetId: string) {
  const refresh = useRefreshReferenceSet(referenceSetId);
  return useMutation({
    mutationFn: (video: File) => movementReferenceApi.uploadSource(referenceSetId, video),
    onSuccess: refresh,
  });
}

export function useConfirmReferenceProfile(referenceSetId: string) {
  const refresh = useRefreshReferenceSet(referenceSetId);
  return useMutation({
    mutationFn: (profileId: string) =>
      movementReferenceApi.confirmProfile(referenceSetId, profileId),
    onSuccess: refresh,
  });
}

export function useActivateReferenceProfile(referenceSetId: string) {
  const refresh = useRefreshReferenceSet(referenceSetId);
  return useMutation({
    mutationFn: (profileId: string) =>
      movementReferenceApi.activateProfile(referenceSetId, profileId),
    onSuccess: refresh,
  });
}
