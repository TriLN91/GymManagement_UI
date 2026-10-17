export type RuntimeRule = {
  code: string;
  feature: string;
  enabled: boolean;
  lower: number;
  upper: number;
  phases: string[];
  cue: string;
  scope: string;
  evidence: string;
};
export type RuntimeConfiguration = {
  schemaVersion: 'movement-runtime-v1';
  id: string;
  version: number;
  exerciseId: string;
  exercise: { name: string; equipment?: string; instructions?: string };
  referenceProfileId: string;
  referenceVersion: number;
  featureDefinitionsVersion: string;
  pattern: string;
  view: string;
  selectedRegions: string[];
  selectedFeatures: string[];
  capability: {
    code: string;
    label: string;
    driver: string;
    coordinateSpace: string;
    viewClassifier: {
      pureSideWidth: number;
      obliqueSideWidth: number;
      obliqueFrontWidth: number;
      minimumSideDepth: number;
      frontDepth: number;
    };
    requiredRegions: string[];
    phases: string[];
    featureGeometry: Record<string, { kind: string; joints: string[] }>;
  };
  segmentation: {
    driver: string;
    extendedAngle: number;
    flexedAngle: number;
    startProgress: number;
    returnProgress: number;
    peakProgress: number;
    completionHoldMs: number;
    minimumRepMs: number;
    maximumRepMs: number;
    minimumUsableRatio: number;
  };
  quality: {
    minimumVisibility: number;
    minimumPresence: number;
    stableReadyMs: number;
    maximumPoseGapMs: number;
  };
  cuePolicy: { dwellMs: number; cooldownMs: number; maximumAgeMs: number };
  rules: RuntimeRule[];
  reviewRequired: boolean;
  limitations: string;
};
export type RuntimeVersion = {
  id: string;
  exerciseId: string;
  referenceProfileId: string;
  version: number;
  view: string;
  status: string;
  reviewNote?: string;
  configuration: RuntimeConfiguration;
};
export type VisualEvidence = {
  sourceReferenceId: string;
  featureDefinitionsVersion: string;
  sourceVideo: { width: number; height: number };
  frames: {
    timeMs: number;
    usable: boolean;
    landmarks: { index: number; x: number; y: number; visibility: number }[];
    features: Record<string, number>;
  }[];
  repetitions: {
    repIndex: number;
    status: string;
    startTimestampMs: number;
    endTimestampMs: number;
    rejectionReasons: string[];
    phases: { name: string; startTimestampMs: number; endTimestampMs: number }[];
  }[];
};
