import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";
import { loginScopes } from "@m365/platform/auth/scopes";

/**
 * Entra multi-tenant Mandant SSO + demo credentials for local/preview.
 *
 * Required for live Entra (see docs/entra-app-registration.md):
 * - AUTH_SECRET
 * - AUTH_MICROSOFT_ENTRA_ID_ID
 * - AUTH_MICROSOFT_ENTRA_ID_SECRET
 * - AUTH_MICROSOFT_ENTRA_ID_ISSUER (common/v2.0 for multi-tenant)
 */
const entraConfigured =
  Boolean(process.env.AUTH_MICROSOFT_ENTRA_ID_ID) &&
  Boolean(process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET);

const allowDemoAuth =
  process.env.ALLOW_DEMO_AUTH !== "false" &&
  (!entraConfigured || process.env.ALLOW_DEMO_AUTH === "true");

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
        return {
          id: "demo-user",
          name,
          email: "analyst@demo.local",
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
  secret:
    process.env.AUTH_SECRET ??
    "local-dev-only-change-me-before-production-use",
});

export const isEntraConfigured = entraConfigured;
export const isDemoAuthEnabled = allowDemoAuth;
