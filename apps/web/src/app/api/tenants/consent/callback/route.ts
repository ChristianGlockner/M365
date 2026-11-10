import { NextRequest, NextResponse } from "next/server";
import {
  markTenantConsentError,
  upsertTenantLink,
} from "@/lib/tenancy/store";
import { verifyConsentState } from "@/lib/tenancy/consent";

/**
 * Admin-consent return URL.
 * Success query: admin_consent=True&tenant=<guid>&state=...
 * Error query: error=...&error_description=...&state=...
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const stateRaw = params.get("state") ?? "";
  const state = verifyConsentState(stateRaw);
  const locale = state?.locale ?? "de";
  const origin = req.nextUrl.origin;

  const redirect = (query: string) =>
    NextResponse.redirect(new URL(`/${locale}/tenants?${query}`, origin));

  if (!state) {
    return redirect("error=invalid_state");
  }

  const error = params.get("error");
  if (error) {
    const description =
      params.get("error_description") ?? params.get("error") ?? "consent_denied";
    await markTenantConsentError(
      state.organizationId,
      params.get("tenant"),
      description,
    );
    return redirect(
      `error=consent_denied&detail=${encodeURIComponent(description.slice(0, 180))}`,
    );
  }

  const adminConsent = params.get("admin_consent");
  const tenantId = params.get("tenant");

  if (adminConsent?.toLowerCase() !== "true" || !tenantId) {
    return redirect("error=consent_incomplete");
  }

  // Isolation: TenantLink is always created under the org from signed state.
  const short = tenantId.slice(0, 8);
  const result = await upsertTenantLink({
    organizationId: state.organizationId,
    entraTenantId: tenantId,
    displayName: `Entra Mandant ${short}`,
    consentStatus: "granted",
    source: "entra",
  });

  if (result.alreadyConnected) {
    return redirect(`status=already_connected&tenant=${result.link.id}`);
  }
  if (result.created) {
    return redirect(`status=connected&tenant=${result.link.id}`);
  }
  return redirect(`status=updated&tenant=${result.link.id}`);
}
