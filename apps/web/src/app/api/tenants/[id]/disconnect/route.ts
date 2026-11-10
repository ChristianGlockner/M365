import { NextRequest, NextResponse } from "next/server";
import { resolveAppSession } from "@/lib/tenancy/app-session";
import { softDisconnectTenantLink } from "@/lib/tenancy/store";

/**
 * Soft-disconnect: mark TenantLink revoked for this org only (isolation preserved).
 */
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await resolveAppSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const link = await softDisconnectTenantLink(session.organizationId, id);
  if (!link) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, tenant: link });
}
