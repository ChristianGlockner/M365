import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getRegisteredModules } from "@m365/platform";
import { isDemoAuthEnabled, isEntraConfigured } from "@/auth/config";
import { resolveAppSession } from "@/lib/tenancy/app-session";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("platform");
  const tCa = await getTranslations("module.ca");
  const modules = getRegisteredModules();
  const session = await resolveAppSession().catch(() => null);

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
          {t("productName")}
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {t("home.title")}
        </h1>
        <p className="max-w-2xl text-lg text-[var(--color-muted)]">
          {t("home.body")}
        </p>
        <p className="max-w-2xl text-[var(--color-muted)]">{t("tagline")}</p>
        {!isEntraConfigured && isDemoAuthEnabled ? (
          <p className="shell-panel max-w-2xl rounded px-4 py-3 text-sm text-[var(--color-muted)]">
            {t("auth.stubNotice")} {t("auth.devBypass")} → {t("home.tenantsCta")}.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3 pt-2">
          {session ? (
            <Link
              href="/tenants"
              className="inline-flex rounded bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-on-primary)] hover:opacity-90"
            >
              {t("home.tenantsCta")}
            </Link>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">
              {t("tenants.errors.auth")}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">
          {t("home.modulesHeading")}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {modules.map((m) => (
            <li
              key={m.id}
              className="shell-panel rounded-lg p-5 transition hover:border-[var(--color-primary)]"
            >
              <h3 className="font-display text-lg font-semibold">
                {m.id === "ca" ? tCa("name") : m.id}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                v{m.version} · {m.collectors.length} collectors ·{" "}
                {m.analyzers.length} analyzers
              </p>
              <Link
                href={`/m/${m.id}`}
                className="mt-4 inline-flex rounded bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-[var(--color-on-primary)] hover:opacity-90"
              >
                {t("home.openModule")}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
