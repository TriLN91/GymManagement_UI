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
  const { rerender, unmount } = render(<ConfigurationReview {...props} />);
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
  unmount();
  const v2 = render(
    <ConfigurationReview
      {...props}
      chosen={{
        ...chosen,
        configuration: {
          ...configuration,
          schemaVersion: 'movement-runtime-v3',
          assessmentPolicy: {
            version: 'motion-comparison-v1',
            coverageUnit: 'ELAPSED_TIME',
            minimumComparisonRatio: 0.8,
            referenceMeaning: 'DESCRIPTIVE_ENVELOPE',
            biomechanicalFaultDetection: false,
          },
          referenceSupport: {
            acceptedVideoCount: 1,
            acceptedRepCount: 4,
            featureDefinitionsVersion: 'hinge-geometry-v1',
            meaning: 'DESCRIPTIVE_GOOD_REFERENCE_NOT_VALIDATED_FAULT_BOUNDARIES',
          },
          assessmentPlan: {
            version: 'focused-assessment-v1',
            availableFeatures: ['hipAngleDeg'],
            trackingFeatures: ['hipAngleDeg'],
            requiredJoints: ['Shoulder', 'Hip', 'Knee'],
            requiredRegions: ['SHOULDERS', 'HIPS', 'KNEES'],
            referenceAspectRatio: 16 / 9,
            viewStabilityMs: 500,
            featureRoles: [
              { feature: 'hipAngleDeg', roles: ['TRACKING', 'REP_PHASE', 'RECORDED_REVIEW'] },
            ],
          },
          rules: configuration.rules.map((rule) => ({
            ...rule,
            delivery: 'REVIEW_ONLY',
            reviewEnabled: true,
          })),
        },
      }}
    />,
  );
  expect(screen.getByText('Assessment criteria')).toBeInTheDocument();
  expect(screen.getByText('Review only')).toBeInTheDocument();
  expect(
    screen.queryByRole('switch', { name: 'Live feedback cues: Hip angle' }),
  ).not.toBeInTheDocument();
  expect(screen.getByText(/cannot be disabled/)).toBeInTheDocument();
  expect(
    screen.getByText(/Observed across 1 GOOD clips and 4 reference cycles/),
  ).toBeInTheDocument();
  expect(screen.getByText(/Complete motion cycles remain counted/)).toHaveTextContent('80%');
  save.mockClear();
  fireEvent.change(screen.getByRole('textbox', { name: /Review note/ }), {
    target: { value: 'Approved reference comparisons and Mobile support.' },
  });
  expect(screen.getByRole('button', { name: 'Save reviewed configuration' })).toBeDisabled();
  fireEvent.click(screen.getByRole('checkbox', { name: /target Mobile build supports/ }));
  const expectation = screen.getByRole('textbox', { name: /Criterion expectation/ });
  fireEvent.change(expectation, { target: { value: '' } });
  expect(screen.getByRole('button', { name: 'Save reviewed configuration' })).toBeDisabled();
  fireEvent.change(expectation, {
    target: { value: 'Use this approved hinge reference as a descriptive comparison.' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save reviewed configuration' }));
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith(
      ['hipAngleDeg'],
      [],
      'Approved reference comparisons and Mobile support.',
      [
        {
          code: 'TARGET',
          coachingPriority: 'P3',
          reviewExplanation: configuration.rules[0]!.evidence,
          expectation: 'Use this approved hinge reference as a descriptive comparison.',
          cueBelow: 'Match the reference target',
          cueAbove: 'Match the reference target',
        },
      ],
      'movement-runtime-v3',
    ),
  );
  expect(screen.getByRole('button', { name: 'Review & publish' })).toBeDisabled();
  v2.unmount();
  const noEvidence = render(<ConfigurationReview {...props} evidenceReady={false} />);
  expect(screen.getByRole('button', { name: 'Save reviewed configuration' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: /Inspect contributing footage/ }));
  expect(props.onInspect).toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: /Add a review note/ }));
  expect(screen.getByRole('textbox', { name: /Review note/ })).toHaveFocus();
  noEvidence.unmount();
  render(
    <ConfigurationReview
      {...props}
      chosen={{
        ...chosen,
        configuration: {
          ...configuration,
          schemaVersion: 'movement-runtime-v3',
          selectedFeatures: ['hipAngleDeg', 'kneeAngleDeg'],
          assessmentPlan: {
            version: 'focused-assessment-v1',
            availableFeatures: ['hipAngleDeg', 'kneeAngleDeg'],
            trackingFeatures: ['hipAngleDeg'],
            requiredJoints: ['Hip'],
            requiredRegions: ['HIPS'],
            referenceAspectRatio: 1,
            viewStabilityMs: 500,
            featureRoles: [],
          },
          rules: [
            configuration.rules[0]!,
            {
              ...configuration.rules[0]!,
              code: 'KNEE',
              feature: 'kneeAngleDeg',
              enabled: true,
              delivery: 'LIVE_AND_REVIEW',
              coachingPriority: 'P1',
            },
          ],
        },
      }}
    />,
  );
  const optional = screen.getByRole('checkbox', { name: /Knee bend relative/ });
  fireEvent.click(optional);
  fireEvent.click(optional);
  expect(screen.getByRole('switch', { name: 'Live feedback cues: Knee angle' })).not.toBeChecked();
  expect(screen.getAllByRole('combobox', { name: /Coaching priority/ }).at(-1)).toHaveValue('P3');
});
