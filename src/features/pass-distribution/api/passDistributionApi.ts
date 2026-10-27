import type {
  AcceptOfferRequest,
  ActiveMemberAiPassResponse,
  CreateDistributionProgramRequest,
  DeclineOfferRequest,
  DistributionOfferDto,
  DistributionProgramDto,
  GymDistributionAgreementDto,
  OfferActionResponse,
  PassCreditBatchDto,
  PassCreditInventoryDto,
  PassTypeDto,
  SendDistributionOfferRequest,
  TopUpPassCreditRequest,
  UpdateDistributionProgramRequest,
} from '../types';

import { apiGet, apiPost, apiPut } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const passDistributionApi = {
  getRecipients: (gymId: string) =>
    apiGet<{ memberProfileId: string; fullName: string; email: string }[]>(
      `/gym-distribution/${gymId}/recipients`,
    ),
  getCapabilities: (): Promise<{ demoProvisioningEnabled: boolean }> =>
    apiGet(ENDPOINTS.passDistribution.capabilities),
  // Catalog
  getPassTypes: (onlyActive = true): Promise<PassTypeDto[]> =>
    apiGet<PassTypeDto[]>(ENDPOINTS.passDistribution.passTypes(onlyActive)),

  // Gym B2B & Inventory
  getGymAgreements: (gymId: string): Promise<GymDistributionAgreementDto[]> =>
    apiGet<GymDistributionAgreementDto[]>(ENDPOINTS.passDistribution.agreements(gymId)),

  getGymInventory: (gymId: string): Promise<PassCreditInventoryDto> =>
    apiGet<PassCreditInventoryDto>(ENDPOINTS.passDistribution.inventory(gymId)),

  topUpCredits: (gymId: string, req: TopUpPassCreditRequest): Promise<PassCreditBatchDto> =>
    apiPost<PassCreditBatchDto, TopUpPassCreditRequest>(
      ENDPOINTS.passDistribution.topUp(gymId),
      req,
    ),

  // Gym Distribution Programs
  getGymPrograms: (gymId: string): Promise<DistributionProgramDto[]> =>
    apiGet<DistributionProgramDto[]>(ENDPOINTS.passDistribution.programs(gymId)),

  createProgram: (
    gymId: string,
    req: CreateDistributionProgramRequest,
  ): Promise<DistributionProgramDto> =>
    apiPost<DistributionProgramDto, CreateDistributionProgramRequest>(
      ENDPOINTS.passDistribution.createProgram(gymId),
      req,
    ),

  updateProgram: (
    gymId: string,
    programId: string,
    req: UpdateDistributionProgramRequest,
  ): Promise<DistributionProgramDto> =>
    apiPut<DistributionProgramDto, UpdateDistributionProgramRequest>(
      ENDPOINTS.passDistribution.updateProgram(gymId, programId),
      req,
    ),

  // Gym Offers
  getGymOffers: (
    gymId: string,
    branchId?: string,
    status?: number,
  ): Promise<DistributionOfferDto[]> =>
    apiGet<DistributionOfferDto[]>(ENDPOINTS.passDistribution.offers(gymId, branchId, status)),

  sendOffer: (
    gymId: string,
    req: SendDistributionOfferRequest,
    branchId?: string,
  ): Promise<DistributionOfferDto> =>
    apiPost<DistributionOfferDto, SendDistributionOfferRequest>(
      ENDPOINTS.passDistribution.sendOffer(gymId, branchId),
      req,
    ),

  cancelOffer: (gymId: string, offerId: string): Promise<{ offerId: string }> =>
    apiPost<{ offerId: string }, Record<string, never>>(
      ENDPOINTS.passDistribution.cancelOffer(gymId, offerId),
      {},
    ),

  // Member AI Pass
  getMemberOffers: (): Promise<DistributionOfferDto[]> =>
    apiGet<DistributionOfferDto[]>(ENDPOINTS.passDistribution.memberOffers),

  acceptOffer: (offerId: string, req: AcceptOfferRequest): Promise<OfferActionResponse> =>
    apiPost<OfferActionResponse, AcceptOfferRequest>(
      ENDPOINTS.passDistribution.acceptOffer(offerId),
      req,
    ),

  declineOffer: (offerId: string, req: DeclineOfferRequest = {}): Promise<{ offerId: string }> =>
    apiPost<{ offerId: string }, DeclineOfferRequest>(
      ENDPOINTS.passDistribution.declineOffer(offerId),
      req,
    ),

  getCurrentPass: (): Promise<ActiveMemberAiPassResponse> =>
    apiGet<ActiveMemberAiPassResponse>(ENDPOINTS.passDistribution.currentPass),
};
