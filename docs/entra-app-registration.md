# Entra App Registration checklist

Live Microsoft login and **in-app Mandant registration** need these values.  
Without them the portal still runs: use **Demo login** + **Simulate tenant connect**.

## 1. Create the app

1. Open [Microsoft Entra admin center](https://entra.microsoft.com/) → **App registrations** → **New registration**.
2. Name: e.g. `M365 Reporting Portal`.
3. Supported account types: **Accounts in any organizational directory (Any Microsoft Entra ID tenant – Multitenant)**.
4. Redirect URIs (Web) — register **both**:
   - Sign-in: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
   - Mandant admin consent: `http://localhost:3000/api/tenants/consent/callback`
   - Production / preview host: same paths on `https://<your-host>`

## 2. Client secret

1. **Certificates & secrets** → **New client secret**.
2. Copy the value into `.env` as `AUTH_MICROSOFT_ENTRA_ID_SECRET`.
3. Set `AUTH_MICROSOFT_ENTRA_ID_ID` to the **Application (client) ID**.
4. Set issuer for multi-tenant:

```env
AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/common/v2.0
AUTH_URL=http://localhost:3000
AUTH_SECRET=<openssl rand -base64 32>
```

## 3. API permissions (assessment-first)

Add **Microsoft Graph** delegated permissions (admin consent will grant them per Mandant):

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

### Reserved write scopes (do **not** add yet)

- `Policy.ReadWrite.ConditionalAccess`

## 4. In-app registration flow

1. Sign in (Microsoft or Demo).
2. Open **Tenants / Mandanten** → **Connect tenant / Mandant verbinden**.
3. Browser goes to `login.microsoftonline.com/common/adminconsent`.
4. Callback `/api/tenants/consent/callback` creates/updates a `TenantLink` for **your organization only** (`organizationId` isolation).
5. Soft **Disconnect** sets status `revoked` (data stays org-scoped; no cross-tenant reads).

## 5. Token / auth settings

- **Authentication** → enable **ID tokens** if prompted for the Auth.js OIDC flow.
- Front-channel logout URL (optional): `http://localhost:3000/api/auth/signout`

## 6. Isolation reminder

- Session → Organization  
- Graph + reports → one `TenantLink`  
- All queries filter by `organizationId` / `tenantLinkId`
