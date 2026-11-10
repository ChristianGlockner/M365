import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type {
  ConsentStatus,
  StoredMembership,
  StoredOrganization,
  StoredTenantLink,
  StoredUser,
  TenancyState,
} from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "tenancy.json");

const emptyState = (): TenancyState => ({
  organizations: [],
  users: [],
  memberships: [],
  tenantLinks: [],
});

async function readState(): Promise<TenancyState> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return { ...emptyState(), ...JSON.parse(raw) } as TenancyState;
  } catch {
    return emptyState();
  }
}

async function writeState(state: TenancyState): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(state, null, 2), "utf8");
}

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "org"
  );
}

/** Ensure user + personal org + owner membership exist. Isolates all tenant data under that org. */
export async function ensureUserOrg(input: {
  entraOid: string;
  email: string;
  displayName?: string | null;
  locale?: "de" | "en";
}): Promise<{
  user: StoredUser;
  organization: StoredOrganization;
  membership: StoredMembership;
}> {
  const state = await readState();
  let user = state.users.find((u) => u.entraOid === input.entraOid);
  if (!user) {
    user = {
      id: randomUUID(),
      entraOid: input.entraOid,
      email: input.email,
      displayName: input.displayName?.trim() || input.email,
      preferredLocale: input.locale,
      createdAt: new Date().toISOString(),
    };
    state.users.push(user);
  } else {
    user.email = input.email;
    user.displayName = input.displayName?.trim() || user.displayName;
    if (input.locale) user.preferredLocale = input.locale;
  }

  let membership = state.memberships.find((m) => m.userId === user!.id);
  let organization: StoredOrganization | undefined;
  if (membership) {
    organization = state.organizations.find(
      (o) => o.id === membership!.organizationId,
    );
  }

  if (!organization) {
    const baseSlug = slugify(
      input.email.split("@")[1] ?? input.displayName ?? "demo",
    );
    let slug = baseSlug;
    let n = 1;
    while (state.organizations.some((o) => o.slug === slug)) {
      slug = `${baseSlug}-${n++}`;
    }
    organization = {
      id: randomUUID(),
      name: `${user.displayName}'s Org`,
      slug,
      defaultLocale: input.locale ?? "de",
      createdAt: new Date().toISOString(),
    };
    state.organizations.push(organization);
    membership = {
      id: randomUUID(),
      organizationId: organization.id,
      userId: user.id,
      role: "owner",
      createdAt: new Date().toISOString(),
    };
    state.memberships.push(membership);
  }

  await writeState(state);
  return { user, organization, membership: membership! };
}

export async function listTenantLinksForOrg(
  organizationId: string,
  opts?: { includeDisconnected?: boolean },
): Promise<StoredTenantLink[]> {
  const state = await readState();
  return state.tenantLinks
    .filter((t) => t.organizationId === organizationId)
    .filter((t) =>
      opts?.includeDisconnected ? true : t.consentStatus !== "revoked",
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getTenantLinkForOrg(
  organizationId: string,
  tenantLinkId: string,
): Promise<StoredTenantLink | null> {
  const state = await readState();
  const link = state.tenantLinks.find(
    (t) => t.id === tenantLinkId && t.organizationId === organizationId,
  );
  return link ?? null;
}

export async function upsertTenantLink(input: {
  organizationId: string;
  entraTenantId: string;
  displayName: string;
  consentStatus: ConsentStatus;
  source: "entra" | "mock";
  lastError?: string | null;
}): Promise<{ link: StoredTenantLink; created: boolean; alreadyConnected: boolean }> {
  const state = await readState();
  const existing = state.tenantLinks.find(
    (t) =>
      t.organizationId === input.organizationId &&
      t.entraTenantId.toLowerCase() === input.entraTenantId.toLowerCase(),
  );

  const now = new Date().toISOString();

  if (existing) {
    const wasActive =
      existing.consentStatus === "granted" && !existing.disconnectedAt;
    existing.displayName = input.displayName || existing.displayName;
    existing.consentStatus = input.consentStatus;
    existing.source = input.source;
    existing.lastError = input.lastError ?? null;
    existing.updatedAt = now;
    if (input.consentStatus === "granted") {
      existing.consentedAt = now;
      existing.disconnectedAt = null;
    }
    await writeState(state);
    return {
      link: existing,
      created: false,
      alreadyConnected: wasActive && input.consentStatus === "granted",
    };
  }

  const link: StoredTenantLink = {
    id: randomUUID(),
    organizationId: input.organizationId,
    entraTenantId: input.entraTenantId,
    displayName: input.displayName,
    consentStatus: input.consentStatus,
    consentedAt: input.consentStatus === "granted" ? now : null,
    disconnectedAt: null,
    source: input.source,
    lastError: input.lastError ?? null,
    createdAt: now,
    updatedAt: now,
  };
  state.tenantLinks.push(link);
  await writeState(state);
  return { link, created: true, alreadyConnected: false };
}

export async function softDisconnectTenantLink(
  organizationId: string,
  tenantLinkId: string,
): Promise<StoredTenantLink | null> {
  const state = await readState();
  const link = state.tenantLinks.find(
    (t) => t.id === tenantLinkId && t.organizationId === organizationId,
  );
  if (!link) return null;
  const now = new Date().toISOString();
  link.consentStatus = "revoked";
  link.disconnectedAt = now;
  link.updatedAt = now;
  await writeState(state);
  return link;
}

export async function markTenantConsentError(
  organizationId: string,
  entraTenantId: string | null,
  errorMessage: string,
): Promise<void> {
  if (!entraTenantId) return;
  const state = await readState();
  const link = state.tenantLinks.find(
    (t) =>
      t.organizationId === organizationId &&
      t.entraTenantId.toLowerCase() === entraTenantId.toLowerCase(),
  );
  if (!link) return;
  link.consentStatus = "error";
  link.lastError = errorMessage;
  link.updatedAt = new Date().toISOString();
  await writeState(state);
}
