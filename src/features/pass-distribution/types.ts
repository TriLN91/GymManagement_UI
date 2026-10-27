export type AiTierType = 'Basic' | 'Plus' | 'CoachAi' | 'Enterprise';
export type PassCreditStatus = 'Available' | 'Reserved' | 'Consumed' | 'Expired';
export type DistributionOfferStatus = 'Pending' | 'Accepted' | 'Declined' | 'Cancelled' | 'Expired';
export type MemberAiPassStatus = 'Active' | 'Expired' | 'Replaced' | 'Revoked';
export type AiPassSourceType = 'PersonalPurchase' | 'GymDistributed' | 'PlatformGrant';
export type GymDistributionAgreementStatus = 'Active' | 'Expired' | 'Suspended' | 'Terminated';
export type DistributionBranchScope = 'AllBranches' | 'SpecificBranches';

export interface PassTypeDto {
  id: string;
  code: string;
  name: string;
  description: string;
  aiTier: AiTierType;
  durationDays: number;
  allowedAssessmentsCount: number;
  featuresJson: string;
  wholesaleCreditPrice: number;
  suggestedRetailPrice: number;
  isActive: boolean;
}

export interface PassCreditBatchDto {
  id: string;
  gymId: string;
  agreementId: string;
  passTypeId: string;
  passTypeCode: string;
  passTypeName: string;
  batchCode: string;
  initialCredits: number;
  availableCredits: number;
  reservedCredits: number;
  consumedCredits: number;
  expiredCredits: number;
  unitPrice: number;
  totalAmount: number;
  purchasedAtUtc: string;
  expirationUtc: string;
  isTopUp: boolean;
}

export interface GymDistributionAgreementDto {
  id: string;
  gymId: string;
  gymName: string;
  agreementNumber: string;
  packageName: string;
  startsAtUtc: string;
  expiresAtUtc: string;
  status: GymDistributionAgreementStatus;
  branchScope: DistributionBranchScope;
  hasTrainerAiAccess: boolean;
  batches: PassCreditBatchDto[];
}

export interface PassCreditTypeSummaryDto {
  passTypeId: string;
  passTypeCode: string;
  passTypeName: string;
  available: number;
  reserved: number;
  consumed: number;
  expired: number;
  nearestExpirationUtc: string | null;
}

export interface PassCreditInventoryDto {
  gymId: string;
  byPassType: PassCreditTypeSummaryDto[];
  totalAvailable: number;
  totalReserved: number;
  totalConsumed: number;
  totalExpired: number;
}

export interface DistributionProgramDto {
  id: string;
  gymId: string;
  passTypeId: string;
  passTypeName: string;
  name: string;
  description: string;
  messageTemplate: string | null;
  isActive: boolean;
}

export interface CreateDistributionProgramRequest {
  passTypeId: string;
  name: string;
  description: string;
  messageTemplate?: string;
}

export interface UpdateDistributionProgramRequest {
  name: string;
  description: string;
  messageTemplate?: string;
  isActive: boolean;
}

export interface DistributionOfferDto {
  id: string;
  gymId: string;
  gymName: string;
  gymBranchId: string | null;
  branchName: string | null;
  distributionProgramId: string | null;
  programName: string | null;
  memberProfileId: string;
  memberFullName: string;
  memberEmail: string;
  passCreditId: string;
  passTypeId: string;
  passTypeName: string;
  status: DistributionOfferStatus;
  message: string | null;
  offerSentAtUtc: string;
  expiresAtUtc: string;
  respondedAtUtc: string | null;
  declinedReason: string | null;
}

export interface SendDistributionOfferRequest {
  memberProfileId: string;
  passTypeId: string;
  gymBranchId?: string;
  distributionProgramId?: string;
  message?: string;
}

export interface TopUpPassCreditRequest {
  agreementId: string;
  passTypeId: string;
  quantity: number;
  unitPrice: number;
}

export interface AcceptOfferRequest {
  acknowledgeReplaceCurrentPass?: boolean;
  expectedCurrentPassId?: string | null;
}

export interface DeclineOfferRequest {
  reason?: string;
}

export interface PassEntitlementSnapshotDto {
  passCode: string;
  passName: string;
  aiTier: AiTierType;
  featuresJson: string;
  allowedAssessmentsCount: number;
  startsAtUtc: string;
  expiresAtUtc: string;
  sourceType: AiPassSourceType;
  issuerName?: string | null;
}

export interface MemberAiPassDto {
  id: string;
  memberProfileId: string;
  passTypeId: string;
  passName: string;
  sourceType: AiPassSourceType;
  status: MemberAiPassStatus;
  startsAtUtc: string;
  expiresAtUtc: string;
  activatedAtUtc: string;
  snapshot: PassEntitlementSnapshotDto | null;
}

export interface ActiveMemberAiPassResponse {
  hasActivePass: boolean;
  activePass: MemberAiPassDto | null;
  daysRemaining: number;
}

export interface OfferActionResponse {
  success: boolean;
  message: string;
  passId?: string | null;
  requiresReplacementConfirmation: boolean;
  currentActivePass?: MemberAiPassDto | null;
}
