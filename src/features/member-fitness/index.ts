// Public API of the member-fitness feature: the fitness profile wizard model/store and its
// sync with the backend (CF01).
export { syncProfileToBackend } from './api/fitnessApi';
export {
  ENERGY_FORMULA_VERSION,
  ESTIMATE_UNCERTAINTY,
  PAL_BY_ACTIVITY,
  estimateEnergy,
  type EnergyEstimate,
} from './model/energyEstimate';
export {
  EMPTY_PROFILE,
  FITNESS_GOAL_IDS,
  calculateProfileReadiness,
  getInjuryAdvice,
  toggleExclusiveValue,
  type FitnessGoalId,
  type InjuryAdvice,
  type MemberFitnessProfile,
  type TernaryAnswer,
  type YesNoAnswer,
} from './model/profileSetupModel';
export { useProfileSetupStore } from './model/useProfileSetupStore';
export { useSyncFitnessProfile } from './model/useSyncFitnessProfile';
