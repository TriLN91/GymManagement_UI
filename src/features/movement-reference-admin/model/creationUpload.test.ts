import { expect, it, vi } from 'vitest';

import { movementReferenceApi } from '../api/movementReferenceApi';
import type { ReferenceSetDto } from '../api/types';

import { submitCreationFootage } from './creationUpload';

vi.mock('../api/movementReferenceApi', () => ({
  movementReferenceApi: { getReferenceSet: vi.fn(), uploadSource: vi.fn() },
}));
vi.mock('@/shared/api/client', () => ({ apiPost: vi.fn() }));

it('does not upload again when the server completed an upload with an uncertain response', async () => {
  const saved = {
    sources: [{ id: 'source', fileName: 'good.mp4', processingStatus: 'PROCESSED' }],
  } as ReferenceSetDto;
  vi.mocked(movementReferenceApi.getReferenceSet).mockResolvedValue(saved);
  expect(await submitCreationFootage('set', new File(['video'], 'good.mp4'), true)).toBe(saved);
  expect(movementReferenceApi.uploadSource).not.toHaveBeenCalled();
});

it('leaves a processing upload alone and offers refresh instead of creating duplicate evidence', async () => {
  vi.mocked(movementReferenceApi.getReferenceSet).mockResolvedValue({
    sources: [{ id: 'source', fileName: 'good.mp4', processingStatus: 'PROCESSING' }],
  } as ReferenceSetDto);
  await expect(submitCreationFootage('set', new File(['video'], 'good.mp4'), true)).rejects.toThrow(
    'still processing',
  );
  expect(movementReferenceApi.uploadSource).not.toHaveBeenCalled();
});
