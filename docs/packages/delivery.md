# megabat delivery

Telegram delivery adapter for megabat.

This README is package-specific. Cross-service behavior lives in [../../docs/TELEGRAM_DELIVERY.md](../integrations/telegram-delivery.md). Local setup lives in [../../docs/GETTING_STARTED.md](../get-started/getting-started.md). Production deployment lives in [../../docs/DEPLOYMENT.md](../get-started/deployment.md).

## What This Package Owns

- Telegram bot polling
- link-token flow
- delivery webhook receiver
- delivery-side database for links and logs
- Telegram inline alert actions (`Why`, `Snooze 1h`, `Snooze 1d`)
- delivery-owned snooze state for Telegram chats

## Package Commands

From the repo root:

```bash
pnpm -F @megabat/delivery dev
pnpm -F @megabat/delivery build
pnpm -F @megabat/delivery start
pnpm -F @megabat/delivery db:migrate
pnpm -F @megabat/delivery db:migrate:prod
```

Delivery migrations live in `src/db/migrations/` and are applied in filename order.

## Required Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Delivery PostgreSQL database |
| `TELEGRAM_BOT_TOKEN` | Token from BotFather |
| `LINK_BASE_URL` | Public base URL for the Telegram pairing page at `/link` |
| `APP_BASE_URL` | User-facing megabat app URL shown in bot messages |
| shared webhook secret | Verifies incoming megabat webhooks |
| `ADMIN_KEY` | Optional dedicated secret for `/admin/*` and `/internal/*` routes |
| `PORT` | HTTP port, default `3100` |
| `HOST` | Bind host, default `0.0.0.0` |

The shared webhook secret must match the main megabat service.
For Docker, this points at the `megabat_delivery` database inside the shared Postgres container.

## HTTP Surface

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Health check |
| GET | `/link` | Hosted account-link page |
| POST | `/link/connect` | Link `app_user_id` to Telegram chat |
| POST | `/webhook/deliver` | Receive megabat webhook and send alert |
| GET | `/admin/stats` | Delivery stats |
| GET | `/internal/integrations/telegram/:appUserId` | Internal Telegram status lookup |
| POST | `/internal/integrations/telegram/:appUserId/link` | Internal token-to-user link |

Current implementation detail:

- `X-Admin-Key` uses `ADMIN_KEY` when set, otherwise falls back to the shared webhook secret

## Local Notes

- for first-party Telegram delivery, create signals through megabat with
  `delivery: { "provider": "telegram" }`
- when the full Docker stack is running, the raw delivery webhook target is
  `http://delivery:3100/webhook/deliver`
- the browser should not need to know that internal hostname unless you are
  bypassing megabat-managed delivery
- direct Telegram linking currently expects the megabat `user_id` as `app_user_id`

## Related Docs

- [../../docs/TELEGRAM_DELIVERY.md](../integrations/telegram-delivery.md)
- [../../docs/WEBAPP_INTEGRATION.md](../integrations/webapp-integration.md)
- [../../docs/API.md](../reference/api.md)
