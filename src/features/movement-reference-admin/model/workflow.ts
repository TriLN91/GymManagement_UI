import type { ReferenceSetDto, ReferenceSetSourceDto } from '../api/types';

export type WorkflowNextAction =
  | 'UPLOAD_SOURCE'
  | 'PROCESSING'
  | 'INSPECT_FAILURE'
  | 'REVIEW_SOURCES'
  | 'CONFIRM_PROFILE'
  | 'ACTIVATE_PROFILE'
  | 'LIVE';

export interface WorkflowGuidance {
  nextAction: WorkflowNextAction;
  currentStage: number;
  profileId?: string;
}

export const WORKFLOW_STAGES = [
  'referenceSet',
  'uploadSources',
  'reviewSources',
  'reviewProfile',
  'confirm',
  'activate',
] as const;

export function getWorkflowGuidance(referenceSet: ReferenceSetDto): WorkflowGuidance {
  const active = referenceSet.profiles.find((profile) => profile.status === 'ACTIVE');
  if (active) return { nextAction: 'LIVE', currentStage: WORKFLOW_STAGES.length };

  const confirmed = referenceSet.profiles.find((profile) => profile.status === 'CONFIRMED');
  if (confirmed) {
    return { nextAction: 'ACTIVATE_PROFILE', currentStage: 5, profileId: confirmed.id };
  }

  const reviewRequired = referenceSet.profiles.find(
    (profile) => profile.status === 'REVIEW_REQUIRED',
  );
  if (reviewRequired) {
    return { nextAction: 'CONFIRM_PROFILE', currentStage: 4, profileId: reviewRequired.id };
  }

  if (referenceSet.sources.length === 0) {
    return { nextAction: 'UPLOAD_SOURCE', currentStage: 1 };
  }

  if (referenceSet.sources.some((source) => source.processingStatus === 'PROCESSING')) {
    return { nextAction: 'PROCESSING', currentStage: 1 };
  }

  if (referenceSet.sources.every((source) => source.processingStatus === 'FAILED')) {
    return { nextAction: 'INSPECT_FAILURE', currentStage: 2 };
  }

  return { nextAction: 'REVIEW_SOURCES', currentStage: 2 };
}

export function sourceDescriptionKey(source: ReferenceSetSourceDto): string {
  if (source.processingStatus === 'FAILED') return 'sourceDescription.failed';
  if (source.processingStatus === 'PROCESSING') return 'sourceDescription.processing';
  if (source.decision === 'CLEAR_REJECT' || source.action === 'EXCLUDE') {
    return 'sourceDescription.excluded';
  }
  if (
    source.decision === 'AMBIGUOUS' ||
    source.decision === 'REQUIRES_REVIEW' ||
    source.action === 'REQUIRES_REVIEW'
  ) {
    return 'sourceDescription.review';
  }
  if (source.action === 'DOWN_WEIGHT') return 'sourceDescription.downWeight';
  if (source.decision === 'CLEAR_ACCEPT' && source.action === 'KEEP') {
    return 'sourceDescription.accepted';
  }
  return 'sourceDescription.processed';
}

export function sourceNeedsReview(source: ReferenceSetSourceDto): boolean {
  return (
    source.decision === 'AMBIGUOUS' ||
    source.decision === 'REQUIRES_REVIEW' ||
    source.action === 'REQUIRES_REVIEW'
  );
}
