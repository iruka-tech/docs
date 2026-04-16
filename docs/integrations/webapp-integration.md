# Webapp Integration

This document owns the backend integration contract for web applications that sit in front of megabat.

## Core Model

megabat now exposes both browser auth and API auth directly.

Use this split:

- megabat owns signal evaluation, delivery, login identities, browser sessions, and API keys
- the Megabat web app acts as the primary console and UX layer
- Next.js can stay a thin client or thin BFF instead of becoming the long-term identity owner

## Canonical Owner

Today the canonical owner is still `users.id`.

That ID is used for:

- signal ownership
- API-key ownership
- browser session ownership
- Telegram link ownership

Treat the current `users` row as the single megabat account/owner record.

## Browser Call Pattern

Recommended path:

1. browser requests `POST /api/v1/auth/siwe/nonce`
2. wallet signs a SIWE message for the configured megabat domain and URI
3. browser posts `message` and `signature` to `POST /api/v1/auth/siwe/verify`
4. megabat sets the session cookie and returns the same session token for bearer-style clients
5. browser calls megabat product routes directly or through a very thin BFF

Protected product routes accept:

- session cookie
- session bearer token
- API key

## API Client Pattern

Programmatic clients should keep using API keys.

Recommended path:

1. create a megabat owner and key through `POST /api/v1/auth/register`
2. store the returned `user_id` and `api_key`
3. call protected routes with `X-API-Key`

If you want to gate self-serve key creation, set `REGISTER_ADMIN_KEY`.

## Console Pattern

The normal product shape is:

- humans sign in through browser auth
- humans manage their signals and integrations from the web app
- the web app becomes the main control console
- API clients reuse the same underlying owner model through API keys

This means the web app is not a separate identity silo. It is the main UI for the same megabat control plane.

## Telegram Contract

For direct delivery integration:

- Telegram linking uses `app_user_id = users.id`
- the worker already emits `context.app_user_id = signal.user_id`
- `GET /api/v1/me/integrations/telegram` reads the current user’s link status through megabat
- `POST /api/v1/me/integrations/telegram/link` lets the web app exchange a Telegram token for the current megabat user

The web app no longer needs to know or submit the raw megabat owner ID to delivery directly.

For signal creation, the same principle applies:

- custom third-party webhooks still use `webhook_url`
- first-party Telegram delivery should use `delivery: { "provider": "telegram" }`
- megabat resolves the actual delivery webhook target from server config
- signal responses include `repeat_policy`
- repeat policy should be configured through:
  - `{"mode":"cooldown"}`
  - `{"mode":"post_first_alert_snooze","snooze_minutes":1440}`
  - `{"mode":"until_resolved"}`
- `cooldown_minutes` remains the interval for `mode = "cooldown"`
- history responses now include normalized `condition_results` and `conditions_met` for alert explainability

The browser should not know whether the backend uses `delivery`, `localhost`, a Railway private hostname, or another internal address.

Telegram-specific note:

- Telegram inline `Why` and snooze actions are handled entirely by the delivery service
- the web app does not need to implement or proxy those callbacks

## When To Still Use A Thin BFF

A thin BFF is still useful for:

- UI-specific composition
- caching or coalescing requests
- hiding non-browser-safe internal calls
- future billing or entitlement checks that are not part of megabat yet

What the BFF should not own long term:

- the canonical megabat user/account mapping
- session issuance for megabat-owned auth
- Telegram owner translation for the common direct-delivery path

## Related Docs

- [AUTH.md](../reference/auth.md) for session and API-key rules
- [API.md](../reference/api.md) for routes
- [TELEGRAM_DELIVERY.md](telegram-delivery.md) for the delivery-side contract
