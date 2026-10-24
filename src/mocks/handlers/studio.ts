import { http, HttpResponse } from 'msw';

import seed from '../fixtures/studio.json';

import type {
  RuntimeConfiguration,
  RuntimeVersion,
} from '@/features/movement-reference-admin/api/runtimeTypes';
const config = seed.configuration as RuntimeConfiguration;
const exercise = {
  id: config.exerciseId,
  name: 'Hip hinge',
  pattern: 'HINGE',
  muscleGroup: 'Hips',
  equipment: 'Bodyweight',
  instructions: 'Hinge and return upright.',
  difficultyLevel: 'Beginner',
  isActive: true,
  metadataRevision: 1,
  targetMuscles: config.targetMuscles,
};
const collectionId = '40000000-0000-4000-8000-000000000001';
const sourceId = seed.evidence.sourceReferenceId;
type State = {
  note?: string;
  confirmed: boolean;
  referenceActive: boolean;
  reviewed: boolean;
  published: boolean;
};
const load = (): State =>
  JSON.parse(
    localStorage.getItem('fitflex:mock-studio') ??
      '{"confirmed":false,"referenceActive":false,"reviewed":false,"published":false}',
  ) as State;
const save = (s: State) => localStorage.setItem('fitflex:mock-studio', JSON.stringify(s));
const ok = (data: unknown) =>
  HttpResponse.json({ isSuccess: true, message: 'Mock Studio API', data });
const fail = () =>
  HttpResponse.json(
    {
      isSuccess: false,
      message: 'Review and confirm the reference first.',
      errorCode: 'ReferenceNotReady',
      data: null,
    },
    { status: 400 },
  );
const version = (): RuntimeVersion => ({
  id: config.id,
  exerciseId: config.exerciseId,
  referenceProfileId: config.referenceProfileId,
  referenceSetId: collectionId,
  version: 1,
  view: config.view,
  status: load().published ? 'PUBLISHED' : 'DRAFT',
  reviewNote: load().reviewed ? load().note : undefined,
  configuration: {
    ...config,
    reviewRequired: !load().reviewed,
    assessmentDefinition: config.assessmentDefinition
      ? { ...config.assessmentDefinition, status: load().reviewed ? 'REVIEWED' : 'DRAFT' }
      : undefined,
  },
});
function reference() {
  const s = load();
  return {
    id: collectionId,
    exerciseId: config.exerciseId,
    exerciseName: exercise.name,
    pattern: 'HINGE',
    status: s.referenceActive ? 'ACTIVE' : s.confirmed ? 'CONFIRMED' : 'REVIEW_REQUIRED',
    sources: [
      {
        id: sourceId,
        fileName: 'mock-hip-hinge-side.mp4',
        detectedView: 'SIDE_LEFT',
        detectedViewConfidence: 0.96,
        processingStatus: 'PROCESSED',
        acceptedRepCount: 4,
        rejectedRepCount: 0,
        decision: 'CLEAR_ACCEPT',
        action: 'KEEP',
        reviewReason: 'Controlled fixture',
        dataQuality: { usableFrameRatio: 0.95 },
        deterministicEvidence: {},
        adjudication: null,
        warnings: [],
        failureMessage: null,
      },
    ],
    profiles: [
      {
        id: config.referenceProfileId,
        version: 1,
        view: config.view,
        status: s.referenceActive ? 'ACTIVE' : s.confirmed ? 'CONFIRMED' : 'REVIEW_REQUIRED',
        sourceReferenceIds: [sourceId],
        sourceVideoCount: 1,
        acceptedVideoCount: 1,
        acceptedRepCount: 4,
        aggregateProfile: {},
        normalizedReference: {},
        qualitySummary: {},
      },
    ],
  };
}
export const studioHandlers = [
  http.get('*/admin/movement-runtime/exercises', () => ok([exercise])),
  http.get('*/admin/movement-runtime/metadata-catalog', () =>
    ok({ equipment: ['Bodyweight'], muscleGroups: ['Hips'] }),
  ),
  http.get('*/admin/movement-runtime/capabilities', () =>
    ok([{ ...config.capability, pattern: 'HINGE', available: true, views: [config.view] }]),
  ),
  http.get('*/admin/movement-runtime/readiness', () =>
    ok([
      {
        id: config.id,
        exerciseId: config.exerciseId,
        status: load().published ? 'PUBLISHED' : 'DRAFT',
        version: 1,
        view: config.view,
        available: load().published,
      },
    ]),
  ),
  http.get('*/admin/movement-runtime/configurations', () => ok([version()])),
  http.get('*/admin/movement-runtime/exercises/:id/history', () => ok([])),
  http.get('*/admin/reference-jobs', () => ok([])),
  http.get('*/admin/reference-sets', () =>
    ok([
      {
        id: collectionId,
        exerciseId: config.exerciseId,
        exerciseName: exercise.name,
        pattern: 'HINGE',
        status: reference().status,
        sourceCount: 1,
        profileCount: 1,
        activeProfileCount: load().referenceActive ? 1 : 0,
        createdAtUtc: '2026-10-20T01:00:00Z',
      },
    ]),
  ),
  http.get('*/admin/reference-sets/:id', () => ok(reference())),
  http.get('*/admin/movement-runtime/sources/:id/evidence', () => ok(seed.evidence)),
  http.get(
    '*/admin/movement-runtime/sources/:id/video',
    () =>
      new HttpResponse(
        new Uint8Array(
          atob(seed.videoBase64)
            .split('')
            .map((c) => c.charCodeAt(0)),
        ),
        { headers: { 'Content-Type': 'video/webm' } },
      ),
  ),
  http.post('*/admin/reference-sets/:set/profiles/:profile/confirm', () => {
    const s = load();
    s.confirmed = true;
    save(s);
    return ok(reference().profiles[0]);
  }),
  http.post('*/admin/reference-sets/:set/profiles/:profile/activate', () => {
    const s = load();
    if (!s.confirmed) return fail();
    s.referenceActive = true;
    save(s);
    return ok(reference().profiles[0]);
  }),
  http.put('*/admin/movement-runtime/configurations/:id/review', async ({ request }) => {
    const body = (await request.json()) as {
      note: string;
      features: string[];
      criteria?: unknown[];
      mobileRuntimeSchema?: string;
    };
    if (
      !body.note?.trim() ||
      !body.features?.length ||
      !body.criteria?.length ||
      body.mobileRuntimeSchema !== 'movement-runtime-v3'
    )
      return fail();
    const s = load();
    s.reviewed = true;
    s.note = body.note;
    save(s);
    return ok(version());
  }),
  http.post('*/admin/movement-runtime/configurations/:id/publish', () => {
    const s = load();
    if (!s.reviewed || !s.referenceActive) return fail();
    s.published = true;
    save(s);
    return ok(version());
  }),
];
