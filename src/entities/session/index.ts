// ExerciseSession — domain entity.
export interface ExerciseSession {
  id: string;
  memberId: string;
  startedAt: string;
  endedAt: string;
  exerciseCount: number;
  averageFormScore: number;
}

export interface SessionResult {
  sessionId: string;
  totalReps: number;
  formScore: number;
  caloriesBurned: number;
}
