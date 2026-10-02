import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TrainerTrackingType = 'strength' | 'duration' | 'distance' | 'interval';
export type TrainerWeekday =
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TrainerMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipCode: string;
  portraitUrl: string;
  joinedAt: string;
  age: number;
  height: number;
  weight: number;
  bodyFat: number;
  goal: string;
  secondaryGoals: string[];
  experience: string;
  medicalConditions: string[];
  injuries: string[];
  medications: string[];
  trainingLimitations: string[];
  dietaryNotes: string;
  sleepHours: number;
  activityLevel: string;
  emergencyContact: string;
  status: 'on_track' | 'attention' | 'paused';
  calories: number[];
  loads: number[];
  weights: number[];
  planned: number;
  completed: number;
}

export interface TrainerExercise {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  trackingType: TrainerTrackingType;
  description?: string;
  imageUrl?: string;
  previewVideoUrl?: string;
  secondaryMuscles?: string[];
}

export interface TrainerPlanExercise {
  uid: string;
  exerciseId: string;
  day: TrainerWeekday;
  sets: number;
  reps: number;
  load: number;
  rest: number;
  duration: number;
  distance: number;
  rounds: number;
  actualSets: number;
  actualReps: number;
  actualLoad: number;
  completed: boolean;
}

export interface TrainerPlan {
  id: string;
  memberId: string;
  name: string;
  week: number;
  exercises: TrainerPlanExercise[];
  updatedAt: string;
}

export interface TrainerAppointment {
  id: string;
  memberId: string;
  type: string;
  date: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes: string;
}

