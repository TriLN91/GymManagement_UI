import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { MuscleTarget } from './muscleMapData';

export type BuilderTrackingType = 'strength' | 'duration' | 'distance' | 'interval';

export interface ExerciseCatalogItem {
  id: string;
  name: { en: string; vi: string };
  equipment: string;
  muscle: string;
  difficulty: string;
  trackingType: BuilderTrackingType;
  muscles: ReadonlyArray<MuscleTarget>;
}

type ExerciseCatalogSeed = Omit<ExerciseCatalogItem, 'muscles'>;

export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type Weekday = (typeof WEEKDAYS)[number];
export type BuilderSaveMode = 'new_plan' | 'optional_addon';

export interface BuilderExercise {
  uid: string;
  exerciseId: string;
  sets: number;
  reps: number;
  loadKg: number;
  restSeconds: number;
  durationSeconds: number;
  distanceKm: number;
  rounds: number;
  workSeconds: number;
  days: Weekday[];
}

export interface SavedMemberPlan {
  id: string;
  name: string;
  exercises: BuilderExercise[];
  savedAt: string;
}

export interface OptionalExerciseLayer extends SavedMemberPlan {
  status: 'active';
  sourcePlanName: string;
  affectsPlanCompletion: false;
}

interface MemberBuilderState {
  name: string;
  exercises: BuilderExercise[];
  savedPlans: SavedMemberPlan[];
  optionalAddons: OptionalExerciseLayer[];
  setName: (name: string) => void;
  addExercise: (exercise: ExerciseCatalogItem) => void;
  removeExercise: (uid: string) => void;
  moveExercise: (uid: string, direction: -1 | 1) => void;
  updateExercise: (uid: string, patch: Partial<BuilderExercise>) => void;
  clearDraft: () => void;
  savePlan: (mode: BuilderSaveMode) => SavedMemberPlan | OptionalExerciseLayer | null;
}

const exerciseMuscles: Readonly<Record<string, ReadonlyArray<MuscleTarget>>> = {
  'barbell-squat': [
    { id: 'quadriceps', role: 'primary', activation: 1 },
    { id: 'gluteus_maximus', role: 'secondary', activation: 0.6 },
    { id: 'adductors', role: 'secondary', activation: 0.45 },
  ],
  'barbell-bench-press': [
    { id: 'chest', role: 'primary', activation: 1 },
    { id: 'anterior_deltoid', role: 'secondary', activation: 0.45 },
    { id: 'triceps', role: 'secondary', activation: 0.35 },
  ],
  'stiff-leg-deadlift': [
    { id: 'hamstrings', role: 'primary', activation: 1 },
    { id: 'gluteus_maximus', role: 'primary', activation: 0.8 },
    { id: 'lower_back', role: 'secondary', activation: 0.4 },
  ],
  'barbell-hip-thrust': [{ id: 'gluteus_maximus', role: 'primary', activation: 1 }],
  'chin-ups': [
    { id: 'latissimus_dorsi', role: 'primary', activation: 1 },
    { id: 'biceps', role: 'secondary', activation: 0.45 },
  ],
  'plank-hold': [
    { id: 'rectus_abdominis', role: 'primary', activation: 0.7 },
    { id: 'obliques', role: 'secondary', activation: 0.5 },
  ],
  'treadmill-run': [{ id: 'quadriceps', role: 'secondary', activation: 0.3 }],
  'tabata-burpee': [
    { id: 'quadriceps', role: 'secondary', activation: 0.45 },
    { id: 'chest', role: 'secondary', activation: 0.3 },
  ],
  'incline-dumbbell-press': [
    { id: 'upper_chest', role: 'primary', activation: 1 },
    { id: 'anterior_deltoid', role: 'secondary', activation: 0.45 },
    { id: 'triceps', role: 'secondary', activation: 0.35 },
  ],
  'cable-chest-fly': [{ id: 'mid_chest', role: 'primary', activation: 1 }],
  'overhead-press': [
    { id: 'anterior_deltoid', role: 'primary', activation: 1 },
    { id: 'triceps', role: 'secondary', activation: 0.4 },
  ],
  'dumbbell-lateral-raise': [{ id: 'lateral_deltoid', role: 'primary', activation: 1 }],
  'dumbbell-biceps-curl': [
    { id: 'biceps', role: 'primary', activation: 1 },
    { id: 'forearms', role: 'secondary', activation: 0.35 },
  ],
  'cable-triceps-pushdown': [{ id: 'triceps', role: 'primary', activation: 1 }],
  'wrist-curl': [{ id: 'forearms', role: 'primary', activation: 1 }],
  'russian-twist': [{ id: 'obliques', role: 'primary', activation: 1 }],
  'leg-extension': [{ id: 'rectus_femoris', role: 'primary', activation: 1 }],
  'standing-calf-raise': [
    { id: 'gastrocnemius', role: 'primary', activation: 1 },
    { id: 'soleus', role: 'secondary', activation: 0.45 },
  ],
  'barbell-shrug': [{ id: 'trapezius', role: 'primary', activation: 1 }],
  'face-pull': [
    { id: 'posterior_deltoid', role: 'primary', activation: 0.85 },
    { id: 'trapezius', role: 'secondary', activation: 0.55 },
  ],
  'lat-pulldown': [{ id: 'latissimus_dorsi', role: 'primary', activation: 1 }],
  'back-extension': [{ id: 'lower_back', role: 'primary', activation: 1 }],
};

