"use client";

import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export type TenantRow = {
  id: string;
  displayName: string;
  entraTenantId: string;
  consentStatus: string;
  source: "entra" | "mock";
  consentedAt?: string | null;
  lastError?: string | null;
};

export function TenantRegistrationPanel({
  tenants,
  entraConfigured,
  demoAllowed,
  flash,
}: {
  tenants: TenantRow[];
  entraConfigured: boolean;
  demoAllowed: boolean;
  flash?: {
    status?: string | null;
    error?: string | null;
    detail?: string | null;
  };
}) {
  const t = useTranslations("platform.tenants");
  const locale = useLocale();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [demoName, setDemoName] = useState("Contoso Demo");

  async function mockConnect() {
    setBusy(true);
    try {
      const res = await fetch("/api/tenants/mock-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: demoName }),
      });
      if (!res.ok) {
        router.replace(`/tenants?error=mock_failed`);
        return;
      }
      router.replace(`/tenants?status=connected`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function disconnect(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/tenants/${id}/disconnect`, {
        method: "POST",
      });
      if (!res.ok) {
        router.replace(`/tenants?error=disconnect_failed`);
        return;
      }
      router.replace(`/tenants?status=disconnected`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      {flash?.status &&
      ["connected", "updated", "already_connected", "disconnected"].includes(
        flash.status,
      ) ? (
        <p
          className="shell-panel rounded border-l-4 border-l-[var(--color-accent)] px-4 py-3 text-sm"
          role="status"
        >
          {t(`flash.${flash.status}` as "flash.connected")}
        </p>
      ) : null}
      {flash?.error ? (
        <p
          className="shell-panel rounded border-l-4 border-l-[#b42318] px-4 py-3 text-sm"
          role="alert"
        >
          {[
            "consent_denied",
            "consent_incomplete",
            "invalid_state",
            "entra_not_configured",
            "mock_failed",
            "disconnect_failed",
            "auth",
          ].includes(flash.error)
            ? t(`errors.${flash.error}` as "errors.consent_denied")
            : flash.error}
          {flash.detail ? (
            <span className="mt-1 block font-mono text-xs text-[var(--color-muted)]">
              {flash.detail}
            </span>
          ) : null}
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">{t("listTitle")}</h2>
        {tenants.length === 0 ? (
          <div className="shell-panel rounded-lg px-5 py-8 text-center">
            <p className="font-display text-lg font-semibold">{t("emptyTitle")}</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
              {t("emptyBody")}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {tenants.map((tenant) => (
              <li
                key={tenant.id}
                className="shell-panel flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display font-semibold">
                      {tenant.displayName}
                    </p>
                    {tenant.source === "mock" ? (
                      <span className="rounded bg-[color-mix(in_srgb,var(--color-accent)_18%,white)] px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                        {t("badgeDemo")}
                      </span>
                    ) : null}
                    <StatusPill status={tenant.consentStatus} />
                  </div>
                  <p className="mt-1 font-mono text-xs text-[var(--color-muted)]">
                    {tenant.entraTenantId}
                  </p>
                  {tenant.lastError ? (
                    <p className="mt-1 text-xs text-[#b42318]">
                      {tenant.lastError}
                    </p>
                  ) : null}
                </div>
                {tenant.consentStatus !== "revoked" ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => disconnect(tenant.id)}
                    className="rounded border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-muted)] hover:border-[#b42318] hover:text-[#b42318] disabled:opacity-50"
                  >
                    {t("disconnect")}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="shell-panel space-y-3 rounded-lg p-5">
          <h3 className="font-display text-base font-semibold">
            {t("connectRealTitle")}
          </h3>
          <p className="text-sm text-[var(--color-muted)]">
            {t("connectRealBody")}
          </p>
          {entraConfigured ? (
            <a
              href={`/api/tenants/consent/start?locale=${locale}`}
              className="inline-flex rounded bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-[var(--color-on-primary)] hover:opacity-90"
            >
              {t("connectRealCta")}
            </a>
          ) : (
            <p className="text-xs text-[var(--color-muted)]">
              {t("connectRealDisabled")}
            </p>
          )}
        </div>

        {demoAllowed ? (
          <div className="shell-panel space-y-3 rounded-lg border-dashed p-5">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-semibold">
                {t("connectDemoTitle")}
              </h3>
              <span className="rounded bg-[color-mix(in_srgb,var(--color-accent)_18%,white)] px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                {t("badgeDemo")}
              </span>
            </div>
            <p className="text-sm text-[var(--color-muted)]">
              {t("connectDemoBody")}
            </p>
            <label className="block text-xs text-[var(--color-muted)]">
              {t("demoNameLabel")}
              <input
                className="mt-1 w-full rounded border border-[var(--color-border)] bg-white/80 px-2 py-1.5 text-sm text-[var(--color-text)]"
                value={demoName}
                onChange={(e) => setDemoName(e.target.value)}
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={mockConnect}
              className="rounded border border-[var(--color-accent)] px-3 py-2 text-sm font-medium text-[var(--color-accent)] hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,white)] disabled:opacity-50"
            >
              {t("connectDemoCta")}
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const t = useTranslations("platform.tenants.status");
  const known = ["pending", "granted", "revoked", "error"] as const;
  const label = (known as readonly string[]).includes(status)
    ? t(status as (typeof known)[number])
    : status;
  const tone =
    status === "granted"
      ? "bg-[color-mix(in_srgb,var(--color-accent)_18%,white)] text-[var(--color-accent)]"
      : status === "error"
        ? "bg-[#fef3f2] text-[#b42318]"
        : "bg-[#f2f4f7] text-[var(--color-muted)]";
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${tone}`}>
      {label}
    </span>
  );
}
