import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  ActiveWorkoutSession,
  CompletedWorkoutSession,
  ExerciseLog,
  WorkoutTotals,
} from './workoutFlowTypes';

interface WorkoutSessionState {
  activeSession: ActiveWorkoutSession | null;
  completedSessions: Array<CompletedWorkoutSession>;
  startSession: (dayId: string) => string;
  saveExerciseLog: (exerciseId: string, log: ExerciseLog) => void;
  goToExercise: (index: number) => void;
  finishSession: () => CompletedWorkoutSession | null;
  clearActiveSession: () => void;
}

export function calculateWorkoutTotals(logs: Record<string, ExerciseLog>): WorkoutTotals {
  return Object.values(logs).reduce<WorkoutTotals>(
    (totals, log) => {
      if (log.trackingType === 'strength') {
        totals.totalVolumeKg += log.sets.reduce(
          (volume, set) => volume + (set.completed ? set.loadKg * set.reps : 0),
          0,
        );
      }
      if (log.trackingType === 'duration') {
        totals.totalDurationSeconds += log.sets.reduce(
          (seconds, set) => seconds + (set.completed ? set.durationSeconds : 0),
          0,
        );
      }
      if (log.trackingType === 'distance') {
        totals.totalDistanceKm += log.distanceKm;
        totals.totalDurationSeconds += log.durationSeconds;
      }
      if (log.trackingType === 'interval') {
        totals.completedRounds += log.completedRounds;
        totals.totalDurationSeconds +=
          log.completedRounds * log.workSeconds +
          Math.max(0, log.completedRounds - 1) * log.restSeconds;
      }
      return totals;
    },
    { totalVolumeKg: 0, totalDurationSeconds: 0, totalDistanceKm: 0, completedRounds: 0 },
  );
}

export const useWorkoutSessionStore = create<WorkoutSessionState>()(
  persist(
    (set, get) => ({
      activeSession: null,
      completedSessions: [],
      startSession: (dayId) => {
        const existing = get().activeSession;
        if (existing?.dayId === dayId) return existing.id;
        const id = `${dayId}-${Date.now()}`;
        set({
          activeSession: {
            id,
            dayId,
            startedAt: new Date().toISOString(),
            currentExerciseIndex: 0,
            logs: {},
          },
        });
        return id;
      },
      saveExerciseLog: (exerciseId, log) =>
        set((state) =>
          state.activeSession
            ? {
                activeSession: {
                  ...state.activeSession,
                  logs: { ...state.activeSession.logs, [exerciseId]: log },
                },
              }
            : state,
        ),
      goToExercise: (index) =>
        set((state) =>
          state.activeSession
            ? {
                activeSession: { ...state.activeSession, currentExerciseIndex: Math.max(0, index) },
              }
            : state,
        ),
      finishSession: () => {
        const active = get().activeSession;
        if (!active) return null;
        const completed: CompletedWorkoutSession = {
          ...active,
          completedAt: new Date().toISOString(),
          totals: calculateWorkoutTotals(active.logs),
        };
        set((state) => ({
          activeSession: null,
          completedSessions: [completed, ...state.completedSessions],
        }));
        return completed;
      },
      clearActiveSession: () => set({ activeSession: null }),
    }),
    { name: 'fit:member-workout-session:v1', version: 1 },
  ),
);
