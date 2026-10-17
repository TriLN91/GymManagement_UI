import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import type { RuntimeConfiguration, RuntimeVersion } from '../api/runtimeTypes';

import { ConfigurationReview } from './ConfigurationReview';

import i18n from '@/i18n';

it('requires a saved review before publication and persists the supported cue choices', async () => {
  await i18n.changeLanguage('en');
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

  const chosen: RuntimeVersion = {
    id: 'config',
    exerciseId: 'exercise',
    referenceProfileId: 'profile',
    version: 1,
    view: 'SIDE_LEFT',
    status: 'DRAFT',
    configuration,
  };
  const save = vi.fn().mockResolvedValue(undefined),
    publish = vi.fn();
  const reference = {
    id: 'profile',
    version: 1,
    view: 'SIDE_LEFT',
    status: 'ACTIVE' as const,
    sourceVideoCount: 1,
    acceptedVideoCount: 1,
    acceptedRepCount: 4,
    aggregateProfile: {},
    normalizedReference: {},
    qualitySummary: {},
  };
  const props = {
    chosen,
    reference,
    evidenceReady: true,
    busy: false,
    canPublish: true,
    isAvailable: false,
    onDirty: vi.fn(),
    onInspect: vi.fn(),
    onSave: save,
    onPublish: publish,
    onReject: vi.fn(),
    onNewDraft: vi.fn(),
  };
  const { rerender } = render(<ConfigurationReview {...props} />);
  expect(screen.getByRole('button', { name: 'Review & publish' })).toBeDisabled();
  fireEvent.click(screen.getByRole('switch', { name: 'Live feedback cues: Hip angle' }));
  fireEvent.change(screen.getByRole('textbox', { name: /Review note/ }), {
    target: { value: 'Verified the supplied GOOD footage; reference target only.' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save reviewed configuration' }));
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith(
      ['hipAngleDeg'],
      ['TARGET'],
      'Verified the supplied GOOD footage; reference target only.',
    ),
  );
  expect(publish).not.toHaveBeenCalled();
  rerender(
    <ConfigurationReview
      {...props}
      chosen={{
        ...chosen,
        reviewNote: 'Verified the supplied GOOD footage; reference target only.',
        configuration: {
          ...configuration,
          reviewRequired: false,
          rules: configuration.rules.map((rule) => ({ ...rule, enabled: true })),
        },
      }}
    />,
  );
  expect(screen.getByRole('button', { name: 'Review & publish' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Review & publish' }));
  expect(publish).toHaveBeenCalledOnce();
});
