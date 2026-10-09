import { describe, expect, it } from 'vitest';

import type { ReferenceSetDto, ReferenceSetSourceDto } from '../api/types';

import { getWorkflowGuidance, sourceDescriptionKey } from './workflow';

const source = (patch: Partial<ReferenceSetSourceDto> = {}): ReferenceSetSourceDto => ({
  id: 'source-1',
  fileName: 'good.mp4',
  processingStatus: 'PROCESSED',
  acceptedRepCount: 4,
  rejectedRepCount: 0,
  decision: 'CLEAR_ACCEPT',
  action: 'KEEP',
  dataQuality: {},
  deterministicEvidence: {},
  warnings: [],
  ...patch,
});

const set = (patch: Partial<ReferenceSetDto> = {}): ReferenceSetDto => ({
  id: 'set-1',
  exerciseId: 'exercise-1',
  exerciseName: 'Back Squat',
  pattern: 'SQUAT',
  status: 'PROCESSING',
  sources: [],
  profiles: [],
  ...patch,
});

describe('movement reference workflow guidance', () => {
  it('guides an empty set to upload and failed sources to inspection/replacement', () => {
    expect(getWorkflowGuidance(set()).nextAction).toBe('UPLOAD_SOURCE');
    expect(
      getWorkflowGuidance(set({ sources: [source({ processingStatus: 'FAILED' })] })).nextAction,
    ).toBe('INSPECT_FAILURE');
  });

  it('uses backend profile state for confirm, activate and live guidance', () => {
    const profile = {
      id: 'profile-1',
      version: 1,
      view: 'SIDE',
      sourceVideoCount: 1,
      acceptedVideoCount: 1,
      acceptedRepCount: 4,
      aggregateProfile: {},
      normalizedReference: {},
      qualitySummary: {},
    };
    expect(
      getWorkflowGuidance(
        set({ profiles: [{ ...profile, status: 'REVIEW_REQUIRED' }], sources: [source()] }),
      ).nextAction,
    ).toBe('CONFIRM_PROFILE');
    expect(
      getWorkflowGuidance(set({ profiles: [{ ...profile, status: 'CONFIRMED' }] })).nextAction,
    ).toBe('ACTIVATE_PROFILE');
    expect(
      getWorkflowGuidance(set({ profiles: [{ ...profile, status: 'ACTIVE' }] })).nextAction,
    ).toBe('LIVE');
  });

  it('describes source decisions in operational language', () => {
    expect(sourceDescriptionKey(source())).toBe('sourceDescription.accepted');
    expect(sourceDescriptionKey(source({ decision: 'CLEAR_REJECT', action: 'EXCLUDE' }))).toBe(
      'sourceDescription.excluded',
    );
    expect(sourceDescriptionKey(source({ decision: 'AMBIGUOUS', action: 'REQUIRES_REVIEW' }))).toBe(
      'sourceDescription.review',
    );
  });
});