const exerciseCatalogSeeds: ReadonlyArray<ExerciseCatalogSeed> = [
  {
    id: 'barbell-squat',
    name: { en: 'Barbell Squat', vi: 'Squat với tạ đòn' },
    equipment: 'Barbell',
    muscle: 'Quads',
    difficulty: 'Intermediate',
    trackingType: 'strength',
  },
  {
    id: 'barbell-bench-press',
    name: { en: 'Barbell Bench Press', vi: 'Đẩy ngực với tạ đòn' },
    equipment: 'Barbell',
    muscle: 'Chest',
    difficulty: 'Intermediate',
    trackingType: 'strength',
  },
  {
    id: 'stiff-leg-deadlift',
    name: { en: 'Stiff Leg Deadlift', vi: 'Deadlift chân thẳng' },
    equipment: 'Barbell',
    muscle: 'Hamstrings',
    difficulty: 'Intermediate',
    trackingType: 'strength',
  },
  {
    id: 'barbell-hip-thrust',
    name: { en: 'Barbell Hip Thrust', vi: 'Hip Thrust với tạ đòn' },
    equipment: 'Barbell',
    muscle: 'Glutes',
    difficulty: 'Beginner',
    trackingType: 'strength',
  },
  {
    id: 'chin-ups',
    name: { en: 'Chin Ups', vi: 'Hít xà tay ngửa' },
    equipment: 'Bodyweight',
    muscle: 'Lats',
    difficulty: 'Intermediate',
    trackingType: 'strength',
  },
  {
    id: 'plank-hold',
    name: { en: 'Plank Hold', vi: 'Giữ Plank' },
    equipment: 'Bodyweight',
    muscle: 'Core',
    difficulty: 'Beginner',
    trackingType: 'duration',
  },
  {
    id: 'treadmill-run',
    name: { en: 'Treadmill Run', vi: 'Chạy máy' },
    equipment: 'Treadmill',
    muscle: 'Cardio',
    difficulty: 'All levels',
    trackingType: 'distance',
  },
  {
    id: 'tabata-burpee',
    name: { en: 'Tabata Burpee', vi: 'Burpee Tabata' },
    equipment: 'Bodyweight',
    muscle: 'Full body',
    difficulty: 'Advanced',
    trackingType: 'interval',
  },
  {
    id: 'incline-dumbbell-press',
    name: { en: 'Incline Dumbbell Press', vi: 'Đẩy ngực dốc với tạ đơn' },
    equipment: 'Dumbbells',
    muscle: 'Chest',
    difficulty: 'Intermediate',
    trackingType: 'strength',
  },
  {
    id: 'cable-chest-fly',
    name: { en: 'Cable Chest Fly', vi: 'Ép ngực với cáp' },
    equipment: 'Cable',
    muscle: 'Chest',
    difficulty: 'Beginner',
    trackingType: 'strength',
  },
  {
    id: 'overhead-press',
    name: { en: 'Overhead Press', vi: 'Đẩy vai qua đầu' },
    equipment: 'Barbell',
    muscle: 'Shoulders',
    difficulty: 'Intermediate',
    trackingType: 'strength',
  },
  {
    id: 'dumbbell-lateral-raise',
    name: { en: 'Dumbbell Lateral Raise', vi: 'Nâng tạ đơn sang ngang' },
    equipment: 'Dumbbells',
    muscle: 'Shoulders',
    difficulty: 'Beginner',
    trackingType: 'strength',
  },
  {
    id: 'dumbbell-biceps-curl',
    name: { en: 'Dumbbell Biceps Curl', vi: 'Cuốn tay trước với tạ đơn' },
    equipment: 'Dumbbells',
    muscle: 'Biceps',
    difficulty: 'Beginner',
    trackingType: 'strength',
  },
  {
    id: 'cable-triceps-pushdown',
    name: { en: 'Cable Triceps Pushdown', vi: 'Duỗi tay sau với cáp' },
    equipment: 'Cable',
    muscle: 'Triceps',
    difficulty: 'Beginner',
    trackingType: 'strength',
  },
  {
    id: 'wrist-curl',
    name: { en: 'Wrist Curl', vi: 'Cuốn cổ tay' },
    equipment: 'Dumbbells',
    muscle: 'Forearms',
    difficulty: 'Beginner',
    trackingType: 'strength',
  },
  {
    id: 'russian-twist',
    name: { en: 'Russian Twist', vi: 'Xoay bụng Russian Twist' },
    equipment: 'Bodyweight',
    muscle: 'Obliques',
    difficulty: 'Intermediate',
    trackingType: 'duration',
  },
  {
    id: 'leg-extension',
    name: { en: 'Leg Extension', vi: 'Duỗi đùi trước' },
    equipment: 'Machine',
    muscle: 'Quads',
    difficulty: 'Beginner',
    trackingType: 'strength',
  },
  {
    id: 'standing-calf-raise',
    name: { en: 'Standing Calf Raise', vi: 'Nhón bắp chân đứng' },
    equipment: 'Machine',
    muscle: 'Calves',
    difficulty: 'Beginner',
    trackingType: 'strength',
  },
  {
    id: 'barbell-shrug',
    name: { en: 'Barbell Shrug', vi: 'Nhún cầu vai với tạ đòn' },
    equipment: 'Barbell',
    muscle: 'Traps',
    difficulty: 'Beginner',
    trackingType: 'strength',
  },
  {
    id: 'face-pull',
    name: { en: 'Face Pull', vi: 'Kéo cáp về mặt' },
    equipment: 'Cable',
    muscle: 'Rear delts',
    difficulty: 'Intermediate',
    trackingType: 'strength',
  },
  {
    id: 'lat-pulldown',
    name: { en: 'Lat Pulldown', vi: 'Kéo xô máy' },
    equipment: 'Machine',
    muscle: 'Lats',
    difficulty: 'Beginner',
    trackingType: 'strength',
  },
  {
    id: 'back-extension',
    name: { en: 'Back Extension', vi: 'Ưỡn lưng ghế' },
    equipment: 'Bodyweight',
    muscle: 'Lower back',
    difficulty: 'Beginner',
    trackingType: 'strength',
  },
];

