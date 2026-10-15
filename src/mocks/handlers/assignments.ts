import { http, HttpResponse } from 'msw';

import { ENDPOINTS } from '@/shared/api/endpoints';

// Mirrors CoachingController GET me/assignments and GET members/{id}/profile for a Trainer.
const path = (p: string) => `*${p}`;

const ok = (data: unknown) =>
  HttpResponse.json({ isSuccess: true, message: '200: OK', data }, { status: 200 });

const base = {
  trainerProfileId: 'tp-demo',
  trainerName: 'Paolo Trainer',
  canReadFitness: true,
  canManageWorkout: true,
};

const assignments = [
  {
    ...base,
    id: 'as-1',
    memberProfileId: 'mp-ari',
    memberName: 'Ari Nguyen',
    status: 'Active',
    startsAtUtc: '2026-09-15T00:00:00.000Z',
    endsAtUtc: '2026-12-15T00:00:00.000Z',
    isCurrent: true,
    canManageNutrition: true,
  },
  {
    ...base,
    id: 'as-2',
    memberProfileId: 'mp-linh',
    memberName: 'Linh Tran',
    status: 'Active',
    startsAtUtc: '2026-10-01T00:00:00.000Z',
    endsAtUtc: '2026-11-30T00:00:00.000Z',
    isCurrent: true,
    canManageNutrition: false,
  },
  {
    ...base,
    id: 'as-3',
    memberProfileId: 'mp-old',
    memberName: 'Bao Le',
    status: 'Ended',
    startsAtUtc: '2026-05-01T00:00:00.000Z',
    endsAtUtc: '2026-08-01T00:00:00.000Z',
    isCurrent: false,
    canReadFitness: false,
    canManageNutrition: false,
  },
];

export const assignmentHandlers = [
  http.get(path(ENDPOINTS.coaching.me.assignments), () => ok(assignments)),

  http.get(path('/coaching/members/:memberProfileId/profile'), ({ params }) => {
    const found = assignments.find((item) => item.memberProfileId === params.memberProfileId);
    if (!found?.canReadFitness) {
      return HttpResponse.json(
        { isSuccess: false, message: '403: Forbidden', data: null, errorCode: 'Forbidden' },
        { status: 403 },
      );
    }
    return ok({
      memberProfileId: found.memberProfileId,
      revision: 3,
      goal: {
        goalType: 'MuscleGain',
        description: 'muscle_gain, strength',
        targetWeightKg: 72,
        targetDate: '2026-12-31',
      },
      training: {
        experienceLevel: 'intermediate',
        weeklyWorkoutDays: 4,
        sessionDurationMinutes: 60,
        equipmentAccess: 'Bodyweight',
        hasLimitations: true,
        limitationNotes: 'Lower body injury',
      },
      nutrition: null,
      missingWorkoutInput: [],
      missingNutritionInput: [],
    });
  }),
];
