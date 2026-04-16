# Auth Guide

This document owns the megabat auth model. Endpoint payloads live in [API.md](api.md).

## Control-Plane Model

megabat has one canonical owner record today: `users.id`.

Everything that matters for product ownership already keys off that ID:

- `signals.user_id`
- `api_keys.user_id`
- browser sessions in `user_sessions.user_id`
- login identities in `auth_identities.user_id`
- Telegram routing via `context.app_user_id = users.id`

That means:

- humans authenticate with browser sessions
- programs authenticate with API keys
- both resolve to the same megabat user/account ID

The signal worker does not care how the request authenticated. It only cares about the resolved owner ID.

## Main API Auth

Public routes:

- `GET /health`
- `POST /api/v1/auth/register` unless the register gate is enabled
- `POST /api/v1/auth/siwe/nonce`
- `POST /api/v1/auth/siwe/verify`

Protected routes:

- all other `/api/v1/*` endpoints, including `GET /api/v1/auth/me` and `POST /api/v1/auth/logout`

Protected requests may authenticate in either of these ways:

```http
X-API-Key: megabat_...
```

or

```http
Cookie: megabat_session=megabat_session_...
```

or

```http
Authorization: Bearer megaba..._...
```

Rules:

- API keys are for programmatic access
- sessions are for browser or console access
- both forms resolve to the same `req.auth.userId`
- megabat routes do not branch on “web user” vs “API user”; they branch only on the resolved owner ID

## Browser Auth

Current native browser login uses SIWE:

- `POST /api/v1/auth/siwe/nonce` issues a short-lived nonce
- `POST /api/v1/auth/siwe/verify` verifies the signed SIWE message
- on success megabat creates or reuses a `users` row, links the wallet in `auth_identities`, and creates a `user_sessions` row

Session cookies are:

- `HttpOnly`
- `SameSite=Lax`
- `Secure` in production

The session token is also returned in the verify response so non-cookie clients can use `Authorization: Bearer`.

## Provider Identities

`auth_identities` is provider-agnostic.

Current provider:

- `wallet`

Planned future providers:

- email
- google
- additional wallet families if needed

The important invariant is:

- multiple login methods can map to the same megabat `users.id`
- resource ownership does not change when login providers change

## API Keys

megabat keeps DB-backed API keys for machine access.

Today:

- `POST /api/v1/auth/register` creates a new megabat owner plus one API key
- the route can be gated with `REGISTER_ADMIN_KEY`

Operational guidance:

- treat API keys as backend credentials
- do not expose them to browser clients
- rotate by minting a new key and deactivating the old one when key-management endpoints are added

## Register Gate

You can temporarily gate anonymous API-key registration by setting:

- `REGISTER_ADMIN_KEY`

If it is set, `POST /api/v1/auth/register` also requires:

```http
X-Admin-Key: <register_admin_key>
```

If it is unset, register remains open.

## Delivery Auth

Delivery webhook verification uses:

```http
X-Megabat-Signature: t=<timestamp>,v1=<hex_hmac>
```

Signature model:

- signed payload: `HMAC_SHA256(WEBHOOK_SECRET, "<timestamp>.<raw_body>")`
- megabat signs outgoing webhooks when `WEBHOOK_SECRET` is set
- delivery verifies the same signature using its own `WEBHOOK_SECRET`

That secret must match on both services.

## Delivery Internal Endpoints

megabat can query delivery for Telegram status and token linking through internal admin routes.

By default:

- megabat uses `DELIVERY_BASE_URL`
- megabat sends `X-Admin-Key` using `DELIVERY_ADMIN_KEY`
- if `DELIVERY_ADMIN_KEY` is unset, megabat falls back to its own `WEBHOOK_SECRET`
- delivery accepts `ADMIN_KEY` if set, otherwise it falls back to `WEBHOOK_SECRET`

This keeps the web app thin while preserving the delivery-service boundary.

## Related Docs

- Endpoint reference: [API.md](api.md)
- Browser and backend integration contract: [WEBAPP_INTEGRATION.md](../integrations/webapp-integration.md)
- Telegram flow and app user mapping: [TELEGRAM_DELIVERY.md](../integrations/telegram-delivery.md)
- Local and production setup: [GETTING_STARTED.md](../get-started/getting-started.md), [DEPLOYMENT.md](../get-started/deployment.md)
