import { apiDelete, apiGet, apiPost, apiPut } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

// ============================================================================
// Types matching Backend DTOs (System.Text.Json camelCase)
// ============================================================================

export interface BranchSearchParams {
  latitude?: number | null;
  longitude?: number | null;
  radiusKm?: number;
  city?: string | null;
  district?: string | null;
  searchTerm?: string | null;
  minRating?: number | null;
}

export interface GymBranchCardView {
  id: string;
  gymId: string;
  brandName: string;
  branchName: string;
  addressLine1: string;
  city: string;
  district?: string | null;
  latitude: number;
  longitude: number;
  distanceKm?: number | null;
  averageRating: number;
  reviewCount: number;
  coverImageUrl?: string | null;
  facilitiesJson?: string | null;
  openingHoursJson?: string | null;
}

export interface BranchTrainerDto {
  trainerProfileId: string;
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  averageRating: number;
  assignedAtUtc: string;
}

export interface GymOfferView {
  id: string;
  gymId: string;
  gymBranchId?: string | null;
  title: string;
  description: string;
  durationType: string;
  durationValue: number;
  gymServicePrice: number;
  includesPlus: boolean;
  plusDurationDays: number;
  plusPrice: number;
  approvalStatus: string;
  isPublished: boolean;
  /** Hours of notice to cancel or move a session free of charge; null uses the platform default. */
  minNoticeHours?: number | null;
}

export interface GymBranchDetailView {
  id: string;
  gymId: string;
  brandName: string;
  branchName: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  district?: string | null;
  province?: string | null;
  countryCode: string;
  phoneNumber?: string | null;
  latitude: number;
  longitude: number;
  distanceKm?: number | null;
  averageRating: number;
  reviewCount: number;
  coverImageUrl?: string | null;
  facilitiesJson?: string | null;
  openingHoursJson?: string | null;
  approvalStatus: string;
  offers: GymOfferView[];
  trainers: BranchTrainerDto[];
}

export interface GymBrandView {
  id: string;
  ownerId?: string | null;
  name: string;
  legalName?: string | null;
  taxCode?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  contactEmail?: string | null;
  phoneNumber?: string | null;
  description?: string | null;
  approvalStatus: string;
  branchesCount: number;
  averageRating: number;
  createdAtUtc: string;
}

export interface CheckoutOrderRequest {
  gymOfferId?: string | null;
  trainerServiceId?: string | null;
  trainerProfileId?: string | null;
  gymBranchId?: string | null;
  paymentProvider?: string | null;
  interestedInDiscountedPlus?: boolean;
}

export interface CheckoutOrderResponse {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  platformCommissionAmount: number;
  gymPayoutAmount: number;
  paymentStatus: string;
  paymentUrl?: string | null;
}

export interface OrderView {
  id: string;
  orderNumber: string;
  memberProfileId: string;
  gymId: string;
  gymBranchId?: string | null;
  gymBranchName?: string | null;
  gymOfferId?: string | null;
  gymOfferTitle?: string | null;
  trainerServiceId?: string | null;
  gymServiceAmount: number;
  plusAmount: number;
  totalAmount: number;
  platformCommissionAmount: number;
  gymPayoutAmount: number;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  enrollmentStatus?: string | null;
  paidAtUtc?: string | null;
  createdAtUtc: string;
}

export interface TrainerAppointmentView {
  id: string;
  gymId: string;
  gymBranchId?: string | null;
  gymBranchName?: string | null;
  memberProfileId: string;
  originalTrainerProfileId: string;
  originalTrainerName: string;
  currentTrainerProfileId: string;
  currentTrainerName: string;
  scheduledAtUtc: string;
  durationMinutes: number;
  status: string;
  isReassigned: boolean;
  reassignmentReason?: string | null;
  memberConsentApproved: boolean;
  completedAtUtc?: string | null;
  rating?: number | null;
  memberFeedback?: string | null;
}

export interface ReassignAppointmentRequest {
  newTrainerProfileId: string;
  reason: string;
}

export interface BranchRevenueSummaryDto {
  branchId: string;
  branchName: string;
  grossAmount: number;
  platformCommissionAmount: number;
  gymPayoutAmount: number;
  orderCount: number;
}

