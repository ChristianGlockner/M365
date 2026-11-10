/**
 * Entra / Microsoft Graph scope catalog.
 * Assessment-first MVP requests READ scopes only.
 * WRITE scopes are reserved for future deploy/remediation and must stay commented
 * in App Registration consent until a write UI ships.
 */

export const PLATFORM_OIDC_SCOPES = [
  "openid",
  "profile",
  "email",
  "offline_access",
] as const;

/** Always-safe delegated scopes for sign-in. */
export const PLATFORM_GRAPH_READ_BASE = ["User.Read"] as const;

/**
 * Conditional Access / directory read scopes (delegated).
 * Request via incremental admin consent when connecting a TenantLink.
 */
export const CA_GRAPH_READ_SCOPES = [
  "Policy.Read.ConditionalAccess",
  "Policy.Read.All",
  "Directory.Read.All",
  // Prefer granular scopes when tightening consent:
  // "User.Read.All",
  // "Group.Read.All",
  // "Application.Read.All",
  // "RoleManagement.Read.Directory",
] as const;

/**
 * RESERVED — future deploy / remediation.
 * Do NOT add these to the Entra App Registration API permissions for MVP.
 * Uncomment when write module APIs are implemented.
 */
export const CA_GRAPH_WRITE_SCOPES_RESERVED = [
  // "Policy.ReadWrite.ConditionalAccess",
] as const;

/** Scopes for the initial Entra login (no tenant Graph inventory yet). */
export function loginScopes(): string[] {
  return [...PLATFORM_OIDC_SCOPES, ...PLATFORM_GRAPH_READ_BASE];
}

/** Scopes to request when connecting / refreshing a customer Mandant. */
export function tenantConsentScopes(moduleIds: string[] = ["ca"]): string[] {
  const scopes = new Set<string>([
    ...PLATFORM_OIDC_SCOPES,
    ...PLATFORM_GRAPH_READ_BASE,
  ]);
  if (moduleIds.includes("ca")) {
    for (const s of CA_GRAPH_READ_SCOPES) scopes.add(s);
  }
  // Intentionally omit CA_GRAPH_WRITE_SCOPES_RESERVED
  return Array.from(scopes);
}
