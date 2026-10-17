import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

import type { RuntimeConfiguration } from '../api/runtimeTypes';

import { RuntimeAdminWorkspace } from './RuntimeAdminWorkspace';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  list: vi.fn(),
  detail: vi.fn(),
}));
vi.mock('@/shared/api/client', () => ({
  apiGet: mocks.get,
  apiPost: mocks.post,
  apiPut: mocks.put,
}));
vi.mock('../api/movementReferenceApi', () => ({
  movementReferenceApi: { listReferenceSets: mocks.list, getReferenceSet: mocks.detail },
}));

beforeEach(() => vi.clearAllMocks());
it('keeps canonical publication separate from live approval and persists selected rule corrections', async () => {
  const configuration: RuntimeConfiguration = {
    schemaVersion: 'movement-runtime-v1',
    exerciseId: 'exercise',
    exercise: { name: 'Hip hinge' },
    referenceProfileId: 'profile',
    referenceVersion: 1,
    featureDefinitionsVersion: 'hinge-geometry-v1',
    pattern: 'HINGE',
    quality: {
      minimumVisibility: 0.5,
      minimumPresence: 0.5,
      stableReadyMs: 500,
      maximumPoseGapMs: 250,
    },
    cuePolicy: { dwellMs: 500, cooldownMs: 4000, maximumAgeMs: 250 },
    limitations: 'Reference target only',
    id: 'config',
    version: 1,
    view: 'SIDE_LEFT',
    reviewRequired: true,
    selectedRegions: ['HIPS'],
    selectedFeatures: ['hipAngleDeg'],
    capability: {
      code: 'HINGE_SIDE_V1',
      driver: 'hipAngleDeg',
      coordinateSpace: 'ASPECT_CORRECTED_IMAGE',
      phases: ['READY', 'HINGING', 'HINGE_TRANSITION', 'EXTENDING', 'COMPLETION'],
      viewClassifier: {
        pureSideWidth: 0.18,
        obliqueSideWidth: 0.62,
        obliqueFrontWidth: 0.9,
        minimumSideDepth: 0.08,
        frontDepth: 0.1,
      },
      label: 'Hip hinge',
      requiredRegions: ['HIPS'],
      featureGeometry: { hipAngleDeg: { kind: 'ANGLE', joints: ['Shoulder', 'Hip', 'Knee'] } },
    },
    segmentation: {
      driver: 'hipAngleDeg',
      extendedAngle: 170,
      flexedAngle: 70,
      startProgress: 0.2,
      returnProgress: 0.12,
      peakProgress: 0.65,
      completionHoldMs: 150,
      minimumRepMs: 1000,
      maximumRepMs: 10000,
      minimumUsableRatio: 0.8,
    },
    rules: [
      {
        code: 'TARGET',
        feature: 'hipAngleDeg',
        enabled: false,
        lower: 70,
        upper: 170,
        phases: ['HINGING'],
        cue: 'Match the reference target',
        evidence: 'Observed GOOD range',
        scope: 'REFERENCE_RELATIVE_TARGET',
      },
    ],
  };
  const exercise = {
    id: 'exercise',
    name: 'Hip hinge',
    isActive: true,
    movementPatternCode: 'HINGE',
  };
  const summary = { id: 'reference', exerciseId: 'exercise', pattern: 'HINGE', status: 'ACTIVE' };
  mocks.list.mockResolvedValue([summary]);
  mocks.detail.mockResolvedValue({
    ...summary,
    sources: [],
    profiles: [
      {
        id: 'profile',
        version: 1,
        view: 'SIDE_LEFT',
        status: 'ACTIVE',
        qualitySummary: {},
        acceptedRepCount: 4,
        acceptedVideoCount: 1,
      },
    ],
  });
  mocks.get.mockImplementation((path: string) => {
    if (path.endsWith('/exercises')) return Promise.resolve([exercise]);
    if (path.endsWith('/configurations'))
      return Promise.resolve([{ id: 'config', version: 1, status: 'DRAFT', configuration }]);
    return Promise.resolve([]);
  });
  mocks.put.mockResolvedValue({});
  render(<RuntimeAdminWorkspace />);
  fireEvent.click(await screen.findByRole('button', { name: /Hip hinge HINGE/ }));
  const publish = await screen.findByRole('button', { name: 'Publish live configuration' });
  expect(publish).toBeDisabled();
  expect(screen.getByText(/ACTIVE/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('checkbox', { name: /Observed envelope/ }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Visual review note' }), {
    target: {
      value: 'Verified body regions against the supplied GOOD footage; reference target only.',
    },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Confirm reviewed configuration' }));
  await waitFor(() =>
    expect(mocks.put).toHaveBeenCalledWith(
      '/admin/movement-runtime/configurations/config/review',
      expect.objectContaining({
        features: ['hipAngleDeg'],
        enabledRules: ['TARGET'],
        regions: ['HIPS'],
      }),
    ),
  );
  expect(mocks.post).not.toHaveBeenCalled();
});