export interface BrandRevenueSummaryDto {
  brandId: string;
  brandName: string;
  totalGross: number;
  totalPlatformFee: number;
  totalNetPayout: number;
  totalOrders: number;
  branchBreakdown: BranchRevenueSummaryDto[];
}

export interface TrainerKpiDto {
  trainerProfileId: string;
  trainerName: string;
  activeClients: number;
  completedSessions: number;
  averageRating: number;
  reassignmentsCount: number;
}

export interface CreateGymTrainerRequest {
  email: string;
  fullName: string;
  branchId: string;
  additionalBranchIds?: string[];
}

export interface CreateGymTrainerResponse {
  trainerProfileId: string;
  userId: string;
  email: string;
  fullName: string;
  temporaryPassword: string;
  primaryBranchName: string;
  assignedBranchIds: string[];
}

export interface BranchBriefDto {
  branchId: string;
  branchName: string;
}

export interface GymTrainerOverviewDto {
  trainerProfileId: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  yearsOfExperience: number;
  isActive: boolean;
  isProfileComplete: boolean;
  averageRating: number;
  activeClientsCount: number;
  completedSessionsCount: number;
  scheduledSessionsCount: number;
  assignedBranches: BranchBriefDto[];
}

export interface GymTrainersLeaderboardDto {
  topBookedTrainer?: GymTrainerOverviewDto | null;
  totalTrainers: number;
  activeTrainers: number;
  incompleteProfilesCount: number;
  trainers: GymTrainerOverviewDto[];
}

export interface TrainerProfileStatusDto {
  trainerProfileId: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  bio?: string | null;
  yearsOfExperience: number;
  certificationSummary?: string | null;
  hourlyRate?: number | null;
  isProfileComplete: boolean;
  gymOrganizationId?: string | null;
  gymBrandName?: string | null;
}

export interface UpdateTrainerSelfProfileRequest {
  fullName: string;
  phoneNumber?: string | null;
  bio: string;
  yearsOfExperience: number;
  certificationSummary?: string | null;
  hourlyRate?: number | null;
}

export interface CreateGymBrandRequest {
  name: string;
  legalName?: string | null;
  taxCode?: string | null;
  bankAccountInfoJson?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  contactEmail?: string | null;
  phoneNumber?: string | null;
  description?: string | null;
}

export interface UpdateGymBrandRequest {
  name: string;
  legalName?: string | null;
  taxCode?: string | null;
  bankAccountInfoJson?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  contactEmail?: string | null;
  phoneNumber?: string | null;
  description?: string | null;
}

export interface CreateGymBranchRequest {
  name: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  district?: string | null;
  province?: string | null;
  countryCode: string;
  phoneNumber?: string | null;
  latitude: number;
  longitude: number;
  facilitiesJson?: string | null;
  openingHoursJson?: string | null;
  coverImageUrl?: string | null;
}

export interface UpdateGymBranchRequest {
  name: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  district?: string | null;
  province?: string | null;
  countryCode: string;
  phoneNumber?: string | null;
  latitude: number;
  longitude: number;
  facilitiesJson?: string | null;
  openingHoursJson?: string | null;
  coverImageUrl?: string | null;
}

export interface CreateGymOfferRequest {
  title: string;
  description: string;
  durationType: 'Day' | 'Month' | 'Year';
  durationValue: number;
  gymServicePrice: number;
  includesPlus: boolean;
  plusDurationDays: number;
  plusPrice: number;
  isPublished: boolean;
  sessionsIncluded?: number;
  /** 0 to 720 hours; omit to use the platform default (24). */
  minNoticeHours?: number;
}

// ============================================================================
// API Service Methods
// ============================================================================

