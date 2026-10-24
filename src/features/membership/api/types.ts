export type GymSubscriptionStatus =
  'PendingPayment' | 'Active' | 'Expired' | 'Cancelled' | 'Suspended';

export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';

export interface GymSubscriptionPackageView {
  id: string;
  name: string;
  code: string;
  description: string;
  price: number;
  currencyCode: string;
  durationMonths: number;
  maxMembers: number;
  maxTrainers: number;
  features: string[];
  isActive: boolean;
  displayOrder: number;
}

export interface GymSubscriptionView {
  id: string;
  gymId: string;
  gymName: string;
  packageId: string;
  packageName: string;
  packageCode: string;
  startDateUtc: string;
  endDateUtc: string;
  status: GymSubscriptionStatus;
  autoRenew: boolean;
  remainingDays: number;
  maxMembers: number;
  maxTrainers: number;
  features: string[];
  activeMembersCount: number;
  activeTrainersCount: number;
}

export interface GymSubscriptionPaymentView {
  id: string;
  subscriptionId: string;
  gymId: string;
  orderCode: string;
  amount: number;
  currencyCode: string;
  status: PaymentStatus;
  paymentProvider: string;
  paidAtUtc: string | null;
  notes: string | null;
}

export interface CheckoutGymPackageRequest {
  gymId: string;
  packageId: string;
  autoRenew?: boolean;
}

export interface CheckoutGymPackageResponse {
  paymentId: string;
  subscriptionId: string;
  orderCode: string;
  amount: number;
  currencyCode: string;
  paymentProvider: string;
  packageName: string;
  paymentStatus: PaymentStatus;
  expiresAtUtc: string;
  sandboxInstructions: string;
}

export interface ConfirmSandboxGymPaymentRequest {
  paymentId: string;
  isSuccess?: boolean;
  notes?: string | null;
}

export interface GymFeatureAccessResult {
  hasAccess: boolean;
  gymId: string | null;
  gymName: string | null;
  subscriptionStatus: GymSubscriptionStatus | null;
  featureCode: string;
  message: string;
}
