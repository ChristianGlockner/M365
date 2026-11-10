"use client";

import { useTranslations } from "next-intl";

/**
 * Placeholder tenant switcher.
 * Real TenantLink list + active selection lands with consent / Graph wiring.
 */
export function TenantSwitcher() {
  const t = useTranslations("platform.tenant");

  return (
    <div className="flex min-w-[12rem] flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
        {t("switcherLabel")}
      </span>
      <select
        disabled
        className="rounded border border-[var(--color-border)] bg-white/60 px-2 py-1 text-sm text-[var(--color-muted)]"
        aria-label={t("switcherLabel")}
        title={t("connectHint")}
      >
        <option>{t("placeholder")}</option>
      </select>
    </div>
  );
}
