import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";
import { randomUUID } from "crypto";
import { loginScopes } from "@m365/platform/auth/scopes";
import { requireAuthSecret } from "@/auth/secret";

/**
 * Entra multi-tenant Mandant SSO + optional DEV-only demo credentials.
 *
 * Required:
 * - AUTH_SECRET (no code fallback)
 *
 * Live Entra (see docs/entra-app-registration.md):
 * - AUTH_MICROSOFT_ENTRA_ID_ID / _SECRET / _ISSUER
 *
 * Demo login (DEV only): ALLOW_DEMO_AUTH=true and Entra must NOT be configured.
 * When Entra credentials are present, demo auth is always disabled.
 */
const entraConfigured =
  Boolean(process.env.AUTH_MICROSOFT_ENTRA_ID_ID?.trim()) &&
  Boolean(process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET?.trim());

/** Explicit opt-in; never on when Entra is configured. */
const allowDemoAuth =
  !entraConfigured && process.env.ALLOW_DEMO_AUTH === "true";

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

if (allowDemoAuth) {
  providers.push(
    Credentials({
      id: "demo",
      name: "Demo",
      credentials: {
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        const name =
          (credentials?.name as string | undefined)?.trim() || "Demo Analyst";
        // Unique principal per demo sign-in → own org (isolation).
        const id = randomUUID();
        return {
          id,
          name,
          email: `analyst-${id}@demo.local`,
        };
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account?.provider === "demo" && user) {
        token.entraOid = `demo-${user.id}`;
        token.organizationId = null;
        return token;
      }
      if (account) {
        token.accessToken = account.access_token;
        token.entraOid =
          (profile as { oid?: string } | undefined)?.oid ?? token.sub;
      }
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
  secret: requireAuthSecret(),
});

export const isEntraConfigured = entraConfigured;
export const isDemoAuthEnabled = allowDemoAuth;
