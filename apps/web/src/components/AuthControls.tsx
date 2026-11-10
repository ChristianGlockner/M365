"use client";

import { useTranslations } from "next-intl";

export function AuthControls({
  signedIn,
  displayName,
  entraConfigured,
}: {
  signedIn: boolean;
  displayName?: string | null;
  entraConfigured: boolean;
}) {
  const t = useTranslations("platform.auth");

  if (signedIn) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-[var(--color-muted)]">
          {t("signedInAs", { name: displayName ?? "—" })}
        </span>
        <form action="/api/auth/signout" method="post">
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

  if (!entraConfigured) {
    return (
      <p className="max-w-xs text-right text-xs text-[var(--color-muted)]">
        {t("stubNotice")}
      </p>
    );
  }

  return (
    <form action="/api/auth/signin/microsoft-entra-id" method="post">
      <button
        type="submit"
        className="rounded bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-[var(--color-on-primary)] hover:opacity-90"
      >
        {t("signIn")}
      </button>
    </form>
  );
}
