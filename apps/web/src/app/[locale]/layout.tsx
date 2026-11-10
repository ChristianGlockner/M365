import type { CSSProperties, ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { brandingToCssVars, DEFAULT_BRANDING } from "@m365/platform";
import { routing } from "@/i18n/routing";
import { AppHeader } from "@/components/AppHeader";
import { auth, isDemoAuthEnabled, isEntraConfigured } from "@/auth/config";
import { resolveAppSession } from "@/lib/tenancy/app-session";
import { listTenantLinksForOrg } from "@/lib/tenancy/store";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const cssVars = brandingToCssVars(DEFAULT_BRANDING);

  let signedIn = false;
  let displayName: string | null = null;
  let tenants: {
    id: string;
    displayName: string;
    consentStatus: string;
    source: "entra" | "mock";
  }[] = [];

  try {
    const session = await auth();
    signedIn = Boolean(session?.user);
    displayName = session?.user?.name ?? session?.user?.email ?? null;
    if (signedIn) {
      const app = await resolveAppSession();
      if (app) {
        displayName = app.displayName;
        const links = await listTenantLinksForOrg(app.organizationId);
        tenants = links.map((l) => ({
          id: l.id,
          displayName: l.displayName,
          consentStatus: l.consentStatus,
          source: l.source,
        }));
      }
    }
  } catch {
    signedIn = false;
  }

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@500;600;700&family=Source+Sans+3:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={cssVars as CSSProperties}>
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen flex-col">
            <AppHeader
              signedIn={signedIn}
              displayName={displayName}
              entraConfigured={isEntraConfigured}
              demoAuthEnabled={isDemoAuthEnabled}
              tenants={tenants}
            />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6">
              {children}
            </main>
            <LocaleFooter />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

async function LocaleFooter() {
  const t = await getTranslations("platform.footer");
  return (
    <footer className="border-t border-[var(--color-border)] px-4 py-4 text-center text-xs text-[var(--color-muted)] md:px-6">
      <p>{t("localFirst")}</p>
    </footer>
  );
}
