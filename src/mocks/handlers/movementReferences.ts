import { http, HttpResponse } from 'msw';

import type {
  ExerciseDto,
  ReferenceSetDto,
  ReferenceSetProfileDto,
} from '@/features/movement-reference-admin/api/types';
import { ENDPOINTS } from '@/shared/api/endpoints';

const exercises: ExerciseDto[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Back Squat',
    muscleGroup: 'Lower body',
    equipment: 'Barbell',
    difficultyLevel: 'Intermediate',
    instructions: null,
    isActive: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Bodyweight Squat',
    muscleGroup: 'Lower body',
    equipment: 'Bodyweight',
    difficultyLevel: 'Beginner',
    instructions: null,
    isActive: true,
  },
];

const referenceSets: ReferenceSetDto[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    exerciseId: exercises[0]!.id,
    exerciseName: exercises[0]!.name,
    pattern: 'SQUAT',
    status: 'REVIEW_REQUIRED',
    sources: [
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        fileName: 'back-squat-good-side.mp4',
        detectedView: 'SIDE',
        detectedViewConfidence: 0.96,
        processingStatus: 'PROCESSED',
        acceptedRepCount: 5,
        rejectedRepCount: 1,
        decision: 'CLEAR_ACCEPT',
        action: 'KEEP',
        reviewReason: 'Stable repetitions and compatible view.',
        dataQuality: { usableFrameRatio: 0.94, validRepCount: 5 },
        deterministicEvidence: { medianDistance: 0.18, outlier: false },
        adjudication: null,
        warnings: [],
        failureMessage: null,
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        fileName: 'back-squat-review.mp4',
        detectedView: 'SIDE',
        detectedViewConfidence: 0.71,
        processingStatus: 'PROCESSED',
        acceptedRepCount: 3,
        rejectedRepCount: 2,
        decision: 'AMBIGUOUS',
        action: 'REQUIRES_REVIEW',
        reviewReason: 'Borderline video-level outlier evidence.',
        dataQuality: { usableFrameRatio: 0.78, validRepCount: 3 },
        deterministicEvidence: { medianDistance: 0.63, outlier: true },
        adjudication: {
          status: 'COMPLETED',
          choice: 'KEEP',
          confidence: 0.67,
          probabilityDistribution: { KEEP: 0.67, EXCLUDE: 0.33 },
          topChoiceMargin: 0.34,
          latencyMs: 245,
          model: 'mock-governance',
          governanceOutcome: 'REQUIRES_REVIEW',
          governanceReason: 'Confidence is below automatic acceptance threshold.',
        },
        warnings: ['Review camera stability before confirmation.'],
        failureMessage: null,
      },
    ],
    profiles: [
      {
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        version: 1,
        view: 'SIDE',
        status: 'REVIEW_REQUIRED',
        sourceVideoCount: 2,
        acceptedVideoCount: 1,
        acceptedRepCount: 5,
        aggregateProfile: {},
        normalizedReference: {},
        qualitySummary: { readiness: 'READY_FOR_REVIEW', warningCount: 1 },
      },
    ],
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    exerciseId: exercises[1]!.id,
    exerciseName: exercises[1]!.name,
    pattern: 'SQUAT',
    status: 'ACTIVE',
    sources: [],
    profiles: [
      {
        id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        version: 1,
        view: 'OBLIQUE_SIDE',
        status: 'ACTIVE',
        sourceVideoCount: 3,
        acceptedVideoCount: 3,
        acceptedRepCount: 14,
        aggregateProfile: {},
        normalizedReference: {},
        qualitySummary: { readiness: 'ACTIVE' },
      },
    ],
  },
];

const summary = (set: ReferenceSetDto) => ({
  id: set.id,
  exerciseId: set.exerciseId,
  exerciseName: set.exerciseName,
  pattern: set.pattern,
  status: set.status,
  sourceCount: set.sources.length,
  profileCount: set.profiles.length,
  activeProfileCount: set.profiles.filter((profile) => profile.status === 'ACTIVE').length,
  createdAtUtc: '2026-10-09T08:00:00Z',
  updatedAtUtc: '2026-10-09T09:00:00Z',
});

const findSet = (id: string) => referenceSets.find((set) => set.id === id);

