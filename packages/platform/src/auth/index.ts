export {
  loginScopes,
  tenantConsentScopes,
  PLATFORM_OIDC_SCOPES,
  PLATFORM_GRAPH_READ_BASE,
  CA_GRAPH_READ_SCOPES,
  CA_GRAPH_WRITE_SCOPES_RESERVED,
} from "./scopes";

/**
 * Session shape expected by the web app after Entra Mandant SSO.
 * Tied to an Organization — never mix tenant data across orgs.
 */
export interface AppSessionUser {
  id: string;
  email: string;
  displayName?: string | null;
  entraOid: string;
}

export interface AppSession {
  user: AppSessionUser;
  organizationId: string | null;
  organizationSlug: string | null;
  role: "owner" | "admin" | "analyst" | "viewer" | null;
  locale: "de" | "en";
}

/**
 * Placeholder AuthProvider abstraction — NextAuth Azure AD wired in apps/web.
 * Future: customer IdP (SAML/OIDC) behind the same interface.
 */
export interface AuthProvider {
  getSession(): Promise<AppSession | null>;
}
