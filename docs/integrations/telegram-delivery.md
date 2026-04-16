# Telegram Delivery

Megabat can deliver alerts directly to Telegram through a managed delivery adapter.

Use this when you want operator-facing notifications without building your own messaging bridge.

## When to use Telegram delivery

Choose managed Telegram delivery when:

- humans need to receive alerts directly
- you want a simple first-party notification path
- you want Telegram-specific actions such as `Why` and snooze

If your system already has its own messaging or automation layer, use a custom `webhook_url` instead.

## How it works

1. a user connects their Telegram account to Megabat
2. you create a signal with `delivery: { "provider": "telegram" }`
3. Megabat evaluates the signal
4. when the rule matches, Megabat routes the alert through the delivery adapter
5. the delivery adapter sends the Telegram message to the linked chat

## Creating a Telegram-delivered signal

Use this at signal creation time:

```json
{
  "delivery": { "provider": "telegram" }
}
```

You do **not** need to supply the internal delivery webhook target yourself.

## Link status and linking endpoints

Megabat exposes two integration endpoints for the current authenticated user:

- `GET /api/v1/me/integrations/telegram`
- `POST /api/v1/me/integrations/telegram/link`

Use these from your web app when users need to connect Telegram.

## Telegram actions

Telegram alerts support:

- `Why`
- `Snooze 1h`
- `Snooze 1d`

These are handled by the delivery adapter. Your frontend does not need to implement Telegram callback logic itself.

## Repeat policy vs Telegram snooze

These are separate concepts.

### Repeat policy

Controlled on the signal itself:

- `cooldown`
- `post_first_alert_snooze`
- `until_resolved`

### Telegram snooze

Applied by the Telegram adapter for a specific signal/chat pair.

In practice:

- repeat policy controls when Megabat should attempt another notification
- Telegram snooze controls whether Telegram output should be suppressed temporarily

## Security

Megabat signs delivery webhooks using `X-Megabat-Signature`.

The delivery adapter verifies:

- timestamped HMAC format
- shared webhook secret

This keeps the bridge trusted even when the delivery process is separate from the core API.

## When not to use Telegram delivery

Use a custom webhook instead if you need:

- custom incident routing
- Slack, Discord, PagerDuty, or your own notification fan-out
- non-human automation triggers
- complete control over the downstream payload contract

## What to read next

- Read **API Reference** for signal creation and history routes
- Read **Webapp Integration** if you are building a frontend on top of Megabat
