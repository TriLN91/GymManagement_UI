export type WorkoutPlanFilter = 'all' | 'active' | 'hypertrophy' | 'strength' | 'metabolic';

export type WorkoutPlanStatus = 'completed' | 'active' | 'ready';

export interface WorkoutPlanPreview {
  id: string;
  code: string;
  category: Exclude<WorkoutPlanFilter, 'all' | 'active'>;
  level: 'beginner' | 'intermediate' | 'advanced' | 'elite' | 'allLevels';
  stations: number;
  durationMinutes: number;
  apparatus: string;
  progress: number;
  completedSets?: number;
  totalSets?: number;
  status: WorkoutPlanStatus;
}

export type WorkoutPlansViewState = 'loading' | 'loaded' | 'empty' | 'error';
