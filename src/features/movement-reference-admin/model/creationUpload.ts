import { movementReferenceApi } from '../api/movementReferenceApi';
import { runtimeBase } from '../api/movementRuntimeApi';

import { apiPost } from '@/shared/api/client';

/** Reconcile an uncertain response before sending the same upload again. */
export async function submitCreationFootage(collectionId: string, footage: File, retry: boolean) {
  if (retry) {
    const existing = await movementReferenceApi.getReferenceSet(collectionId);
    const prior = [...existing.sources]
      .reverse()
      .find((source) => source.fileName === footage.name);
    if (prior?.processingStatus === 'PROCESSED') return existing;
    if (prior?.processingStatus === 'PROCESSING')
      throw new Error(
        'The previous upload is still processing. Wait, then retry to refresh its saved result.',
      );
    if (prior?.processingStatus === 'FAILED') {
      await apiPost(`${runtimeBase}/sources/${prior.id}/reprocess`, undefined, {
        timeout: 330_000,
      });
      return movementReferenceApi.getReferenceSet(collectionId);
    }
  }
  return movementReferenceApi.uploadSource(collectionId, footage);
}
