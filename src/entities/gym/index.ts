// Gym / Tenant — multi-tenancy anchor.
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  brandingLogoUrl?: string;
}

export interface Gym {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  contactPhone: string;
}
