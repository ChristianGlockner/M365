import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { resolveAppSession } from "@/lib/tenancy/app-session";
import { isDemoTenantConnectAllowed } from "@/lib/tenancy/consent";
import { upsertTenantLink } from "@/lib/tenancy/store";

/**
 * Clearly labeled demo path: simulate Mandant connect without Entra.
 * Only available when Entra secrets are missing or ALLOW_DEMO_TENANT_CONNECT=true.
 */
export async function POST(req: NextRequest) {
  const session = await resolveAppSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isDemoTenantConnectAllowed()) {
    return NextResponse.json({ error: "demo_disabled" }, { status: 403 });
  }

  let displayName = "Demo Contoso";
  try {
    const body = (await req.json()) as { displayName?: string };
    if (body.displayName?.trim()) displayName = body.displayName.trim();
  } catch {
    // optional body
  }

  const entraTenantId = randomUUID();
  const result = await upsertTenantLink({
    organizationId: session.organizationId,
    entraTenantId,
    displayName: `[Demo] ${displayName}`,
    consentStatus: "granted",
    source: "mock",
  });

  return NextResponse.json({
    ok: true,
    mock: true,
    alreadyConnected: result.alreadyConnected,
    tenant: result.link,
  });
}
