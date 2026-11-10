# Entra App Registration checklist

Configure this **before** live Mandant SSO works. Local shell UI runs without these values.

## 1. Create the app

1. Open [Microsoft Entra admin center](https://entra.microsoft.com/) → **App registrations** → **New registration**.
2. Name: e.g. `M365 Reporting Portal`.
3. Supported account types: **Accounts in any organizational directory (Any Microsoft Entra ID tenant – Multitenant)**.
4. Redirect URI (Web):
   - Local: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
   - Production: `https://<your-host>/api/auth/callback/microsoft-entra-id`

## 2. Client secret

1. **Certificates & secrets** → **New client secret**.
2. Copy the value into `.env` as `AUTH_MICROSOFT_ENTRA_ID_SECRET`.
3. Set `AUTH_MICROSOFT_ENTRA_ID_ID` to the **Application (client) ID**.
4. Set issuer for multi-tenant:

```env
AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/common/v2.0
```

## 3. API permissions (assessment-first)

Add **Microsoft Graph** delegated permissions:

| Permission | Purpose |
| --- | --- |
| `openid` | OIDC |
| `profile` | Display name |
| `email` | User email |
| `offline_access` | Refresh tokens (server session) |
| `User.Read` | Signed-in user |
| `Policy.Read.ConditionalAccess` | CA policies |
| `Policy.Read.All` | Related policy reads (if required) |
| `Directory.Read.All` | Resolve users/groups/apps/roles (or swap for granular reads) |

Grant **admin consent** in your Dev Tenant after connecting.

### Reserved write scopes (do **not** add yet)

These are designed for future deploy/remediation module APIs. Keep them out of the registration until a write UI exists:

- `Policy.ReadWrite.ConditionalAccess`

## 4. Token / auth settings

- **Authentication** → enable **ID tokens** if prompted for the hybrid/OIDC flow used by Auth.js.
- Front-channel logout URL (optional): `http://localhost:3000/api/auth/signout`

## 5. Wire into the app

1. Copy `.env.example` → `.env` and fill Entra + `AUTH_SECRET`.
2. Restart `pnpm dev`.
3. Use **Sign in with Microsoft** on the shell.
4. Later PRs: bind session → `organizations` / `memberships`, then admin-consent a `tenant_links` row per Mandant.

## 6. Isolation reminder

- Session must resolve to exactly one **Organization** context for data access.
- Every Graph call and every report run is bound to one **TenantLink**.
- Queries always filter by `organizationId` (+ `tenantLinkId`).
