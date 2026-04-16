# Auth

Megabat supports two authentication modes:

- **API keys** for server-to-server integrations
- **SIWE-backed browser sessions** for interactive web applications

Choose the one that matches your client.

## API keys

Use API keys for:

- backend automation
- scheduled jobs
- internal services
- any integration that should not depend on browser cookies

### Create an API key

```http
POST /api/v1/auth/register
Content-Type: application/json
```

Request body:

```json
{
  "name": "Acme Alerts",
  "key_name": "prod"
}
```

If `REGISTER_ADMIN_KEY` is enabled on the backend, send:

```http
X-Admin-Key: <register_admin_key>
```

Response shape:

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "api_key_id": "2e4d1e12-3a0d-4b0c-9b54-7a1f4d8c3ed1",
  "api_key": "megabat_..."
}
```

Use the key on protected routes as:

```http
X-API-Key: megabat_...
```

## SIWE browser sessions

Use SIWE if your product has an interactive wallet-connected frontend.

### Step 1: request a nonce

```http
POST /api/v1/auth/siwe/nonce
```

Example response:

```json
{
  "provider": "wallet",
  "nonce": "abc123...",
  "expires_at": "2026-03-17T08:10:00.000Z",
  "domain": "localhost:3000",
  "uri": "http://localhost:3000"
}
```

### Step 2: verify the signed message

```http
POST /api/v1/auth/siwe/verify
Content-Type: application/json
```

Request body:

```json
{
  "message": "localhost:3000 wants you to sign in with your Ethereum account: ...",
  "signature": "0x...",
  "name": "Local Dev"
}
```

Megabat responds with both a session cookie and a session token.

Example response:

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "session_id": "2e4d1e12-3a0d-4b0c-9b54-7a1f4d8c3ed1",
  "session_token": "megabat_session_...",
  "expires_at": "2026-04-16T08:00:00.000Z",
  "created": true,
  "auth_method": "session",
  "identity": {
    "provider": "wallet",
    "provider_subject": "0xabc..."
  }
}
```

You can then authenticate with either:

- the `HttpOnly` cookie
- `Authorization: Bearer megabat_session_...`

## Fetch the current profile

```http
GET /api/v1/auth/me
```

This works with:

- session cookie
- bearer session token
- API key

## Log out

```http
POST /api/v1/auth/logout
```

This revokes the current session.

## Which routes are public?

These routes are public:

- `GET /health`
- `GET /chains`
- `GET /ready`
- `POST /api/v1/auth/register` (unless gated by `REGISTER_ADMIN_KEY`)
- `POST /api/v1/auth/siwe/nonce`
- `POST /api/v1/auth/siwe/verify`

Most other `/api/v1/*` routes require auth.

## Which auth mode should I use?

Use **API keys** if:

- your caller is a backend service
- you want simple header-based auth
- you are integrating alerts into your own systems

Use **SIWE sessions** if:

- you have a wallet-connected frontend
- users should manage their own signals interactively
- you want the web app to act as the main console on top of Megabat

## What to read next

- Read **API Reference** for protected endpoint behavior
- Read **Webapp Integration** if you are building a frontend on top of Megabat
