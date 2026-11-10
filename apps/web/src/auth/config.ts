import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import type { Provider } from "next-auth/providers";
import { loginScopes } from "@m365/platform/auth/scopes";

/**
 * Entra multi-tenant Mandant SSO scaffolding.
 * Session is intended to bind to an Organization after first login / invite flow.
 *
 * Required env (see .env.example + docs/entra-app-registration.md):
 * - AUTH_SECRET
 * - AUTH_MICROSOFT_ENTRA_ID_ID (Application/Client ID)
 * - AUTH_MICROSOFT_ENTRA_ID_SECRET
 * - AUTH_MICROSOFT_ENTRA_ID_ISSUER (https://login.microsoftonline.com/common/v2.0 for multi-tenant)
 */
const entraConfigured =
  Boolean(process.env.AUTH_MICROSOFT_ENTRA_ID_ID) &&
  Boolean(process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET);

const providers: Provider[] = [];

if (entraConfigured) {
  providers.push(
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      issuer:
        process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER ??
        "https://login.microsoftonline.com/common/v2.0",
      authorization: {
        params: {
          scope: loginScopes().join(" "),
          prompt: "select_account",
        },
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.entraOid =
          (profile as { oid?: string } | undefined)?.oid ?? token.sub;
      }
      // organizationId is attached after membership resolution (later PR).
      if (token.organizationId === undefined) {
        token.organizationId = null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string) ?? "";
        session.organizationId =
          (token.organizationId as string | null) ?? null;
        session.entraOid = (token.entraOid as string | undefined) ?? null;
      }
      return session;
    },
  },
  trustHost: true,
  // Allow local shell without Entra; generate a stable dev secret if unset.
  secret:
    process.env.AUTH_SECRET ??
    "local-dev-only-change-me-before-production-use",
});

export const isEntraConfigured = entraConfigured;
