# Azure-ready notes (no deploy required yet)

Local development uses Docker Compose + Postgres. Production target is **Azure Container Apps** (decision D1).

## Suggested mapping

| Local | Azure |
| --- | --- |
| `apps/web` (Next.js `output: "standalone"`) | Container App from Dockerfile |
| Compose `postgres` | Azure Database for PostgreSQL Flexible Server |
| Optional Redis | Azure Cache for Redis (when BullMQ jobs land) |
| `.env` secrets | Container Apps secrets / Key Vault references |
| Entra multi-tenant app | Same App Registration; add production redirect URI |

## Container sketch

A production Dockerfile (future PR) should:

1. `pnpm install --frozen-lockfile`
2. `pnpm build --filter=@m365/web`
3. Run `node apps/web/.next/standalone/apps/web/server.js` (or equivalent standalone path)
4. Inject `DATABASE_URL`, `AUTH_*`, and App Insights connection string via env

## Networking

- Ingress HTTPS on the Container App.
- Private access from app → Postgres (VNet integration).
- No public Postgres.

## What this skeleton already does

- Standalone Next output enabled in `apps/web/next.config.ts`
- Env-based config (no Azure SDK required to boot locally)
- Stateless web process + external Postgres (fits Container Apps scale-out)
