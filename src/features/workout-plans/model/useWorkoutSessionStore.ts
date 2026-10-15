import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  ActiveWorkoutSession,
  CompletedWorkoutSession,
  ExerciseLog,
  WorkoutExercise,
  WorkoutSource,
  WorkoutTotals,
} from './workoutFlowTypes';

interface StartInput {
  dayId: string;
  source: WorkoutSource;
  title: string;
  exercises: ReadonlyArray<WorkoutExercise>;
}

interface WorkoutSessionState {
  activeSession: ActiveWorkoutSession | null;
  /** Local outbox and recent list; the backend session list is the source of truth once synced. */
  completedSessions: Array<CompletedWorkoutSession>;
  startSession: (input: StartInput) => string;
  saveExerciseLog: (exerciseId: string, log: ExerciseLog) => void;
  goToExercise: (index: number) => void;
  finishSession: () => CompletedWorkoutSession | null;
  clearActiveSession: () => void;
  updateSync: (id: string, sync: CompletedWorkoutSession['sync']) => void;
  discardSession: (id: string) => void;
}

const RECENT_LIMIT = 20;

/** Unsynced workouts are never dropped; only already-synced ones are trimmed to the recent limit. */
export function trimRecent(sessions: CompletedWorkoutSession[]): CompletedWorkoutSession[] {
  let synced = 0;
  return sessions.filter((session) => session.sync.status !== 'synced' || ++synced <= RECENT_LIMIT);
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
      startSession: ({ dayId, source, title, exercises }) => {
        const existing = get().activeSession;
        if (existing?.dayId === dayId) return existing.id;
        const id = crypto.randomUUID();
        set({
          activeSession: {
            id,
            dayId,
            source,
            title,
            exercises: [...exercises],
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
        // completedAt is captured on the device now and sent later; the backend validates it (UC09 window + skew).
        const completed: CompletedWorkoutSession = {
          ...active,
          completedAt: new Date().toISOString(),
          totals: calculateWorkoutTotals(active.logs),
          sync: { status: 'pending', backendSessionId: null, error: null },
        };
        set((state) => ({
          activeSession: null,
          completedSessions: trimRecent([completed, ...state.completedSessions]),
        }));
        return completed;
      },
      clearActiveSession: () => set({ activeSession: null }),
      updateSync: (id, sync) =>
        set((state) => ({
          completedSessions: state.completedSessions.map((session) =>
            session.id === id ? { ...session, sync } : session,
          ),
        })),
      discardSession: (id) =>
        set((state) => ({
          completedSessions: state.completedSessions.filter((session) => session.id !== id),
        })),
    }),
    {
      name: 'fit:member-workout-session:v2',
      version: 2,
    },
  ),
);
