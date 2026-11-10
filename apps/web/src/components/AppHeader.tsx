import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { TenantSwitcher, type TenantOption } from "./TenantSwitcher";
import { AuthControls } from "./AuthControls";
import { getRegisteredModules } from "@m365/platform";

export async function AppHeader({
  signedIn,
  displayName,
  entraConfigured,
  demoAuthEnabled,
  tenants,
}: {
  signedIn: boolean;
  displayName?: string | null;
  entraConfigured: boolean;
  demoAuthEnabled: boolean;
  tenants: TenantOption[];
}) {
  const t = await getTranslations("platform");
  const tCa = await getTranslations("module.ca");
  const modules = getRegisteredModules();

  return (
    <header className="shell-panel border-b px-4 py-3 md:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-flex h-9 w-9 items-center justify-center rounded bg-[var(--color-primary)] font-display text-sm font-bold text-[var(--color-on-primary)]"
            >
              M
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-[var(--color-text)]">
              {t("productName")}
            </span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            <Link
              href="/"
              className="text-[var(--color-muted)] hover:text-[var(--color-primary)]"
            >
              {t("nav.home")}
            </Link>
            <Link
              href="/tenants"
              className="text-[var(--color-muted)] hover:text-[var(--color-primary)]"
            >
              {t("nav.tenants")}
            </Link>
            {modules.map((m) => (
              <Link
                key={m.id}
                href={`/m/${m.id}`}
                className="text-[var(--color-muted)] hover:text-[var(--color-primary)]"
              >
                {m.id === "ca" ? tCa("nav.overview") : m.id}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <TenantSwitcher tenants={tenants} signedIn={signedIn} />
          <LanguageSwitcher />
          <AuthControls
            signedIn={signedIn}
            displayName={displayName}
            entraConfigured={entraConfigured}
            demoAuthEnabled={demoAuthEnabled}
          />
        </div>
      </div>
    </header>
  );
}
