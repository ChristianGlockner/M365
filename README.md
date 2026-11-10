# M365 Reporting Portal

Assessment + interactive reporting platform for Microsoft 365 tenants.  
First module: **Conditional Access** (stub — inventory/analyzers next).

## Stack

| Layer | Choice |
| --- | --- |
| Monorepo | pnpm + Turborepo |
| App | Next.js App Router (`apps/web`) |
| Packages | `@m365/platform`, `@m365/module-sdk`, `@m365/module-ca` |
| DB | PostgreSQL + Drizzle ORM (schema ready); **file store** `.data/tenancy.json` for tenant UI without Docker |
| Auth | Auth.js + Microsoft Entra ID (multi-tenant) + Demo login |
| i18n | next-intl (`de` + `en`) |
| Local infra | Docker Compose (Postgres; Redis optional) |

## Quick start

```bash
pnpm install
cp .env.example .env   # set AUTH_SECRET; Entra optional for demo
# Optional Postgres:
docker compose up -d && pnpm db:migrate
pnpm dev
# → http://localhost:3000
```

### In-app Mandant registration

1. **Demo (no Entra):** click **Demo login** → **Tenants** → **Simulate tenant connect**.  
2. **Real Entra:** set `AUTH_MICROSOFT_ENTRA_ID_ID` / `_SECRET`, register redirect URIs (sign-in **and** `/api/tenants/consent/callback`), then **Sign in with Microsoft** → **Connect tenant** (admin consent).  
3. Connected tenants appear with status; **Disconnect** soft-revokes the link for that org only.

Details: [docs/entra-app-registration.md](./docs/entra-app-registration.md).

### Useful scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Build all packages / app |
| `pnpm typecheck` | TypeScript across workspace |
| `pnpm db:migrate` | Apply Drizzle migrations (Postgres) |

## Repository layout

```
apps/web/                 # Next.js UI + auth + tenant registration
packages/platform/        # Schema, auth scopes, theme, module registry
packages/module-sdk/      # PlatformModule contract
packages/module-ca/       # Conditional Access module stub
docs/                     # Entra checklist + Azure-ready notes
docker-compose.yml        # Local Postgres
```

## What works now

- Monorepo + package boundaries  
- Org / membership / TenantLink persistence (file store for preview; Drizzle schema for Postgres)  
- In-app Mandant connect: real admin consent **or** labeled demo simulate  
- Soft disconnect, empty/error/already-connected UX (DE+EN)  
- Theme + language switcher + CA module stub  

## Out of scope (next)

- Graph CA inventory / collectors / analyzers  
- Assessment run engine + interactive report  
- Write/deploy UI (scopes reserved only)

## Azure later

See [docs/azure-ready.md](./docs/azure-ready.md).

## Isolation rules

1. Session → Organization  
2. Graph + reports → one `TenantLink`  
3. All queries filter by `organizationId` / `tenantLinkId`
