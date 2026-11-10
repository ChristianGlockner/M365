import { getTranslations, setRequestLocale } from "next-intl/server";
import { getModuleById } from "@m365/platform";
import { notFound } from "next/navigation";

export default async function ConditionalAccessStubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const mod = getModuleById("ca");
  if (!mod) notFound();

  const t = await getTranslations("module.ca");

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
          {t("name")}
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {t("stub.title")}
        </h1>
        <p className="max-w-2xl text-lg text-[var(--color-muted)]">
          {t("stub.body")}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="shell-panel rounded-lg p-5">
          <h2 className="font-display text-base font-semibold">
            {t("stub.scopesRead")}
          </h2>
          <ul className="mt-3 space-y-1 font-mono text-xs text-[var(--color-muted)]">
            {mod.requiredGraphScopes.read.map((scope) => (
              <li key={scope}>{scope}</li>
            ))}
          </ul>
        </div>
        <div className="shell-panel rounded-lg p-5">
          <h2 className="font-display text-base font-semibold">
            {t("stub.scopesWrite")}
          </h2>
          <ul className="mt-3 space-y-1 font-mono text-xs text-[var(--color-muted)]">
            {(mod.requiredGraphScopes.write?.length
              ? mod.requiredGraphScopes.write
              : ["Policy.ReadWrite.ConditionalAccess (commented / reserved)"]
            ).map((scope) => (
              <li key={scope}>{scope}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
