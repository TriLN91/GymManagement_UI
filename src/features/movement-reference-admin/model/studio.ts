import type { Capability, Readiness } from '../api/movementRuntimeApi';
import type { RuntimeConfiguration } from '../api/runtimeTypes';
import type { ExerciseDto, ReferenceSetSummaryDto } from '../api/types';

export const patterns = ['SQUAT', 'HINGE', 'PULL', 'PUSH', 'OTHER'] as const;
export type StudioTab = 'inspect' | 'configure' | 'history';
export const patternOf = (exercise: ExerciseDto, sets: ReferenceSetSummaryDto[]) =>
  exercise.movementPatternCode ??
  sets.find((set) => set.exerciseId === exercise.id)?.pattern ??
  'UNCLASSIFIED';
export function readinessOf(exercise: ExerciseDto, configs: Readiness[]) {
  if (!exercise.isActive) return 'retired';
  if (configs.some((config) => config.exerciseId === exercise.id && config.available))
    return 'live';
  if (configs.some((config) => config.exerciseId === exercise.id && config.status === 'DRAFT'))
    return 'draft';
  return 'unconfigured';
}
export const capabilityFor = (capabilities: Capability[], pattern: string) =>
  capabilities.find((capability) => capability.pattern === pattern && capability.available);
export const regionJoints: Record<string, number[]> = {
  TORSO: [11, 12, 23, 24],
  HIPS: [23, 24],
  KNEES: [25, 26],
  ANKLES: [27, 28],
  SHOULDERS: [11, 12],
  ELBOWS: [13, 14],
  WRISTS: [15, 16],
};
export const jointIndices: Record<string, number[]> = {
  Shoulder: [11, 12],
  Elbow: [13, 14],
  Wrist: [15, 16],
  Hip: [23, 24],
  Knee: [25, 26],
  Ankle: [27, 28],
};
export function featureJoints(
  capability: RuntimeConfiguration['capability'] | undefined,
  feature: string,
) {
  return (
    capability?.featureGeometry[feature]?.joints.flatMap((joint) => jointIndices[joint] ?? []) ?? []
  );
}
export const formatTime = (ms: number) =>
  `${Math.floor(ms / 60000)}:${((ms / 1000) % 60).toFixed(1).padStart(4, '0')}`;