export const marketplaceApi = {
  // Member: Discovery & Branches
  async getBranches(params?: BranchSearchParams): Promise<GymBranchCardView[]> {
    const query = new URLSearchParams();
    if (params?.latitude != null) query.append('lat', params.latitude.toString());
    if (params?.longitude != null) query.append('lng', params.longitude.toString());
    if (params?.radiusKm != null) query.append('radiusKm', params.radiusKm.toString());
    if (params?.city) query.append('city', params.city);
    if (params?.district) query.append('district', params.district);
    if (params?.searchTerm) query.append('search', params.searchTerm);
    if (params?.minRating != null) query.append('minRating', params.minRating.toString());

    const qs = query.toString();
    const url = qs ? `${ENDPOINTS.marketplace.branches}?${qs}` : ENDPOINTS.marketplace.branches;
    return apiGet<GymBranchCardView[]>(url);
  },

  async getBranchDetail(branchId: string): Promise<GymBranchDetailView> {
    return apiGet<GymBranchDetailView>(ENDPOINTS.marketplace.branchDetail(branchId));
  },

  async getBrandBranches(brandId: string): Promise<GymBranchCardView[]> {
    return apiGet<GymBranchCardView[]>(ENDPOINTS.marketplace.brandBranches(brandId));
  },

  async getOffers(): Promise<GymOfferView[]> {
    return apiGet<GymOfferView[]>(ENDPOINTS.marketplace.offers);
  },

  // Member: Orders & Checkout
  async checkout(req: CheckoutOrderRequest): Promise<CheckoutOrderResponse> {
    return apiPost<CheckoutOrderResponse, CheckoutOrderRequest>(
      ENDPOINTS.marketplace.orders.checkout,
      req,
    );
  },

  async getOrder(orderId: string): Promise<OrderView> {
    return apiGet<OrderView>(ENDPOINTS.marketplace.orders.detail(orderId));
  },

  async getMyOrders(): Promise<OrderView[]> {
    return apiGet<OrderView[]>(ENDPOINTS.marketplace.orders.me);
  },

  async cancelOrder(orderId: string, reason?: string): Promise<OrderView> {
    return apiPost<OrderView>(ENDPOINTS.marketplace.orders.cancel(orderId), { reason });
  },

  async consentReassign(appointmentId: string, accept: boolean): Promise<TrainerAppointmentView> {
    return apiPost<TrainerAppointmentView>(
      ENDPOINTS.marketplace.orders.consentReassign(appointmentId),
      { accept },
    );
  },

  async getInvoiceHtml(orderId: string): Promise<string> {
    return apiGet<string>(ENDPOINTS.marketplace.orders.invoiceHtml(orderId));
  },

  async downloadInvoiceHtml(orderId: string, orderNumber: string): Promise<void> {
    const html = await apiGet<string>(ENDPOINTS.marketplace.orders.invoiceHtml(orderId));
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HoaDon_FitFlex_${orderNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  async openInvoiceHtml(orderId: string): Promise<void> {
    const html = await apiGet<string>(ENDPOINTS.marketplace.orders.invoiceHtml(orderId));
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  },

  async resendInvoiceEmail(orderId: string): Promise<boolean> {
    return apiPost<boolean>(ENDPOINTS.marketplace.orders.sendInvoiceEmail(orderId), {});
  },

  // Gym Owner Portal
  async getMyBrands(): Promise<GymBrandView[]> {
    return apiGet<GymBrandView[]>(ENDPOINTS.gymOwner.myBrands);
  },

  async getBrandDetail(brandId: string): Promise<GymBrandView> {
    return apiGet<GymBrandView>(ENDPOINTS.gymOwner.brandDetail(brandId));
  },

  async createBrand(req: CreateGymBrandRequest): Promise<GymBrandView> {
    return apiPost<GymBrandView, CreateGymBrandRequest>(ENDPOINTS.gymOwner.brands, req);
  },

  async updateBrand(brandId: string, req: UpdateGymBrandRequest): Promise<GymBrandView> {
    return apiPut<GymBrandView, UpdateGymBrandRequest>(
      ENDPOINTS.gymOwner.brandDetail(brandId),
      req,
    );
  },

  async createBranch(brandId: string, req: CreateGymBranchRequest): Promise<GymBranchDetailView> {
    return apiPost<GymBranchDetailView, CreateGymBranchRequest>(
      ENDPOINTS.gymOwner.createBranch(brandId),
      req,
    );
  },

  async updateBranch(branchId: string, req: UpdateGymBranchRequest): Promise<GymBranchDetailView> {
    return apiPut<GymBranchDetailView, UpdateGymBranchRequest>(
      ENDPOINTS.gymOwner.updateBranch(branchId),
      req,
    );
  },

  async assignBranchManager(branchId: string, managerUserId: string): Promise<GymBranchDetailView> {
    return apiPut<GymBranchDetailView>(ENDPOINTS.gymOwner.assignManager(branchId), {
      branchManagerUserId: managerUserId,
    });
  },

  async assignTrainerToBranch(branchId: string, trainerProfileId: string): Promise<void> {
    return apiPost<void>(ENDPOINTS.gymOwner.assignTrainer(branchId), { trainerProfileId });
  },

  async removeTrainerFromBranch(branchId: string, trainerProfileId: string): Promise<void> {
    return apiDelete<void>(ENDPOINTS.gymOwner.removeTrainer(branchId, trainerProfileId));
  },

  async createGymTrainer(req: CreateGymTrainerRequest): Promise<CreateGymTrainerResponse> {
    return apiPost<CreateGymTrainerResponse, CreateGymTrainerRequest>(
      ENDPOINTS.gymOwner.trainers,
      req,
    );
  },

  async getGymTrainersOverview(): Promise<GymTrainersLeaderboardDto> {
    return apiGet<GymTrainersLeaderboardDto>(ENDPOINTS.gymOwner.trainersOverview);
  },

  async updateTrainerStatus(trainerProfileId: string, isActive: boolean): Promise<boolean> {
    return apiPut<boolean>(ENDPOINTS.gymOwner.updateTrainerStatus(trainerProfileId), { isActive });
  },

  async updateTrainerBranches(trainerProfileId: string, branchIds: string[]): Promise<boolean> {
    return apiPut<boolean>(ENDPOINTS.gymOwner.updateTrainerBranches(trainerProfileId), {
      branchIds,
    });
  },

  async unlinkTrainer(trainerProfileId: string): Promise<boolean> {
    return apiDelete<boolean>(ENDPOINTS.gymOwner.deleteTrainer(trainerProfileId));
  },

  async relinkTrainer(trainerProfileId: string): Promise<boolean> {
    return apiPost<boolean>(ENDPOINTS.gymOwner.relinkTrainer(trainerProfileId));
  },

  async getTrainerProfileStatus(): Promise<TrainerProfileStatusDto> {
    return apiGet<TrainerProfileStatusDto>(ENDPOINTS.trainer.profileStatus);
  },

  async updateTrainerSelfProfile(
    req: UpdateTrainerSelfProfileRequest,
  ): Promise<TrainerProfileStatusDto> {
    return apiPut<TrainerProfileStatusDto, UpdateTrainerSelfProfileRequest>(
      ENDPOINTS.trainer.updateProfile,
      req,
    );
  },

  async getBrandDashboard(brandId: string): Promise<BrandRevenueSummaryDto> {
    return apiGet<BrandRevenueSummaryDto>(ENDPOINTS.gymOwner.brandDashboard(brandId));
  },

  async getBranchDashboard(branchId: string): Promise<BranchRevenueSummaryDto> {
    return apiGet<BranchRevenueSummaryDto>(ENDPOINTS.gymOwner.branchDashboard(branchId));
  },

  // Branch Manager Portal
  async getBranchOffers(branchId: string): Promise<GymOfferView[]> {
    return apiGet<GymOfferView[]>(ENDPOINTS.branchManager.branchOffers(branchId));
  },

  async createBranchOffer(branchId: string, req: CreateGymOfferRequest): Promise<GymOfferView> {
    return apiPost<GymOfferView, CreateGymOfferRequest>(
      ENDPOINTS.branchManager.branchOffers(branchId),
      req,
    );
  },

  async updateOffer(offerId: string, req: Partial<CreateGymOfferRequest>): Promise<GymOfferView> {
    return apiPut<GymOfferView>(ENDPOINTS.branchManager.updateOffer(offerId), req);
  },

  async getBranchAppointments(branchId: string): Promise<TrainerAppointmentView[]> {
    return apiGet<TrainerAppointmentView[]>(ENDPOINTS.branchManager.appointments(branchId));
  },

  async reassignAppointment(
    appointmentId: string,
    req: ReassignAppointmentRequest,
  ): Promise<TrainerAppointmentView> {
    return apiPost<TrainerAppointmentView, ReassignAppointmentRequest>(
      ENDPOINTS.branchManager.reassignAppointment(appointmentId),
      req,
    );
  },

  async getBranchTrainersKpi(branchId: string): Promise<TrainerKpiDto[]> {
    return apiGet<TrainerKpiDto[]>(ENDPOINTS.branchManager.trainersKpi(branchId));
  },
};
