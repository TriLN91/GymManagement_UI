import type { CoachingPlan } from '@/entities/plan';

export const sampleCoachingPlan: CoachingPlan = {
  id: 'plan-001',
  memberId: 'u-member',
  goal: 'muscle_gain',
  experienceLevel: 'intermediate',
  version: 3,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  workoutPlan: {
    weeklyMinutes: 240,
    weeklySchedule: [
      {
        dayOfWeek: 1,
        title: 'Upper Body',
        estimatedMinutes: 60,
        exercises: [
          { id: 'ex-1', name: 'Bench Press', sets: 4, reps: 8, restSeconds: 90 },
          { id: 'ex-2', name: 'Barbell Row', sets: 4, reps: 10, restSeconds: 90 },
          { id: 'ex-3', name: 'Overhead Press', sets: 3, reps: 10, restSeconds: 60 },
          { id: 'ex-4', name: 'Pull-ups', sets: 3, reps: 8, restSeconds: 90 },
        ],
      },
      {
        dayOfWeek: 3,
        title: 'Lower Body',
        estimatedMinutes: 60,
        exercises: [
          { id: 'ex-5', name: 'Back Squat', sets: 4, reps: 8, restSeconds: 120 },
          { id: 'ex-6', name: 'Romanian Deadlift', sets: 4, reps: 10, restSeconds: 90 },
          { id: 'ex-7', name: 'Leg Press', sets: 3, reps: 12, restSeconds: 60 },
          { id: 'ex-8', name: 'Calf Raise', sets: 4, reps: 15, restSeconds: 45 },
        ],
      },
    ],
  },
  nutritionPlan: {
    dailyCalories: 2600,
    proteinGrams: 180,
    carbsGrams: 280,
    fatGrams: 80,
    waterLiters: 3,
  },
  notes: 'Focus on progressive overload this week.',
};
