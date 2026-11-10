import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getRegisteredModules } from "@m365/platform";
import { isEntraConfigured } from "@/auth/config";

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
        {!isEntraConfigured ? (
          <p className="shell-panel max-w-2xl rounded px-4 py-3 text-sm text-[var(--color-muted)]">
            {t("auth.stubNotice")}
          </p>
        ) : null}
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
