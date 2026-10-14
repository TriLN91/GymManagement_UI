import type { ReferenceSetDto, ReferenceSetProfileDto, ReferenceSetSourceDto } from '../api/types';

export type SourceOperationalOutcome =
  'ANALYZING' | 'USABLE' | 'USABLE_REDUCED' | 'NEEDS_REVIEW' | 'EXCLUDED' | 'FAILED';

export type ReferencePresentationState =
  | 'NEEDS_FOOTAGE'
  | 'ANALYZING'
  | 'NEEDS_REVIEW'
  | 'READY_TO_APPROVE'
  | 'APPROVED'
  | 'LIVE'
  | 'UPDATE_READY'
  | 'PROBLEM';

export interface SourceOutcomeCounts {
  usable: number;
  needsReview: number;
  excluded: number;
  failed: number;
  analyzing: number;
}

export interface ViewReferenceState {
  view: string;
  state: ReferencePresentationState;
  sources: ReferenceSetSourceDto[];
  usableSources: number;
  acceptedReps: number;
  liveProfile?: ReferenceSetProfileDto;
  currentCandidate?: ReferenceSetProfileDto;
  history: ReferenceSetProfileDto[];
}

const profileVersionDescending = (a: ReferenceSetProfileDto, b: ReferenceSetProfileDto) =>
  b.version - a.version;

export function getSourceOperationalOutcome(
  source: ReferenceSetSourceDto,
): SourceOperationalOutcome {
  if (source.processingStatus === 'FAILED') return 'FAILED';
  if (source.processingStatus === 'PROCESSING') return 'ANALYZING';
  if (
    source.decision === 'AMBIGUOUS' ||
    source.decision === 'REQUIRES_REVIEW' ||
    source.action === 'REQUIRES_REVIEW'
  ) {
    return 'NEEDS_REVIEW';
  }
  if (source.decision === 'CLEAR_REJECT' || source.action === 'EXCLUDE') return 'EXCLUDED';
  if (source.decision === 'CLEAR_ACCEPT' && source.action === 'DOWN_WEIGHT') {
    return 'USABLE_REDUCED';
  }
  if (source.decision === 'CLEAR_ACCEPT' && source.action === 'KEEP') return 'USABLE';
  return 'NEEDS_REVIEW';
}

export function countSourceOutcomes(sources: ReferenceSetSourceDto[]): SourceOutcomeCounts {
  return sources.reduce<SourceOutcomeCounts>(
    (counts, source) => {
      const outcome = getSourceOperationalOutcome(source);
      if (outcome === 'USABLE' || outcome === 'USABLE_REDUCED') counts.usable += 1;
      else if (outcome === 'NEEDS_REVIEW') counts.needsReview += 1;
      else if (outcome === 'EXCLUDED') counts.excluded += 1;
      else if (outcome === 'FAILED') counts.failed += 1;
      else counts.analyzing += 1;
      return counts;
    },
    { usable: 0, needsReview: 0, excluded: 0, failed: 0, analyzing: 0 },
  );
}

export function selectProfilesForView(profiles: ReferenceSetProfileDto[]) {
  const ordered = profiles.slice().sort(profileVersionDescending);
  const liveProfile = ordered.find((profile) => profile.status === 'ACTIVE');
  const newest = ordered[0];
  const currentCandidate = newest && newest.id !== liveProfile?.id ? newest : undefined;
  const promoted = new Set([liveProfile?.id, currentCandidate?.id].filter(Boolean));
  return {
    liveProfile,
    currentCandidate,
    history: ordered.filter((profile) => !promoted.has(profile.id)),
  };
}

