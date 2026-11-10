"use client";

import { useLocale, useTranslations } from "next-intl";
import { appSignOut, demoSignIn, entraSignIn } from "@/auth/actions";

export function AuthControls({
  signedIn,
  displayName,
  entraConfigured,
  demoAuthEnabled,
}: {
  signedIn: boolean;
  displayName?: string | null;
  entraConfigured: boolean;
  demoAuthEnabled: boolean;
}) {
  const t = useTranslations("platform.auth");
  const locale = useLocale();

  if (signedIn) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-[var(--color-muted)]">
          {t("signedInAs", { name: displayName ?? "—" })}
        </span>
        <form action={appSignOut}>
          <input type="hidden" name="locale" value={locale} />
          <button
            type="submit"
            className="rounded px-3 py-1.5 text-[var(--color-primary)] underline-offset-2 hover:underline"
          >
            {t("signOut")}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {entraConfigured ? (
        <form action={entraSignIn}>
          <input type="hidden" name="locale" value={locale} />
          <button
            type="submit"
            className="rounded bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-[var(--color-on-primary)] hover:opacity-90"
          >
            {t("signIn")}
          </button>
        </form>
      ) : (
        <p className="max-w-[14rem] text-right text-xs text-[var(--color-muted)]">
          {t("stubNotice")}
        </p>
      )}
      {demoAuthEnabled ? (
        <form action={demoSignIn}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="name" value="Demo Analyst" />
          <button
            type="submit"
            className="rounded border border-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-[var(--color-accent)] hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,white)]"
          >
            {t("devBypass")}
          </button>
        </form>
      ) : null}
    </div>
  );
}
