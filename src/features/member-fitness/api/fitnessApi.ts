import type { MemberFitnessProfile } from '../model/profileSetupModel';

import { toBodyInput, toGoalInput, toNutritionInput, toTrainingInput } from './mappers';
import type { BodyInput, GoalInput, NutritionInput, TrainingInput } from './types';

import { apiPost, apiPut } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const fitnessApi = {
  saveGoal: (input: GoalInput) => apiPut<unknown, GoalInput>(ENDPOINTS.coaching.me.goal, input),
  saveTraining: (input: TrainingInput) =>
    apiPut<unknown, TrainingInput>(ENDPOINTS.coaching.me.trainingProfile, input),
  saveNutrition: (input: NutritionInput) =>
    apiPut<unknown, NutritionInput>(ENDPOINTS.coaching.me.nutritionProfile, input),
  addBodyCheckin: (input: BodyInput) =>
    apiPost<unknown, BodyInput>(ENDPOINTS.coaching.me.bodyCheckins, input),
};

/**
 * Pushes the parts of the wizard profile the backend knows about (goal, training, nutrition,
 * first body check-in). Incomplete sections are skipped, not sent half-filled.
 * Requests run in order so a failure leaves a predictable prefix saved.
 */
export async function syncProfileToBackend(
  profile: MemberFitnessProfile,
  now: Date = new Date(),
): Promise<{ saved: string[] }> {
  const saved: string[] = [];
  const goal = toGoalInput(profile);
  if (goal) {
    await fitnessApi.saveGoal(goal);
    saved.push('goal');
  }
  const training = toTrainingInput(profile);
  if (training) {
    await fitnessApi.saveTraining(training);
    saved.push('training');
  }
  const nutrition = toNutritionInput(profile);
  if (nutrition) {
    await fitnessApi.saveNutrition(nutrition);
    saved.push('nutrition');
  }
  const body = toBodyInput(profile, now);
  if (body) {
    await fitnessApi.addBodyCheckin(body);
    saved.push('body');
  }
  return { saved };
}
