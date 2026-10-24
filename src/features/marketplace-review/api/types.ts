// Bodies of the backend MarketplaceApprovalsController (platform review of branches and offers).
export type ReviewStatus = 'Draft' | 'PendingReview' | 'Approved' | 'Rejected' | 'Suspended';
export type OfferReviewStatus = 'Draft' | 'PendingAdminReview' | 'Approved' | 'Rejected';

export interface BranchReviewDto {
  id: string;
  gymId: string;
  gymName: string;
  name: string;
  city: string;
  addressLine1: string;
  status: ReviewStatus;
  createdAtUtc: string;
}

export interface OfferReviewDto {
  id: string;
  gymId: string;
  gymName: string;
  gymBranchId: string | null;
  branchName: string | null;
  title: string;
  price: number;
  currencyCode: string;
  status: OfferReviewStatus;
  rejectionReason: string | null;
  isPublished: boolean;
  createdAtUtc: string;
}

/** The backend rejects unknown fields: send exactly these keys. */
export interface DecisionBody {
  reason?: string;
}
