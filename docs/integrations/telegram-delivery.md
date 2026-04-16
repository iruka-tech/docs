# Telegram Delivery

This document owns the cross-service Telegram contract. Package-local commands and runtime notes live in [../packages/delivery/README.md](../packages/delivery.md).

## Responsibility Split

- megabat API stores signals and owns the canonical user/account ID
- megabat worker evaluates signals and dispatches webhooks
- delivery service verifies the webhook, resolves `app_user_id`, and sends a Telegram message

megabat itself remains webhook-first. Telegram is an adapter service.

## Canonical User Mapping

Delivery routes alerts by `context.app_user_id`.

Current contract:

- megabat worker sets `context.app_user_id = signals.user_id`
- direct Telegram linking therefore uses the megabat `users.id`
- delivery stores that same ID in `users.app_user_id`

This is the stable owner bridge between the core signal system and Telegram delivery.

## End-To-End Flow

1. user sends `/start` to the Telegram bot
2. bot creates a short-lived token in delivery
3. user either opens the hosted delivery link page or submits the token through megabat’s `/api/v1/me/integrations/telegram/link`
4. delivery maps the token to the megabat `users.id`
5. worker evaluates a signal and dispatches a signed webhook
6. delivery verifies the webhook
7. delivery maps `app_user_id` to a Telegram chat, creates a delivery record, and sends the message
8. Telegram alerts expose inline `Why`, `Snooze 1h`, and `Snooze 1d` actions
9. delivery verifies callback ownership against the stored `telegram_chat_id`

## megabat-native Integration Endpoints

The web app should prefer megabat-native status and link routes:

- `GET /api/v1/me/integrations/telegram`
- `POST /api/v1/me/integrations/telegram/link`

megabat fulfills those through delivery’s internal admin endpoints:

- `GET /internal/integrations/telegram/:appUserId`
- `POST /internal/integrations/telegram/:appUserId/link`

That keeps the web app from having to know the raw cross-service delivery details.

## Required Webhook Target

For server-managed Telegram delivery, the preferred API contract is to create the signal with:

```json
{
  "delivery": { "provider": "telegram" }
}
```

megabat then resolves the actual webhook target from `DELIVERY_BASE_URL`.

If you are creating signals manually and need the raw target:

- local Docker: `http://delivery:3100/webhook/deliver`
- production on a shared private network: use the private delivery hostname
- production across a network boundary: use the reachable delivery URL for that topology

If a signal points to another webhook URL, Telegram delivery is bypassed.

## Telegram Action State

Telegram action state lives in the delivery database.

- alert callbacks use `delivery.id`, not raw signal IDs, in callback data
- `Why` reads the stored delivery payload and formats the explanation details for Telegram
- snooze state is keyed by `signal_id + telegram_chat_id`
- active snoozes are enforced by delivery before sending the next Telegram alert

That means the frontend does not need to implement Telegram callback handling itself.

## Repeat Policy Interplay

megabat now exposes an explicit signal repeat policy:

- `cooldown`
- `post_first_alert_snooze`
- `until_resolved`

Telegram snooze is separate from signal repeat policy:

- repeat policy decides when the worker should attempt a notification
- Telegram snooze decides whether the delivery adapter should suppress Telegram output for that signal/chat pair

## Security Contract

Incoming delivery webhooks require:

- `X-Megabat-Signature`
- `t=<timestamp>,v1=<hmac>` header format
- HMAC over `"<timestamp>.<raw_body>"`

The same shared webhook secret must be configured on both the main service and the delivery service.

Internal status and link endpoints require:

- `X-Admin-Key`
- `ADMIN_KEY` on delivery if you want a dedicated admin secret
- otherwise delivery falls back to `WEBHOOK_SECRET`

Setup locations live in [GETTING_STARTED.md](../get-started/getting-started.md) and [DEPLOYMENT.md](../get-started/deployment.md).

## Related Docs

- [AUTH.md](../reference/auth.md) for shared-secret and admin-key behavior
- [API.md](../reference/api.md) for route details
- [WEBAPP_INTEGRATION.md](webapp-integration.md) for browser integration
- [../packages/delivery/README.md](../packages/delivery.md) for delivery package commands
