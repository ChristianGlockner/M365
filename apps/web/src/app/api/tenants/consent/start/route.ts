import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { resolveAppSession } from "@/lib/tenancy/app-session";
import {
  buildAdminConsentUrl,
  consentRedirectUri,
  isEntraConfigured,
  signConsentState,
} from "@/lib/tenancy/consent";

/**
 * Start Microsoft admin consent for Mandant connect.
 * Requires Entra client id/secret and a registered redirect URI:
 *   {origin}/api/tenants/consent/callback
 */
export async function GET(req: NextRequest) {
  const session = await resolveAppSession();
  if (!session) {
    return NextResponse.redirect(new URL("/de?error=auth", req.url));
  }

  if (!isEntraConfigured()) {
    const locale = req.nextUrl.searchParams.get("locale") ?? "de";
    return NextResponse.redirect(
      new URL(
        `/${locale}/tenants?error=entra_not_configured`,
        req.nextUrl.origin,
      ),
    );
  }

  const locale = req.nextUrl.searchParams.get("locale") ?? "de";
  const origin = req.nextUrl.origin;
  const state = signConsentState({
    organizationId: session.organizationId,
    locale,
    nonce: randomUUID(),
    exp: Date.now() + 15 * 60 * 1000,
  });

  const url = buildAdminConsentUrl({
    redirectUri: consentRedirectUri(origin),
    state,
  });

  return NextResponse.redirect(url);
}
