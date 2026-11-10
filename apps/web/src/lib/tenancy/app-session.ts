import { auth } from "@/auth/config";
import { ensureUserOrg } from "./store";

export interface ResolvedAppSession {
  userId: string;
  entraOid: string;
  email: string;
  displayName: string;
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  role: "owner" | "admin" | "analyst" | "viewer";
  isDemo: boolean;
}

/**
 * Resolve the signed-in user into an Organization-bound session.
 * Creates a personal org on first login (Entra or demo).
 */
export async function resolveAppSession(): Promise<ResolvedAppSession | null> {
  const session = await auth();
  if (!session?.user?.email && !session?.user?.id) return null;

  const entraOid =
    session.entraOid ??
    session.user.id ??
    session.user.email ??
    "unknown";
  const email = session.user.email ?? `${entraOid}@demo.local`;
  const displayName = session.user.name ?? email;
  const isDemo = entraOid.startsWith("demo-") || email.endsWith("@demo.local");

  const { user, organization, membership } = await ensureUserOrg({
    entraOid,
    email,
    displayName,
  });

  return {
    userId: user.id,
    entraOid: user.entraOid,
    email: user.email,
    displayName: user.displayName,
    organizationId: organization.id,
    organizationSlug: organization.slug,
    organizationName: organization.name,
    role: membership.role,
    isDemo,
  };
}