function presentationState(
  sources: ReferenceSetSourceDto[],
  liveProfile?: ReferenceSetProfileDto,
  currentCandidate?: ReferenceSetProfileDto,
): ReferencePresentationState {
  if (currentCandidate) {
    if (currentCandidate.status === 'FAILED') return 'PROBLEM';
    if (currentCandidate.status === 'PROCESSING') return 'ANALYZING';
    if (liveProfile && ['REVIEW_REQUIRED', 'CONFIRMED'].includes(currentCandidate.status)) {
      return 'UPDATE_READY';
    }
    if (currentCandidate.status === 'CONFIRMED') return 'APPROVED';
    if (currentCandidate.status === 'REVIEW_REQUIRED') return 'READY_TO_APPROVE';
  }
  if (liveProfile) return 'LIVE';
  const outcomes = sources.map(getSourceOperationalOutcome);
  if (outcomes.includes('NEEDS_REVIEW')) return 'NEEDS_REVIEW';
  if (outcomes.includes('ANALYZING')) return 'ANALYZING';
  if (outcomes.includes('FAILED') && outcomes.every((item) => item === 'FAILED')) return 'PROBLEM';
  return 'NEEDS_FOOTAGE';
}

export function getViewReferenceStates(referenceSet: ReferenceSetDto): ViewReferenceState[] {
  const views = new Set<string>();
  referenceSet.sources.forEach((source) => {
    if (source.detectedView && getSourceOperationalOutcome(source) !== 'EXCLUDED') {
      views.add(source.detectedView);
    }
  });
  referenceSet.profiles.forEach((profile) => views.add(profile.view));

  return [...views].sort().map((view) => {
    const sources = referenceSet.sources.filter((source) => source.detectedView === view);
    const profiles = referenceSet.profiles.filter((profile) => profile.view === view);
    const selected = selectProfilesForView(profiles);
    const usable = sources.filter((source) => {
      const outcome = getSourceOperationalOutcome(source);
      return outcome === 'USABLE' || outcome === 'USABLE_REDUCED';
    });
    return {
      view,
      sources,
      usableSources: usable.length,
      acceptedReps: usable.reduce((total, source) => total + source.acceptedRepCount, 0),
      state: presentationState(sources, selected.liveProfile, selected.currentCandidate),
      ...selected,
    };
  });
}

const attentionOrder: ReferencePresentationState[] = [
  'PROBLEM',
  'NEEDS_REVIEW',
  'UPDATE_READY',
  'READY_TO_APPROVE',
  'APPROVED',
  'ANALYZING',
  'NEEDS_FOOTAGE',
  'LIVE',
];

export function rollUpExerciseState(referenceSet: ReferenceSetDto): ReferencePresentationState {
  const views = getViewReferenceStates(referenceSet);
  const unassignedSources = referenceSet.sources.filter(
    (source) => !source.detectedView || !views.some((view) => view.view === source.detectedView),
  );
  const unassignedOutcomes = unassignedSources.map(getSourceOperationalOutcome);
  if (unassignedOutcomes.includes('FAILED')) return 'PROBLEM';
  if (unassignedOutcomes.includes('NEEDS_REVIEW')) return 'NEEDS_REVIEW';
  if (unassignedOutcomes.includes('ANALYZING')) return 'ANALYZING';
  if (views.length === 0) {
    const outcomes = countSourceOutcomes(referenceSet.sources);
    if (outcomes.failed > 0) return 'PROBLEM';
    if (outcomes.needsReview > 0) return 'NEEDS_REVIEW';
    if (outcomes.analyzing > 0) return 'ANALYZING';
    return 'NEEDS_FOOTAGE';
  }
  return (
    attentionOrder.find((state) => views.some((view) => view.state === state)) ?? 'NEEDS_FOOTAGE'
  );
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

export function getContributingSourceIds(profile: ReferenceSetProfileDto): string[] {
  const directKeys = ['sourceReferenceIds', 'sourceIds', 'contributingSourceIds'];
  const pending: unknown[] = [profile.aggregateProfile];
  const visited = new Set<unknown>();
  while (pending.length > 0) {
    const current = pending.shift();
    if (!current || typeof current !== 'object' || visited.has(current)) continue;
    visited.add(current);
    if (Array.isArray(current)) {
      pending.push(...(current as unknown[]));
      continue;
    }
    const record = current as Record<string, unknown>;
    for (const key of directKeys) {
      const values = stringArray(record[key]);
      if (values.length > 0) return [...new Set(values)];
    }
    pending.push(...Object.values(record));
  }
  return [];
}
