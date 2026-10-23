import type {
  CheckoutGymPackageRequest,
  CheckoutGymPackageResponse,
  ConfirmSandboxGymPaymentRequest,
  GymFeatureAccessResult,
  GymSubscriptionPackageView,
  GymSubscriptionView,
} from './types';

import { apiGet, apiPost } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const gymSubscriptionApi = {
  getPackages: (): Promise<GymSubscriptionPackageView[]> =>
    apiGet<GymSubscriptionPackageView[]>(ENDPOINTS.gymSubscription.packages),

  getCurrentSubscription: (): Promise<GymSubscriptionView | null> =>
    apiGet<GymSubscriptionView | null>(ENDPOINTS.gymSubscription.current),

  getHistory: (gymId: string): Promise<GymSubscriptionView[]> =>
    apiGet<GymSubscriptionView[]>(ENDPOINTS.gymSubscription.history(gymId)),

  checkout: (request: CheckoutGymPackageRequest): Promise<CheckoutGymPackageResponse> =>
    apiPost<CheckoutGymPackageResponse, CheckoutGymPackageRequest>(
      ENDPOINTS.gymSubscription.checkout,
      request,
    ),

  confirmSandboxPayment: (request: ConfirmSandboxGymPaymentRequest): Promise<GymSubscriptionView> =>
    apiPost<GymSubscriptionView, ConfirmSandboxGymPaymentRequest>(
      ENDPOINTS.gymSubscription.sandboxConfirm,
      request,
    ),

  checkAccess: (featureCode: string): Promise<GymFeatureAccessResult> =>
    apiGet<GymFeatureAccessResult>(ENDPOINTS.gymSubscription.checkAccess(featureCode)),
};
