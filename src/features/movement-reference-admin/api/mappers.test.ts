import { describe, expect, it } from 'vitest';

import { mapExercise, mapReferenceSet, mapReferenceSetSummary } from './mappers';

describe('movement reference DTO mappers', () => {
  it('maps the backend exercise entity without leaking audit fields', () => {
    expect(
      mapExercise({
        id: 'exercise-1',
        name: 'Back Squat',
        muscleGroup: 'Legs',
        isActive: true,
        createdAtUtc: 'ignored',
      }),
    ).toEqual({
      id: 'exercise-1',
      name: 'Back Squat',
      muscleGroup: 'Legs',
      equipment: null,
      difficultyLevel: null,
      instructions: null,
      isActive: true,
    });
  });

  it('maps summary counts and preserves lifecycle enums', () => {
    expect(
      mapReferenceSetSummary({
        id: 'set-1',
        exerciseId: 'exercise-1',
        exerciseName: 'Back Squat',
        pattern: 'SQUAT',
        status: 'ACTIVE',
        sourceCount: 3,
        profileCount: 2,
        activeProfileCount: 1,
        createdAtUtc: '2026-10-09T00:00:00Z',
      }),
    ).toMatchObject({ status: 'ACTIVE', sourceCount: 3, activeProfileCount: 1 });
  });

  it('keeps processing, decision and action as independent source fields', () => {
    const mapped = mapReferenceSet({
      id: 'set-1',
      exerciseId: 'exercise-1',
      exerciseName: 'Back Squat',
      pattern: 'SQUAT',
      status: 'REVIEW_REQUIRED',
      sources: [
        {
          id: 'source-1',
          fileName: 'good.mp4',
          processingStatus: 'PROCESSED',
          decision: 'AMBIGUOUS',
          action: 'REQUIRES_REVIEW',
          acceptedRepCount: 4,
          rejectedRepCount: 1,
          dataQuality: { usable: true },
          deterministicEvidence: { outlier: true },
          warnings: [],
        },
      ],
      profiles: [],
    });
    expect(mapped.sources[0]).toMatchObject({
      processingStatus: 'PROCESSED',
      decision: 'AMBIGUOUS',
      action: 'REQUIRES_REVIEW',
    });
  });
});
