export type ConsentStatus = "pending" | "granted" | "revoked" | "error";
export type MembershipRole = "owner" | "admin" | "analyst" | "viewer";

export interface StoredOrganization {
  id: string;
  name: string;
  slug: string;
  defaultLocale: "de" | "en";
  createdAt: string;
}

export interface StoredUser {
  id: string;
  entraOid: string;
  email: string;
  displayName: string;
  preferredLocale?: "de" | "en";
  createdAt: string;
}

export interface StoredMembership {
  id: string;
  organizationId: string;
  userId: string;
  role: MembershipRole;
  createdAt: string;
}

export interface StoredTenantLink {
  id: string;
  organizationId: string;
  entraTenantId: string;
  displayName: string;
  consentStatus: ConsentStatus;
  consentedAt?: string | null;
  disconnectedAt?: string | null;
  source: "entra" | "mock";
  lastError?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenancyState {
  organizations: StoredOrganization[];
  users: StoredUser[];
  memberships: StoredMembership[];
  tenantLinks: StoredTenantLink[];
}
