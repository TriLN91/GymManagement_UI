import type { BranchReviewDto, DecisionBody, OfferReviewDto } from './types';

import { apiGet, apiPost } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

const E = ENDPOINTS.marketplaceReview;

export const marketplaceReviewApi = {
  listBranches: () => apiGet<BranchReviewDto[]>(E.branches),
  decideBranch: (id: string, approve: boolean, body: DecisionBody) =>
    apiPost<BranchReviewDto>(approve ? E.approveBranch(id) : E.rejectBranch(id), body),
  listOffers: () => apiGet<OfferReviewDto[]>(E.offers),
  decideOffer: (id: string, approve: boolean, body: DecisionBody) =>
    apiPost<OfferReviewDto>(approve ? E.approveOffer(id) : E.rejectOffer(id), body),
};