export const movementReferenceHandlers = [
  http.get(`*${ENDPOINTS.exercises.list}`, () => HttpResponse.json(exercises)),
  http.post(`*${ENDPOINTS.exercises.create}`, async ({ request }) => {
    const body = (await request.json()) as {
      name?: string;
      muscleGroup?: string;
      equipment?: string;
    };
    const exercise: ExerciseDto = {
      id: crypto.randomUUID(),
      name: body.name ?? '',
      muscleGroup: body.muscleGroup,
      equipment: body.equipment,
      isActive: true,
    };
    exercises.push(exercise);
    return HttpResponse.json(exercise);
  }),
  http.get(`*${ENDPOINTS.referenceSets.list}`, ({ request }) => {
    const exerciseId = new URL(request.url).searchParams.get('exerciseId');
    return HttpResponse.json(
      referenceSets.filter((set) => !exerciseId || set.exerciseId === exerciseId).map(summary),
    );
  }),
  http.post(`*${ENDPOINTS.referenceSets.list}`, async ({ request }) => {
    const body = (await request.json()) as { exerciseId?: string; pattern?: string };
    const existing = referenceSets.find(
      (set) => set.exerciseId === body.exerciseId && set.pattern === body.pattern,
    );
    if (existing) return HttpResponse.json(existing);
    const exercise = exercises.find((item) => item.id === body.exerciseId);
    if (!exercise)
      return HttpResponse.json(
        { code: 'EXERCISE_NOT_FOUND', message: 'Active exercise was not found.' },
        { status: 404 },
      );
    const created: ReferenceSetDto = {
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      pattern: 'SQUAT',
      status: 'PROCESSING',
      sources: [],
      profiles: [],
    };
    referenceSets.unshift(created);
    return HttpResponse.json(created);
  }),
  http.get('*/admin/reference-sets/:setId', ({ params }) => {
    const set = findSet(String(params.setId));
    return set
      ? HttpResponse.json(set)
      : HttpResponse.json(
          { code: 'REFERENCE_SET_NOT_FOUND', message: 'Reference set was not found.' },
          { status: 404 },
        );
  }),
  http.post('*/admin/reference-sets/:setId/sources', async ({ params, request }) => {
    const set = findSet(String(params.setId));
    if (!set)
      return HttpResponse.json(
        { code: 'REFERENCE_SET_NOT_FOUND', message: 'Reference set was not found.' },
        { status: 404 },
      );
    const form = await request.formData();
    const video = form.get('video');
    if (!(video instanceof File) || video.size === 0)
      return HttpResponse.json(
        { code: 'INVALID_VIDEO', message: 'Reference video is empty.' },
        { status: 400 },
      );
    set.sources.push({
      id: crypto.randomUUID(),
      fileName: video.name,
      detectedView: 'SIDE',
      detectedViewConfidence: 0.93,
      processingStatus: 'PROCESSED',
      acceptedRepCount: 4,
      rejectedRepCount: 0,
      decision: 'CLEAR_ACCEPT',
      action: 'KEEP',
      reviewReason: 'Compatible with the current source group.',
      dataQuality: { usableFrameRatio: 0.92 },
      deterministicEvidence: { outlier: false },
      adjudication: null,
      warnings: [],
      failureMessage: null,
    });
    const latestVersion = Math.max(
      0,
      ...set.profiles
        .filter((profile) => profile.view === 'SIDE')
        .map((profile) => profile.version),
    );
    set.profiles.push({
      id: crypto.randomUUID(),
      version: latestVersion + 1,
      view: 'SIDE',
      status: 'REVIEW_REQUIRED',
      sourceVideoCount: set.sources.length,
      acceptedVideoCount: set.sources.filter((source) => source.action === 'KEEP').length,
      acceptedRepCount: set.sources.reduce((total, source) => total + source.acceptedRepCount, 0),
      aggregateProfile: {},
      normalizedReference: {},
      qualitySummary: { readiness: 'READY_FOR_REVIEW' },
    });
    set.status = 'REVIEW_REQUIRED';
    return HttpResponse.json(set);
  }),
  http.post('*/admin/reference-sets/:setId/profiles/:profileId/confirm', ({ params }) =>
    changeProfile(params, 'CONFIRMED'),
  ),
  http.post('*/admin/reference-sets/:setId/profiles/:profileId/activate', ({ params }) =>
    changeProfile(params, 'ACTIVE'),
  ),
];

function changeProfile(
  params: Record<string, string | readonly string[] | undefined>,
  next: 'CONFIRMED' | 'ACTIVE',
) {
  const set = findSet(String(params.setId));
  const profile = set?.profiles.find((item) => item.id === String(params.profileId));
  if (!set || !profile)
    return HttpResponse.json(
      {
        code: 'REFERENCE_PROFILE_NOT_FOUND',
        message: 'Aggregate reference profile was not found.',
      },
      { status: 404 },
    );
  const allowed =
    next === 'CONFIRMED' ? profile.status === 'REVIEW_REQUIRED' : profile.status === 'CONFIRMED';
  if (!allowed)
    return HttpResponse.json(
      {
        code: 'INVALID_REFERENCE_PROFILE_TRANSITION',
        message:
          next === 'CONFIRMED'
            ? 'Only review-required profiles can be confirmed.'
            : 'Only confirmed profiles can be activated.',
      },
      { status: 409 },
    );
  if (next === 'ACTIVE')
    set.profiles
      .filter((item) => item.view === profile.view && item.status === 'ACTIVE')
      .forEach((item) => {
        item.status = 'CONFIRMED';
      });
  profile.status = next;
  set.status = next;
  return HttpResponse.json(profile satisfies ReferenceSetProfileDto);
}
