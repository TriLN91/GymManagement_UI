import type {
  ExerciseDto,
  ReferenceLifecycleStatus,
  ReferenceSetDto,
  ReferenceSetProfileDto,
  ReferenceSetSourceDto,
  ReferenceSetSummaryDto,
  SourceAction,
  SourceDecision,
  SourceProcessingStatus,
} from './types';

type JsonObject = Record<string, unknown>;

const object = (value: unknown): JsonObject =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as JsonObject) : {};
const text = (value: unknown): string => (typeof value === 'string' ? value : '');
const optionalText = (value: unknown): string | null => (typeof value === 'string' ? value : null);
const number = (value: unknown): number => (typeof value === 'number' ? value : 0);

export function mapExercise(value: unknown): ExerciseDto {
  const dto = object(value);
  return {
    id: text(dto.id),
    name: text(dto.name),
    muscleGroup: optionalText(dto.muscleGroup),
    equipment: optionalText(dto.equipment),
    difficultyLevel: optionalText(dto.difficultyLevel),
    instructions: optionalText(dto.instructions),
    isActive: dto.isActive !== false,
  };
}

export function mapReferenceSetSummary(value: unknown): ReferenceSetSummaryDto {
  const dto = object(value);
  return {
    id: text(dto.id),
    exerciseId: text(dto.exerciseId),
    exerciseName: text(dto.exerciseName),
    pattern: text(dto.pattern),
    status: text(dto.status) as ReferenceLifecycleStatus,
    sourceCount: number(dto.sourceCount),
    profileCount: number(dto.profileCount),
    activeProfileCount: number(dto.activeProfileCount),
    createdAtUtc: text(dto.createdAtUtc),
    updatedAtUtc: optionalText(dto.updatedAtUtc),
  };
}

export function mapReferenceSetSource(value: unknown): ReferenceSetSourceDto {
  const dto = object(value);
  const adjudication = dto.adjudication == null ? null : object(dto.adjudication);
  return {
    id: text(dto.id),
    fileName: text(dto.fileName),
    detectedView: optionalText(dto.detectedView),
    detectedViewConfidence:
      typeof dto.detectedViewConfidence === 'number' ? dto.detectedViewConfidence : null,
    processingStatus: text(dto.processingStatus) as SourceProcessingStatus,
    acceptedRepCount: number(dto.acceptedRepCount),
    rejectedRepCount: number(dto.rejectedRepCount),
    decision: optionalText(dto.decision) as SourceDecision | null,
    action: optionalText(dto.action) as SourceAction | null,
    reviewReason: optionalText(dto.reviewReason),
    dataQuality: object(dto.dataQuality),
    deterministicEvidence: object(dto.deterministicEvidence),
    adjudication: adjudication
      ? {
          status: text(adjudication.status),
          choice: optionalText(adjudication.choice),
          confidence: typeof adjudication.confidence === 'number' ? adjudication.confidence : null,
          probabilityDistribution: Object.fromEntries(
            Object.entries(object(adjudication.probabilityDistribution)).filter(
              (entry): entry is [string, number] => typeof entry[1] === 'number',
            ),
          ),
          topChoiceMargin:
            typeof adjudication.topChoiceMargin === 'number' ? adjudication.topChoiceMargin : null,
          latencyMs: typeof adjudication.latencyMs === 'number' ? adjudication.latencyMs : null,
          model: optionalText(adjudication.model),
          governanceOutcome: text(adjudication.governanceOutcome),
          governanceReason: text(adjudication.governanceReason),
        }
      : null,
    warnings: Array.isArray(dto.warnings)
      ? dto.warnings.filter((x): x is string => typeof x === 'string')
      : [],
    failureMessage: optionalText(dto.failureMessage),
  };
}

export function mapReferenceSetProfile(value: unknown): ReferenceSetProfileDto {
  const dto = object(value);
  return {
    id: text(dto.id),
    version: number(dto.version),
    view: text(dto.view),
    status: text(dto.status) as ReferenceLifecycleStatus,
    sourceVideoCount: number(dto.sourceVideoCount),
    acceptedVideoCount: number(dto.acceptedVideoCount),
    acceptedRepCount: number(dto.acceptedRepCount),
    aggregateProfile: object(dto.aggregateProfile),
    normalizedReference: object(dto.normalizedReference),
    qualitySummary: object(dto.qualitySummary),
  };
}

export function mapReferenceSet(value: unknown): ReferenceSetDto {
  const dto = object(value);
  return {
    id: text(dto.id),
    exerciseId: text(dto.exerciseId),
    exerciseName: text(dto.exerciseName),
    pattern: text(dto.pattern),
    status: text(dto.status) as ReferenceLifecycleStatus,
    sources: Array.isArray(dto.sources) ? dto.sources.map(mapReferenceSetSource) : [],
    profiles: Array.isArray(dto.profiles) ? dto.profiles.map(mapReferenceSetProfile) : [],
  };
}
