"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export type TenantOption = {
  id: string;
  displayName: string;
  consentStatus: string;
  source: "entra" | "mock";
};

export function TenantSwitcher({
  tenants = [],
  signedIn,
}: {
  tenants?: TenantOption[];
  signedIn: boolean;
}) {
  const t = useTranslations("platform.tenant");
  const active = tenants.filter((x) => x.consentStatus === "granted");

  return (
    <div className="flex min-w-[12rem] flex-col gap-0.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
          {t("switcherLabel")}
        </span>
        {signedIn ? (
          <Link
            href="/tenants"
            className="text-xs text-[var(--color-primary)] hover:underline"
          >
            {t("manage")}
          </Link>
        ) : null}
      </div>
      {active.length === 0 ? (
        <select
          disabled
          className="rounded border border-[var(--color-border)] bg-white/60 px-2 py-1 text-sm text-[var(--color-muted)]"
          aria-label={t("switcherLabel")}
          title={t("connectHint")}
        >
          <option>{t("placeholder")}</option>
        </select>
      ) : (
        <select
          className="rounded border border-[var(--color-border)] bg-white/80 px-2 py-1 text-sm text-[var(--color-text)]"
          aria-label={t("switcherLabel")}
          defaultValue={active[0]?.id}
        >
          {active.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.source === "mock" ? `[Demo] ${tenant.displayName}` : tenant.displayName}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
