import { http, HttpResponse } from 'msw';

import type {
  CreateGymTrainerRequest,
  GymTrainerOverviewDto,
} from '@/features/marketplace/api/marketplaceApi';
const key = 'fitflex:mock-trainers';
const list = (): GymTrainerOverviewDto[] =>
  JSON.parse(localStorage.getItem(key) ?? '[]') as GymTrainerOverviewDto[];
const ok = (data: unknown) =>
  HttpResponse.json({ isSuccess: true, message: 'Mock trainer API', data });
export const trainerHandlers = [
  // Read model used by the CF04 assignment screen (backend: GET /gym-owner/trainers).
  http.get('*/gym-owner/trainers', () =>
    ok(
      list().map((t) => ({
        userId: t.userId,
        trainerProfileId: t.trainerProfileId,
        email: t.email,
        fullName: t.fullName,
        phoneNumber: null,
        gymId: 'brand-main',
        gymName: 'Fit Central',
        status: t.isActive ? 'Active' : 'Disabled',
        yearsOfExperience: t.yearsOfExperience,
        hourlyRate: null,
      })),
    ),
  ),
  http.get('*/gym-owner/trainers/overview', () => {
    const trainers = list();
    return ok({
      totalTrainers: trainers.length,
      activeTrainers: trainers.filter((t) => t.isActive).length,
      incompleteProfilesCount: trainers.filter((t) => !t.isProfileComplete).length,
      topBookedTrainer: null,
      trainers,
    });
  }),
  http.get('*/marketplace/brands/:id/branches', () =>
    ok([
      {
        id: 'branch-main',
        branchName: 'Fit Central District 1',
        addressLine1: '12 Nguyen Hue',
        city: 'Ho Chi Minh City',
        isActive: true,
      },
    ]),
  ),
  http.post('*/gym-owner/trainers', async ({ request }) => {
    const body = (await request.json()) as CreateGymTrainerRequest;
    const trainers = list();
    if (trainers.some((t) => t.email === body.email))
      return HttpResponse.json(
        {
          isSuccess: false,
          message: 'Email already exists',
          errorCode: 'DuplicateConflict',
          data: null,
        },
        { status: 409 },
      );
    const trainer: GymTrainerOverviewDto = {
      trainerProfileId: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      fullName: body.fullName,
      email: body.email,
      yearsOfExperience: 0,
      isActive: true,
      isProfileComplete: false,
      averageRating: 0,
      activeClientsCount: 0,
      completedSessionsCount: 0,
      scheduledSessionsCount: 0,
      assignedBranches: [{ branchId: body.branchId, branchName: 'Fit Central District 1' }],
    };
    trainers.push(trainer);
    localStorage.setItem(key, JSON.stringify(trainers));
    return ok({
      ...trainer,
      temporaryPassword: 'MockOnly-Temp1!',
      primaryBranchName: 'Fit Central District 1',
      assignedBranchIds: [body.branchId],
    });
  }),
];
