import { createHmac, timingSafeEqual } from "crypto";
import { tenantConsentScopes } from "@m365/platform/auth/scopes";

export function isEntraConfigured(): boolean {
  return (
    Boolean(process.env.AUTH_MICROSOFT_ENTRA_ID_ID) &&
    Boolean(process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET)
  );
}

export function isDemoTenantConnectAllowed(): boolean {
  if (!isEntraConfigured()) return true;
  return process.env.ALLOW_DEMO_TENANT_CONNECT !== "false";
}

function stateSecret(): string {
  return (
    process.env.AUTH_SECRET ??
    "local-dev-only-change-me-before-production-use"
  );
}

export interface ConsentStatePayload {
  organizationId: string;
  locale: string;
  nonce: string;
  exp: number;
}

export function signConsentState(payload: ConsentStatePayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyConsentState(state: string): ConsentStatePayload | null {
  const [body, sig] = state.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", stateSecret())
    .update(body)
    .digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as ConsentStatePayload;
    if (!payload.organizationId || !payload.exp) return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Microsoft admin-consent URL for multi-tenant Mandant connect.
 * Grants the Graph permissions configured on the App Registration (read scopes for CA).
 * Write scopes must NOT be configured on the app yet.
 */
export function buildAdminConsentUrl(input: {
  redirectUri: string;
  state: string;
}): string {
  const clientId = process.env.AUTH_MICROSOFT_ENTRA_ID_ID!;
  const url = new URL(
    "https://login.microsoftonline.com/common/adminconsent",
  );
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("state", input.state);
  return url.toString();
}

/**
 * Alternative: OAuth authorize with prompt=consent + assessment-first scopes.
 * Useful when adminconsent redirect is not registered yet; still needs Entra secrets.
 */
export function buildAuthorizeConsentUrl(input: {
  redirectUri: string;
  state: string;
}): string {
  const clientId = process.env.AUTH_MICROSOFT_ENTRA_ID_ID!;
  const url = new URL(
    "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
  );
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("response_mode", "query");
  url.searchParams.set("scope", tenantConsentScopes(["ca"]).join(" "));
  url.searchParams.set("state", input.state);
  url.searchParams.set("prompt", "consent");
  return url.toString();
}

export function consentRedirectUri(origin: string): string {
  return `${origin.replace(/\/$/, "")}/api/tenants/consent/callback`;
}

export function readScopesForDisplay(): string[] {
  return tenantConsentScopes(["ca"]);
}