export const trainerMembers: TrainerMember[] = [
  {
    id: 'alex',
    name: 'Alex Volkov',
    email: 'alex@fit.local',
    phone: '+84 908 241 168',
    membershipCode: 'FIT-240184',
    portraitUrl: '/member-portraits/alex-volkov.jpg',
    joinedAt: '2025-08-12',
    age: 29,
    height: 181,
    weight: 78.4,
    bodyFat: 15.2,
    goal: 'Build muscle',
    secondaryGoals: ['Improve posture', 'Increase bench press strength'],
    experience: 'Intermediate',
    medicalConditions: ['None reported'],
    injuries: ['Previous right shoulder impingement'],
    medications: ['None'],
    trainingLimitations: ['Avoid painful overhead range'],
    dietaryNotes: 'High-protein diet; lactose-sensitive.',
    sleepHours: 7.2,
    activityLevel: 'Moderately active',
    emergencyContact: 'Elena Volkov · +84 909 445 770',
    status: 'on_track',
    calories: [2240, 2310, 2180, 2360, 2290, 2410, 2260],
    loads: [12200, 13800, 13100, 15200, 16000, 17100, 18250],
    weights: [79.2, 79, 78.9, 78.7, 78.6, 78.5, 78.4],
    planned: 5,
    completed: 4,
  },
  {
    id: 'mai',
    name: 'Mai Nguyen',
    email: 'mai@fit.local',
    phone: '+84 903 532 419',
    membershipCode: 'FIT-240219',
    portraitUrl: '/member-portraits/mai-nguyen.jpg',
    joinedAt: '2025-10-03',
    age: 32,
    height: 163,
    weight: 61.8,
    bodyFat: 28.4,
    goal: 'Fat loss',
    secondaryGoals: ['Improve cardiovascular endurance', 'Build consistent habits'],
    experience: 'Beginner',
    medicalConditions: ['Mild hypothyroidism'],
    injuries: ['Occasional lower-back discomfort'],
    medications: ['Levothyroxine — member reported'],
    trainingLimitations: ['Low-impact conditioning preferred'],
    dietaryNotes: 'Vegetarian; calorie adherence needs weekly review.',
    sleepHours: 6.4,
    activityLevel: 'Lightly active',
    emergencyContact: 'Nguyen Minh · +84 907 815 202',
    status: 'attention',
    calories: [1740, 1820, 1900, 1680, 1770, 2010, 1860],
    loads: [7200, 7600, 8100, 7900, 8600, 8400, 9100],
    weights: [63.1, 62.9, 62.8, 62.5, 62.2, 62, 61.8],
    planned: 4,
    completed: 2,
  },
  {
    id: 'minh',
    name: 'Minh Tran',
    email: 'minh@fit.local',
    phone: '+84 912 767 338',
    membershipCode: 'FIT-230942',
    portraitUrl: '/member-portraits/minh-tran.jpg',
    joinedAt: '2024-11-18',
    age: 41,
    height: 176,
    weight: 84.2,
    bodyFat: 19.1,
    goal: 'Strength',
    secondaryGoals: ['Deadlift 180 kg', 'Maintain joint health'],
    experience: 'Advanced',
    medicalConditions: ['Controlled hypertension'],
    injuries: ['Healed left ankle sprain'],
    medications: ['Antihypertensive medication — member reported'],
    trainingLimitations: ['Monitor blood pressure and RPE'],
    dietaryNotes: 'No dietary restrictions reported.',
    sleepHours: 7.5,
    activityLevel: 'Very active',
    emergencyContact: 'Tran Ha · +84 916 104 052',
    status: 'on_track',
    calories: [2630, 2550, 2710, 2590, 2680, 2740, 2610],
    loads: [18200, 19500, 20100, 21200, 20700, 22100, 22800],
    weights: [83.7, 83.8, 83.9, 84, 84, 84.1, 84.2],
    planned: 5,
    completed: 5,
  },
  {
    id: 'linh',
    name: 'Linh Pham',
    email: 'linh@fit.local',
    phone: '+84 906 420 175',
    membershipCode: 'FIT-250071',
    portraitUrl: '/member-portraits/linh-pham.jpg',
    joinedAt: '2026-01-09',
    age: 26,
    height: 158,
    weight: 54.6,
    bodyFat: 24.8,
    goal: 'Mobility',
    secondaryGoals: ['Reduce desk-related stiffness', 'Improve hip mobility'],
    experience: 'Beginner',
    medicalConditions: ['None reported'],
    injuries: ['Recurring wrist discomfort'],
    medications: ['None'],
    trainingLimitations: ['Limit loaded wrist extension'],
    dietaryNotes: 'No dietary restrictions reported.',
    sleepHours: 6.8,
    activityLevel: 'Sedentary outside training',
    emergencyContact: 'Pham Anh · +84 905 202 884',
    status: 'paused',
    calories: [1920, 1850, 1940, 1880, 0, 0, 0],
    loads: [6100, 6800, 6500, 7200, 0, 0, 0],
    weights: [54.8, 54.7, 54.7, 54.6, 54.6, 54.6, 54.6],
    planned: 3,
    completed: 1,
  },
  {
    id: 'jordan',
    name: 'Jordan Lee',
    email: 'jordan@fit.local',
    phone: '+84 901 772 641',
    membershipCode: 'FIT-240376',
    portraitUrl: '/member-portraits/jordan-lee.jpg',
    joinedAt: '2025-06-21',
    age: 35,
    height: 174,
    weight: 72.3,
    bodyFat: 17.6,
    goal: 'Endurance',
    secondaryGoals: ['Complete a half marathon', 'Improve recovery'],
    experience: 'Intermediate',
    medicalConditions: ['Exercise-induced asthma'],
    injuries: ['None reported'],
    medications: ['Rescue inhaler as prescribed'],
    trainingLimitations: ['Long warm-up before high-intensity intervals'],
    dietaryNotes: 'Shellfish allergy.',
    sleepHours: 7,
    activityLevel: 'Very active',
    emergencyContact: 'Taylor Lee · +84 902 116 744',
    status: 'on_track',
    calories: [2380, 2450, 2410, 2520, 2480, 2560, 2490],
    loads: [9400, 9800, 10200, 10800, 11100, 11500, 11900],
    weights: [72.8, 72.7, 72.6, 72.5, 72.5, 72.4, 72.3],
    planned: 4,
    completed: 4,
  },
  {
    id: 'hana',
    name: 'Hana Kim',
    email: 'hana@fit.local',
    phone: '+84 904 318 670',
    membershipCode: 'FIT-240511',
    portraitUrl: '/member-portraits/hana-kim.jpg',
    joinedAt: '2025-07-14',
    age: 30,
    height: 166,
    weight: 59.1,
    bodyFat: 22.3,
    goal: 'Build muscle',
    secondaryGoals: ['Improve lower-body strength', 'Increase training consistency'],
    experience: 'Intermediate',
    medicalConditions: ['Iron deficiency history'],
    injuries: ['Previous left knee pain'],
    medications: ['Iron supplement — member reported'],
    trainingLimitations: ['Monitor knee response to deep flexion'],
    dietaryNotes: 'Avoids red meat; monitor iron-rich food intake.',
    sleepHours: 6.6,
    activityLevel: 'Moderately active',
    emergencyContact: 'Min Kim · +84 903 870 115',
    status: 'attention',
    calories: [2100, 2180, 2050, 2210, 2140, 2080, 2170],
    loads: [10100, 10900, 11200, 11800, 11600, 12400, 12900],
    weights: [58.5, 58.6, 58.7, 58.8, 58.9, 59, 59.1],
    planned: 5,
    completed: 3,
  },
];

