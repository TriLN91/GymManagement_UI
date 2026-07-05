// MembershipPackage / PurchaseRecord — domain entity.
export interface MembershipPackage {
  id: string;
  tenantId: string;
  name: string;
  durationDays: number;
  priceCents: number;
  features: ReadonlyArray<string>;
}

export interface PurchaseRecord {
  id: string;
  memberId: string;
  packageId: string;
  purchasedAt: string;
  expiresAt: string;
}
