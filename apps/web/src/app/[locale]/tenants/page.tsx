import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { resolveAppSession } from "@/lib/tenancy/app-session";
import { listTenantLinksForOrg } from "@/lib/tenancy/store";
import {
  isDemoTenantConnectAllowed,
  isEntraConfigured,
  readScopesForDisplay,
} from "@/lib/tenancy/consent";
import { TenantRegistrationPanel } from "@/components/tenants/TenantRegistrationPanel";

export default async function TenantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("platform.tenants");
  const session = await resolveAppSession();

  if (!session) {
    redirect({ href: "/", locale });
  }

  const appSession = session as NonNullable<typeof session>;
  const tenants = await listTenantLinksForOrg(appSession.organizationId, {
    includeDisconnected: true,
  });
  const sp = await searchParams;
  const flash = {
    status: typeof sp.status === "string" ? sp.status : null,
    error: typeof sp.error === "string" ? sp.error : null,
    detail: typeof sp.detail === "string" ? sp.detail : null,
  };

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
          {t("eyebrow")}
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="max-w-2xl text-lg text-[var(--color-muted)]">
          {t("body")}
        </p>
        <p className="text-sm text-[var(--color-muted)]">
          {t("orgContext", {
            org: appSession.organizationName,
            isolation: t("isolationNote"),
          })}
        </p>
      </section>

      <TenantRegistrationPanel
        tenants={tenants.map((x) => ({
          id: x.id,
          displayName: x.displayName,
          entraTenantId: x.entraTenantId,
          consentStatus: x.consentStatus,
          source: x.source,
          consentedAt: x.consentedAt,
          lastError: x.lastError,
        }))}
        entraConfigured={isEntraConfigured()}
        demoAllowed={isDemoTenantConnectAllowed()}
        flash={flash}
      />

      <section className="shell-panel rounded-lg p-5">
        <h2 className="font-display text-base font-semibold">
          {t("scopesTitle")}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {t("scopesBody")}
        </p>
        <ul className="mt-3 columns-1 gap-4 font-mono text-xs text-[var(--color-muted)] sm:columns-2">
          {readScopesForDisplay().map((scope) => (
            <li key={scope} className="break-inside-avoid">
              {scope}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[var(--color-muted)]">
          {t("scopesWriteReserved")}
        </p>
      </section>
    </div>
  );
}
