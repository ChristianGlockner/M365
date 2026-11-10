# M365 Reporting Portal

Assessment + interactive reporting platform for Microsoft 365 tenants.  
First module: **Conditional Access** (stub in this PR — inventory/analyzers next).

## Stack

| Layer | Choice |
| --- | --- |
| Monorepo | pnpm + Turborepo |
| App | Next.js App Router (`apps/web`) |
| Packages | `@m365/platform`, `@m365/module-sdk`, `@m365/module-ca` |
| DB | PostgreSQL + Drizzle ORM |
| Auth | Auth.js (NextAuth) + Microsoft Entra ID (multi-tenant) |
| i18n | next-intl (`de` + `en`) |
| Local infra | Docker Compose (Postgres; Redis optional) |

## Repository layout

```
apps/web/                 # Next.js UI + auth route handlers
packages/platform/        # Schema, auth scopes, theme, module registry, i18n helpers
packages/module-sdk/      # PlatformModule contract
packages/module-ca/       # Conditional Access module stub
docs/                     # Entra checklist + Azure-ready notes
docker-compose.yml        # Local Postgres
```

## Prerequisites

- Node.js 22+
- pnpm 10+ (`corepack enable` recommended)
- Docker + Docker Compose (for Postgres)

> Cloud agent note: if Docker is unavailable in the environment, the web shell still **builds** without a live DB. Start Postgres on your machine before migrations / persistence work.

## Quick start

```bash
# 1) Install
pnpm install

# 2) Environment
cp .env.example .env
# Set AUTH_SECRET (openssl rand -base64 32). Entra vars optional for shell-only.

# 3) Database
docker compose up -d
pnpm db:generate   # generate SQL from Drizzle schema when iterating
pnpm db:migrate    # apply migrations (requires Postgres)

# 4) Dev server
pnpm dev
# → http://localhost:3000  (redirects to /de or /en)
```

### Useful scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Build all packages / app |
| `pnpm typecheck` | TypeScript across workspace |
| `pnpm db:studio` | Drizzle Studio |

## What works in this skeleton

- Monorepo + package boundaries
- Org / membership / TenantLink / branding / run / snapshot / finding **schema**
- Entra multi-tenant auth **scaffolding** (live login after App Registration)
- DE + EN shell strings + language switcher
- CSS-variable theming with org branding placeholders
- `module-ca` registered; stub page under `/[locale]/m/ca`
- Tenant switcher placeholder (no live TenantLinks yet)

## What is intentionally not here

- Graph CA inventory / collectors / analyzers
- Assessment run engine + interactive report
- Write/deploy UI (scopes reserved only — see docs)

## Entra configuration (Christian)

See **[docs/entra-app-registration.md](./docs/entra-app-registration.md)** for the full checklist.

Minimum you must configure:

1. Multi-tenant App Registration  
2. Redirect URI → `/api/auth/callback/microsoft-entra-id`  
3. Client ID + secret in `.env`  
4. Delegated **read** Graph scopes for CA (+ admin consent in the Dev Tenant)  
5. Leave **write** scopes (`Policy.ReadWrite.ConditionalAccess`) out until remediation ships  

## Azure later

See **[docs/azure-ready.md](./docs/azure-ready.md)**. No Azure deploy is required for Phase 0/1 local foundation.

## Isolation rules (non-negotiable)

1. Session → Organization  
2. Graph + reports → one `TenantLink`  
3. All queries filter by `organizationId` / `tenantLinkId`