export const trainerExercises: TrainerExercise[] = [
  {
    id: 'bench',
    name: 'Barbell Bench Press',
    muscle: 'Chest',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    trackingType: 'strength',
  },
  {
    id: 'squat',
    name: 'Barbell Back Squat',
    muscle: 'Quadriceps',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    trackingType: 'strength',
  },
  {
    id: 'deadlift',
    name: 'Romanian Deadlift',
    muscle: 'Hamstrings',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    trackingType: 'strength',
  },
  {
    id: 'pulldown',
    name: 'Lat Pulldown',
    muscle: 'Back',
    equipment: 'Cable',
    difficulty: 'Beginner',
    trackingType: 'strength',
  },
  {
    id: 'row',
    name: 'Seated Cable Row',
    muscle: 'Back',
    equipment: 'Cable',
    difficulty: 'Beginner',
    trackingType: 'strength',
  },
  {
    id: 'plank',
    name: 'Plank Hold',
    muscle: 'Core',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    trackingType: 'duration',
  },
  {
    id: 'run',
    name: 'Treadmill Run',
    muscle: 'Cardio',
    equipment: 'Treadmill',
    difficulty: 'Beginner',
    trackingType: 'distance',
  },
  {
    id: 'bike',
    name: 'Bike Sprint Intervals',
    muscle: 'Cardio',
    equipment: 'Bike',
    difficulty: 'Advanced',
    trackingType: 'interval',
  },
];

const seedPlanExercises: TrainerPlanExercise[] = [
  {
    uid: 'alex-bench',
    exerciseId: 'bench',
    day: 'monday',
    sets: 4,
    reps: 8,
    load: 70,
    rest: 90,
    duration: 0,
    distance: 0,
    rounds: 0,
    actualSets: 4,
    actualReps: 8,
    actualLoad: 70,
    completed: true,
  },
  {
    uid: 'alex-row',
    exerciseId: 'row',
    day: 'monday',
    sets: 3,
    reps: 12,
    load: 45,
    rest: 75,
    duration: 0,
    distance: 0,
    rounds: 0,
    actualSets: 3,
    actualReps: 11,
    actualLoad: 45,
    completed: true,
  },
  {
    uid: 'alex-squat',
    exerciseId: 'squat',
    day: 'thursday',
    sets: 4,
    reps: 6,
    load: 90,
    rest: 120,
    duration: 0,
    distance: 0,
    rounds: 0,
    actualSets: 0,
    actualReps: 0,
    actualLoad: 0,
    completed: false,
  },
];

const seedPlans: TrainerPlan[] = trainerMembers.map((member, index) => ({
  id: `plan-${member.id}`,
  memberId: member.id,
  name: index % 2 ? 'Performance Foundation' : 'Progressive Strength',
  week: 4,
  exercises: seedPlanExercises.map((exercise) => ({
    ...exercise,
    uid: `${member.id}-${exercise.exerciseId}`,
  })),
  updatedAt: '2026-09-25T08:30:00.000Z',
}));

const seedAppointments: TrainerAppointment[] = [
  {
    id: 'appt-1',
    memberId: 'alex',
    type: 'In-person training',
    date: '2026-09-28',
    time: '08:00',
    duration: 60,
    status: 'confirmed',
    notes: 'Upper-body technique and load progression.',
  },
  {
    id: 'appt-2',
    memberId: 'mai',
    type: 'Body assessment',
    date: '2026-09-28',
    time: '10:30',
    duration: 45,
    status: 'pending',
    notes: 'Review measurements and calorie adherence.',
  },
  {
    id: 'appt-3',
    memberId: 'minh',
    type: 'Video check-in',
    date: '2026-09-29',
    time: '19:00',
    duration: 30,
    status: 'confirmed',
    notes: 'Review deadlift form video.',
  },
];

interface TrainerWorkspaceState {
  selectedMemberId: string;
  draftName: string;
  draftWeek: number;
  draftExercises: TrainerPlanExercise[];
  plans: TrainerPlan[];
  appointments: TrainerAppointment[];
  setSelectedMember: (memberId: string) => void;
  setDraftMeta: (patch: { name?: string; week?: number }) => void;
  addDraftExercise: (exerciseId: string, day?: TrainerWeekday) => void;
  updateDraftExercise: (uid: string, patch: Partial<TrainerPlanExercise>) => void;
  removeDraftExercise: (uid: string) => void;
  moveDraftExercise: (uid: string, direction: -1 | 1) => void;
  saveDraftPlan: () => void;
  loadMemberPlan: (memberId: string) => void;
  updateMemberPlanExercise: (
    memberId: string,
    uid: string,
    patch: Partial<TrainerPlanExercise>,
  ) => void;
  saveAppointment: (appointment: TrainerAppointment) => void;
}

