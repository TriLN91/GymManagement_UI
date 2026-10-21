import { movementReferenceApi } from '../api/movementReferenceApi';
import { movementRuntimeApi, type ExerciseInput } from '../api/movementRuntimeApi';
import { referenceJobsApi, type ReferenceJob } from '../api/referenceJobsApi';

import { STORAGE_KEYS } from '@/shared/config/constants';
export type CreationDraft = {
  key: string;
  input: ExerciseInput;
  withVideo: boolean;
  fileName?: string;
  fileSize?: number;
  exerciseId?: string;
  collectionId?: string;
  jobId?: string;
};
const storageKey = (owner: string) => `${STORAGE_KEYS.assessmentCreation}:${owner}`;
export function readCreation(owner: string): CreationDraft | undefined {
  try {
    return (
      (JSON.parse(localStorage.getItem(storageKey(owner)) ?? 'null') as CreationDraft | null) ??
      undefined
    );
  } catch {
    return undefined;
  }
}
export const saveCreation = (owner: string, draft: CreationDraft) =>
  localStorage.setItem(storageKey(owner), JSON.stringify(draft));
export const clearCreation = (owner: string) => localStorage.removeItem(storageKey(owner));
export function recentJobs(owner: string): ReferenceJob[] {
  try {
    return JSON.parse(
      localStorage.getItem(`${STORAGE_KEYS.assessmentJobs}:${owner}`) ?? '[]',
    ) as ReferenceJob[];
  } catch {
    return [];
  }
}
export function rememberJob(owner: string, job: ReferenceJob) {
  localStorage.setItem(
    `${STORAGE_KEYS.assessmentJobs}:${owner}`,
    JSON.stringify([job, ...recentJobs(owner).filter((j) => j.id !== job.id)].slice(0, 10)),
  );
}
// A repeated selection in an existing exercise resumes the same submission,
// including after refresh. Actual byte integrity is enforced by the server.
export async function footageSubmissionKey(exerciseId: string, file: File) {
  const descriptor = new TextEncoder().encode(
    JSON.stringify([file.name, file.size, file.lastModified]),
  );
  const digest = await crypto.subtle.digest('SHA-256', descriptor);
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  return `clip:${exerciseId}:${hash.slice(0, 32)}`;
}
// The stable key and original request survive request loss. The server reconciles both
// exercise creation and file receipt; a lost response must never become another exercise.
export async function submitCreation(
  owner: string,
  input: ExerciseInput,
  file?: File,
  progress?: (loaded: number, total: number) => void,
) {
  const draft = readCreation(owner) ?? {
    key: crypto.randomUUID(),
    input,
    withVideo: !!file,
    fileName: file?.name,
    fileSize: file?.size,
  };
  saveCreation(owner, draft);
  if (!draft.exerciseId) {
    try {
      draft.exerciseId = (await movementRuntimeApi.createExercise(draft.input, draft.key)).id;
    } catch (error) {
      // An explicit validation rejection has no uncertain write to reconcile.
      if ([400, 409, 422].includes((error as { status?: number }).status ?? 0))
        clearCreation(owner);
      throw error;
    }
    saveCreation(owner, draft);
  }
  if (!draft.withVideo) {
    clearCreation(owner);
    return { exerciseId: draft.exerciseId };
  }
  if (!draft.collectionId) {
    draft.collectionId = (
      await movementReferenceApi.createReferenceSet({
        exerciseId: draft.exerciseId,
        pattern: draft.input.pattern as 'HINGE' | 'SQUAT' | 'PULL',
      })
    ).id;
    saveCreation(owner, draft);
  }
  const key = `video:${draft.key}`;
  let job = await referenceJobsApi.byClient(key);
  if (!job) {
    if (!file || file.name !== draft.fileName || file.size !== draft.fileSize)
      throw new Error(
        'Reselect the original MP4 to resume this saved submission. Its exercise is already saved; no duplicate will be created.',
      );
    job = await referenceJobsApi.queue(draft.collectionId, file, key, progress);
  }
  rememberJob(owner, job);
  clearCreation(owner);
  return { exerciseId: draft.exerciseId, job };
}
