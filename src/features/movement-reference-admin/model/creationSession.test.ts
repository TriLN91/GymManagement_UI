import { beforeEach, expect, it, vi } from 'vitest';

import { movementReferenceApi } from '../api/movementReferenceApi';
import { movementRuntimeApi, type ExerciseInput } from '../api/movementRuntimeApi';
import { referenceJobsApi } from '../api/referenceJobsApi';

import { readCreation, saveCreation, submitCreation } from './creationSession';
vi.mock('../api/movementRuntimeApi', () => ({ movementRuntimeApi: { createExercise: vi.fn() } }));
vi.mock('../api/movementReferenceApi', () => ({
  movementReferenceApi: { createReferenceSet: vi.fn() },
}));
vi.mock('../api/referenceJobsApi', () => ({
  referenceJobsApi: { byClient: vi.fn(), queue: vi.fn() },
}));
const input: ExerciseInput = {
  name: 'Durable hinge',
  equipment: 'Bodyweight',
  muscleGroup: '',
  instructions: '',
  pattern: 'HINGE',
  isActive: true,
  targetMuscles: [{ code: 'hamstrings', role: 'PRIMARY' }],
};
const job = {
  id: 'job',
  exerciseId: 'exercise',
  referenceSetId: 'set',
  fileName: 'good.mp4',
  state: 'QUEUED' as const,
  stage: 'QUEUED',
  canRetry: false,
};
beforeEach(() => {
  localStorage.clear();
  vi.resetAllMocks();
});
it('reconciles accepted footage after refresh without access to the browser File', async () => {
  saveCreation('admin', {
    key: 'original',
    input,
    withVideo: true,
    exerciseId: 'exercise',
    collectionId: 'set',
    fileName: 'good.mp4',
    fileSize: 5,
  });
  vi.mocked(referenceJobsApi.byClient).mockResolvedValue(job);
  expect((await submitCreation('admin', input)).job).toEqual(job);
  expect(referenceJobsApi.byClient).toHaveBeenCalledWith('video:original');
  expect(movementRuntimeApi.createExercise).not.toHaveBeenCalled();
  expect(referenceJobsApi.queue).not.toHaveBeenCalled();
  expect(readCreation('admin')).toBeUndefined();
});
it('retains the same creation key after a lost response and resumes the original request', async () => {
  const file = new File(['video'], 'good.mp4');
  vi.mocked(movementRuntimeApi.createExercise)
    .mockRejectedValueOnce(new Error('Response lost'))
    .mockResolvedValueOnce({ id: 'exercise' } as never);
  await expect(submitCreation('admin', input, file)).rejects.toThrow('Response lost');
  const original = readCreation('admin')!;
  vi.mocked(movementReferenceApi.createReferenceSet).mockResolvedValue({ id: 'set' } as never);
  vi.mocked(referenceJobsApi.byClient).mockResolvedValue(job);
  await submitCreation('admin', { ...input, name: 'Changed form' }, file);
  expect(movementRuntimeApi.createExercise).toHaveBeenLastCalledWith(input, original.key);
});
it('allows editing after an explicit creation validation rejection', async () => {
  vi.mocked(movementRuntimeApi.createExercise).mockRejectedValue({ status: 400 });
  await expect(submitCreation('admin', input)).rejects.toEqual({ status: 400 });
  expect(readCreation('admin')).toBeUndefined();
});
