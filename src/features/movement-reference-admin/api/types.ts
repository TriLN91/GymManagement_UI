export type ReferenceLifecycleStatus =
  'PROCESSING' | 'REVIEW_REQUIRED' | 'CONFIRMED' | 'ACTIVE' | 'FAILED';

export type SourceProcessingStatus = 'PROCESSING' | 'PROCESSED' | 'FAILED';
export type SourceDecision = 'CLEAR_ACCEPT' | 'CLEAR_REJECT' | 'AMBIGUOUS' | 'REQUIRES_REVIEW';
export type SourceAction = 'KEEP' | 'DOWN_WEIGHT' | 'EXCLUDE' | 'REQUIRES_REVIEW';

export interface ExerciseDto {
  id: string;
  name: string;
  muscleGroup?: string | null;
  equipment?: string | null;
  difficultyLevel?: string | null;
  instructions?: string | null;
  isActive: boolean;
}

export interface ReferenceSourceAdjudicationDto {
  status: string;
  choice?: string | null;
  confidence?: number | null;
  probabilityDistribution: Record<string, number>;
  topChoiceMargin?: number | null;
  latencyMs?: number | null;
  model?: string | null;
  governanceOutcome: string;
  governanceReason: string;
}

export interface ReferenceSetSourceDto {
  id: string;
  fileName: string;
  detectedView?: string | null;
  detectedViewConfidence?: number | null;
  processingStatus: SourceProcessingStatus;
  acceptedRepCount: number;
  rejectedRepCount: number;
  decision?: SourceDecision | null;
  action?: SourceAction | null;
  reviewReason?: string | null;
  dataQuality: Record<string, unknown>;
  deterministicEvidence: Record<string, unknown>;
  adjudication?: ReferenceSourceAdjudicationDto | null;
  warnings: string[];
  failureMessage?: string | null;
}

export interface ReferenceSetProfileDto {
  id: string;
  version: number;
  view: string;
  status: ReferenceLifecycleStatus;
  sourceVideoCount: number;
  acceptedVideoCount: number;
  acceptedRepCount: number;
  aggregateProfile: Record<string, unknown>;
  normalizedReference: Record<string, unknown>;
  qualitySummary: Record<string, unknown>;
}

export interface ReferenceSetSummaryDto {
  id: string;
  exerciseId: string;
  exerciseName: string;
  pattern: string;
  status: ReferenceLifecycleStatus;
  sourceCount: number;
  profileCount: number;
  activeProfileCount: number;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
}

export interface ReferenceSetDto {
  id: string;
  exerciseId: string;
  exerciseName: string;
  pattern: string;
  status: ReferenceLifecycleStatus;
  sources: ReferenceSetSourceDto[];
  profiles: ReferenceSetProfileDto[];
}

export interface CreateExerciseInput {
  name: string;
  muscleGroup?: string;
  equipment?: string;
}

export interface CreateReferenceSetInput {
  exerciseId: string;
  pattern: 'SQUAT';
}
