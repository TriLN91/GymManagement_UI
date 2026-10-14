import { describe, expect, it } from 'vitest';

import type { ReferenceSetDto, ReferenceSetProfileDto, ReferenceSetSourceDto } from '../api/types';

import {
  countSourceOutcomes,
  getContributingSourceIds,
  getSourceOperationalOutcome,
  getViewReferenceStates,
  rollUpExerciseState,
  selectProfilesForView,
} from './presentation';

const source = (patch: Partial<ReferenceSetSourceDto> = {}): ReferenceSetSourceDto => ({
  id: 'source-1',
  fileName: 'good.mp4',
  detectedView: 'SIDE',
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

const profile = (
  version: number,
  status: ReferenceSetProfileDto['status'],
  view = 'SIDE',
): ReferenceSetProfileDto => ({
  id: `${view}-${version}`,
  version,
  view,
  status,
  sourceVideoCount: 2,
  acceptedVideoCount: 2,
  acceptedRepCount: 8,
  aggregateProfile: {},
  normalizedReference: {},
  qualitySummary: {},
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

describe('movement reference presentation selectors', () => {
  it('maps each source to one operational outcome', () => {
    expect(getSourceOperationalOutcome(source())).toBe('USABLE');
    expect(getSourceOperationalOutcome(source({ action: 'DOWN_WEIGHT' }))).toBe('USABLE_REDUCED');
    expect(getSourceOperationalOutcome(source({ action: 'EXCLUDE' }))).toBe('EXCLUDED');
    expect(getSourceOperationalOutcome(source({ decision: 'AMBIGUOUS' }))).toBe('NEEDS_REVIEW');
    expect(getSourceOperationalOutcome(source({ processingStatus: 'FAILED' }))).toBe('FAILED');
  });

  it('counts down-weighted footage as usable and separates excluded and failed footage', () => {
    expect(
      countSourceOutcomes([
        source(),
        source({ id: 'down', action: 'DOWN_WEIGHT' }),
        source({ id: 'excluded', action: 'EXCLUDE' }),
        source({ id: 'failed', processingStatus: 'FAILED' }),
      ]),
    ).toEqual({ usable: 2, needsReview: 0, excluded: 1, failed: 1, analyzing: 0 });
  });

  it.each(['REVIEW_REQUIRED', 'CONFIRMED'] as const)(
    'marks ACTIVE plus a newer %s version as UPDATE_READY',
    (status) => {
      const [view] = getViewReferenceStates(
        set({ profiles: [profile(1, 'ACTIVE'), profile(2, status)] }),
      );
      expect(view).toBeDefined();
      if (!view) throw new Error('Expected SIDE view state');
      expect(view.state).toBe('UPDATE_READY');
      expect(view.liveProfile?.version).toBe(1);
      expect(view.currentCandidate?.version).toBe(2);
    },
  );

  it('selects the newest candidate and leaves older versions in history', () => {
    const selected = selectProfilesForView([
      profile(2, 'REVIEW_REQUIRED'),
      profile(1, 'ACTIVE'),
      profile(3, 'CONFIRMED'),
    ]);
    expect(selected.currentCandidate?.version).toBe(3);
    expect(selected.liveProfile?.version).toBe(1);
    expect(selected.history.map((item) => item.version)).toEqual([2]);
  });

  it('rolls two different view states up to the state needing attention', () => {
    const referenceSet = set({
      profiles: [profile(1, 'ACTIVE'), profile(1, 'REVIEW_REQUIRED', 'OBLIQUE_SIDE')],
      sources: [source(), source({ id: 'oblique', detectedView: 'OBLIQUE_SIDE' })],
    });
    expect(getViewReferenceStates(referenceSet).map((view) => view.state)).toEqual([
      'READY_TO_APPROVE',
      'LIVE',
    ]);
    expect(rollUpExerciseState(referenceSet)).toBe('READY_TO_APPROVE');
  });

  it('does not let a live view hide unassigned footage that is still analyzing', () => {
    expect(
      rollUpExerciseState(
        set({
          profiles: [profile(1, 'ACTIVE')],
          sources: [
            source(),
            source({
              id: 'pending',
              detectedView: null,
              processingStatus: 'PROCESSING',
              decision: null,
              action: null,
            }),
          ],
        }),
      ),
    ).toBe('ANALYZING');
  });

  it('extracts contributing footage IDs from nested aggregate data', () => {
    const candidate = profile(2, 'REVIEW_REQUIRED');
    candidate.aggregateProfile = { audit: { sourceReferenceIds: ['source-1', 'source-2'] } };
    expect(getContributingSourceIds(candidate)).toEqual(['source-1', 'source-2']);
  });
});