export const memberExerciseCatalog: ReadonlyArray<ExerciseCatalogItem> = exerciseCatalogSeeds.map(
  (exercise) => ({
    ...exercise,
    muscles: exerciseMuscles[exercise.id] ?? [],
  }),
);

export function getExerciseMuscles(exercise: ExerciseCatalogItem): ReadonlyArray<MuscleTarget> {
  return exercise.muscles;
}

function createBuilderExercise(exercise: ExerciseCatalogItem): BuilderExercise {
  return {
    uid: `${exercise.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    exerciseId: exercise.id,
    sets: exercise.trackingType === 'strength' ? 3 : 1,
    reps: 10,
    loadKg: 20,
    restSeconds: 60,
    durationSeconds: 60,
    distanceKm: 2,
    rounds: 8,
    workSeconds: 20,
    days: [],
  };
}

export const useMemberWorkoutBuilderStore = create<MemberBuilderState>()(
  persist(
    (set, get) => ({
      name: '',
      exercises: [],
      savedPlans: [],
      optionalAddons: [],
      setName: (name) => set({ name }),
      addExercise: (exercise) =>
        set((state) => ({ exercises: [...state.exercises, createBuilderExercise(exercise)] })),
      removeExercise: (uid) =>
        set((state) => ({ exercises: state.exercises.filter((exercise) => exercise.uid !== uid) })),
      moveExercise: (uid, direction) =>
        set((state) => {
          const index = state.exercises.findIndex((exercise) => exercise.uid === uid);
          const target = index + direction;
          if (index < 0 || target < 0 || target >= state.exercises.length) return state;
          const exercises = [...state.exercises];
          const current = exercises[index];
          const swap = exercises[target];
          if (!current || !swap) return state;
          exercises[index] = swap;
          exercises[target] = current;
          return { exercises };
        }),
      updateExercise: (uid, patch) =>
        set((state) => ({
          exercises: state.exercises.map((exercise) =>
            exercise.uid === uid ? { ...exercise, ...patch } : exercise,
          ),
        })),
      clearDraft: () => set({ name: '', exercises: [] }),
      savePlan: (mode) => {
        const { name, exercises } = get();
        const scheduledExerciseKeys = exercises.flatMap((exercise) =>
          exercise.days.map((day) => `${exercise.exerciseId}:${day}`),
        );
        const hasDuplicateDayExercise =
          new Set(scheduledExerciseKeys).size !== scheduledExerciseKeys.length;
        if (
          !name.trim() ||
          exercises.length === 0 ||
          exercises.some((exercise) => exercise.days.length === 0) ||
          hasDuplicateDayExercise
        ) {
          return null;
        }
        const plan: SavedMemberPlan = {
          id: `member-plan-${Date.now()}`,
          name: name.trim(),
          exercises: exercises.map((exercise) => ({ ...exercise })),
          savedAt: new Date().toISOString(),
        };
        if (mode === 'optional_addon') {
          const optionalLayer: OptionalExerciseLayer = {
            ...plan,
            id: `optional-addon-${Date.now()}`,
            sourcePlanName: 'AI/PT Active Plan',
            status: 'active',
            affectsPlanCompletion: false,
          };
          set((state) => ({ optionalAddons: [optionalLayer, ...state.optionalAddons] }));
          return optionalLayer;
        }
        set((state) => ({ savedPlans: [plan, ...state.savedPlans] }));
        return plan;
      },
    }),
    {
      name: 'fit:member-workout-builder:v1',
      version: 3,
      migrate: (persistedState, version) => {
        const persisted = persistedState as Partial<MemberBuilderState> & {
          changeRequests?: SavedMemberPlan[];
        };
        if (version < 3) {
          const migrated = { ...persisted };
          delete migrated.changeRequests;
          return { ...migrated, optionalAddons: [] } as MemberBuilderState;
        }
        return persistedState as MemberBuilderState;
      },
    },
  ),
);
