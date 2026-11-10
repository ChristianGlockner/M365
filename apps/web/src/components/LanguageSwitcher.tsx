"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { SUPPORTED_LOCALES, type AppLocale } from "@m365/platform";

export function LanguageSwitcher() {
  const t = useTranslations("platform.language");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function onChange(next: string) {
    router.replace(pathname, { locale: next as AppLocale });
  }

  return (
    <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
      <span className="sr-only">{t("label")}</span>
      <select
        className="rounded border border-[var(--color-border)] bg-white/80 px-2 py-1 text-[var(--color-text)]"
        value={locale}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t("label")}
      >
        {SUPPORTED_LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {t(loc)}
          </option>
        ))}
      </select>
    </label>
  );
}
