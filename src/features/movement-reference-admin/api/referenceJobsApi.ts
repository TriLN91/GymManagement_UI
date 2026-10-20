import { apiGet, apiPost, apiPostForm } from '@/shared/api/client';
export type ReferenceJob = {
  id: string;
  exerciseId: string;
  referenceSetId: string;
  fileName: string;
  state: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'NEEDS_FOOTAGE';
  stage: string;
  errorCode?: string;
  errorMessage?: string;
  canRetry: boolean;
};
const base = '/admin/reference-jobs';
export const referenceJobsApi = {
  list: () => apiGet<ReferenceJob[]>(base),
  get: (id: string) => apiGet<ReferenceJob>(`${base}/${id}`),
  byClient: async (key: string) => {
    try {
      return await apiGet<ReferenceJob>(`${base}/by-client/${encodeURIComponent(key)}`);
    } catch (error) {
      if ((error as { status?: number }).status === 404) return undefined;
      throw error;
    }
  },
  queue: (
    setId: string,
    video: File,
    key: string,
    progress?: (loaded: number, total: number) => void,
    replaces?: string,
  ) => {
    const form = new FormData();
    form.append('video', video);
    if (replaces) form.append('replacesSourceId', replaces);
    return apiPostForm<ReferenceJob>(`${base}/collections/${setId}`, form, {
      timeout: 300_000,
      headers: { 'Idempotency-Key': key },
      onUploadProgress: (event) =>
        progress?.(Math.min(event.loaded, event.total ?? video.size), event.total ?? video.size),
    });
  },
  retry: (id: string, key: string) =>
    apiPost<ReferenceJob>(`${base}/${id}/retry`, undefined, {
      headers: { 'Idempotency-Key': key },
    }),
};