export const useTrainerWorkspaceStore = create<TrainerWorkspaceState>()(
  persist(
    (set, get) => ({
      selectedMemberId: 'alex',
      draftName: 'Progressive Strength',
      draftWeek: 4,
      draftExercises: seedPlanExercises,
      plans: seedPlans,
      appointments: seedAppointments,
      setSelectedMember: (memberId) => set({ selectedMemberId: memberId }),
      setDraftMeta: (patch) =>
        set((state) => ({
          draftName: patch.name ?? state.draftName,
          draftWeek: patch.week ?? state.draftWeek,
        })),
      addDraftExercise: (exerciseId, day = 'monday') =>
        set((state) => {
          const alreadyScheduled = state.draftExercises.some(
            (exercise) => exercise.exerciseId === exerciseId && exercise.day === day,
          );
          if (alreadyScheduled) return state;
          return {
            draftExercises: [
              ...state.draftExercises,
              {
                uid: `${exerciseId}-${day}-${Date.now()}`,
                exerciseId,
                day,
                sets: 3,
                reps: 10,
                load: 20,
                rest: 60,
                duration: 600,
                distance: 3,
                rounds: 6,
                actualSets: 0,
                actualReps: 0,
                actualLoad: 0,
                completed: false,
              },
            ],
          };
        }),
      updateDraftExercise: (uid, patch) =>
        set((state) => {
          const current = state.draftExercises.find((exercise) => exercise.uid === uid);
          if (!current) return state;
          const nextDay = patch.day ?? current.day;
          const wouldDuplicate = state.draftExercises.some(
            (exercise) =>
              exercise.uid !== uid &&
              exercise.exerciseId === current.exerciseId &&
              exercise.day === nextDay,
          );
          if (wouldDuplicate) return state;
          return {
            draftExercises: state.draftExercises.map((exercise) =>
              exercise.uid === uid ? { ...exercise, ...patch } : exercise,
            ),
          };
        }),
      removeDraftExercise: (uid) =>
        set((state) => ({
          draftExercises: state.draftExercises.filter((exercise) => exercise.uid !== uid),
        })),
      moveDraftExercise: (uid, direction) =>
        set((state) => {
          const index = state.draftExercises.findIndex((exercise) => exercise.uid === uid);
          if (index < 0) return state;
          const current = state.draftExercises[index]!;
          const sameDayIndexes = state.draftExercises
            .map((exercise, exerciseIndex) => ({ exercise, exerciseIndex }))
            .filter(({ exercise }) => exercise.day === current.day)
            .map(({ exerciseIndex }) => exerciseIndex);
          const position = sameDayIndexes.indexOf(index);
          const target = sameDayIndexes[position + direction];
          if (target === undefined) return state;
          const next = [...state.draftExercises];
          [next[index], next[target]] = [next[target]!, next[index]!];
          return { draftExercises: next };
        }),
      saveDraftPlan: () =>
        set((state) => {
          const next: TrainerPlan = {
            id: `plan-${state.selectedMemberId}`,
            memberId: state.selectedMemberId,
            name: state.draftName.trim() || 'Untitled plan',
            week: state.draftWeek,
            exercises: state.draftExercises,
            updatedAt: new Date().toISOString(),
          };
          return {
            plans: [
              ...state.plans.filter((plan) => plan.memberId !== state.selectedMemberId),
              next,
            ],
          };
        }),
      loadMemberPlan: (memberId) => {
        const plan = get().plans.find((item) => item.memberId === memberId);
        set({
          selectedMemberId: memberId,
          ...(plan
            ? { draftName: plan.name, draftWeek: plan.week, draftExercises: plan.exercises }
            : { draftName: 'Untitled plan', draftWeek: 1, draftExercises: [] }),
        });
      },
      updateMemberPlanExercise: (memberId, uid, patch) =>
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.memberId === memberId
              ? {
                  ...plan,
                  exercises: plan.exercises.map((exercise) =>
                    exercise.uid === uid ? { ...exercise, ...patch } : exercise,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : plan,
          ),
        })),
      saveAppointment: (appointment) =>
        set((state) => ({
          appointments: [
            ...state.appointments.filter((item) => item.id !== appointment.id),
            appointment,
          ].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
        })),
    }),
    { name: 'fit:trainer-workspace:v1' },
  ),
);

export const weekdays: TrainerWeekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export function getTrainerMember(memberId: string) {
  return trainerMembers.find((member) => member.id === memberId);
}

export function getTrainerExercise(exerciseId: string) {
  return trainerExercises.find((exercise) => exercise.id === exerciseId);
}
