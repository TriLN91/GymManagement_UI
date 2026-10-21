import { http, HttpResponse } from 'msw';

import { adminRegistrationHandlers } from './adminRegistrations';
import { appointmentHandlers } from './appointments';
import { assignmentHandlers } from './assignments';
import { assistantHandlers } from './assistant';
import { authHandlers } from './auth';
import { sampleCoachingPlan } from './coaching';
import { fitnessHandlers } from './fitness';
import { gymOwnerHandlers } from './gymOwner';
import { marketplaceReviewHandlers } from './marketplaceReview';
import { movementReferenceHandlers } from './movementReferences';
import { notificationHandlers } from './notifications';
import { planFeedbackHandlers } from './planFeedback';
import { staffInvitationHandlers } from './staffInvitations';
import { studioHandlers } from './studio';
import { trainerHandlers } from './trainers';
import { trainerServiceHandlers } from './trainerServices';
import { workoutHandlers } from './workouts';

import { ENDPOINTS } from '@/shared/api/endpoints';

// Wildcard patterns so MSW intercepts regardless of baseURL (cross-origin dev server).
const path = (p: string) => `*${p}`;

export const handlers = [
  ...trainerHandlers,
  ...studioHandlers,
  ...workoutHandlers,
  ...authHandlers,
  ...adminRegistrationHandlers,
  ...assignmentHandlers,
  ...appointmentHandlers,
  ...gymOwnerHandlers,
  ...notificationHandlers,
  ...marketplaceReviewHandlers,
  ...planFeedbackHandlers,
  ...staffInvitationHandlers,
  ...trainerServiceHandlers,
  ...fitnessHandlers,
  ...movementReferenceHandlers,
  ...assistantHandlers,

  http.get(path(ENDPOINTS.coaching.plan), () => HttpResponse.json({ data: sampleCoachingPlan })),

  http.post(path(ENDPOINTS.coaching.checkin), async ({ request }) => {
    const payload = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ data: { id: 'checkin-001', ...payload } }, { status: 201 });
  }),
];
