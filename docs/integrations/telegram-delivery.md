# Telegram Delivery

Iruka can deliver alerts directly to Telegram through a managed delivery adapter.

Use this when you want operator-facing notifications without building your own messaging bridge.

## When to use Telegram delivery

Choose managed Telegram delivery when:

- humans need to receive alerts directly
- you want a simple first-party notification path
- you want Telegram-specific actions such as `Why` and snooze

## How it works

1. a user connects their Telegram account to Iruka
2. you create a signal with `delivery: [{ "type": "telegram" }]`
3. Iruka evaluates the signal
4. when the rule matches, Iruka routes the alert through the delivery adapter
5. the delivery adapter sends the Telegram message to the linked chat

## Creating a Telegram-delivered signal

Use this at signal creation time:

```json
{
  "delivery": [
    { "type": "telegram" }
  ]
}
```

## Link status and linking endpoints

Iruka exposes two integration endpoints for the current authenticated user:

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

Controlled on the signal through `metadata.repeat_policy`:

- `cooldown`
- `post_first_alert_snooze`
- `until_resolved`

### Telegram snooze

Applied by the Telegram adapter for a specific signal/chat pair.

In practice:

- repeat policy controls when Iruka should attempt another notification
- Telegram snooze controls whether Telegram output should be suppressed temporarily

## Security

Iruka signs delivery webhooks using `X-Iruka-Signature`.

The delivery adapter verifies:

- timestamped HMAC format
- shared webhook secret

This keeps the bridge trusted even when the delivery process is separate from the core API.

## What to read next

- Read **API Reference** for signal creation and history routes
- Read **Webapp Integration** if you are building a frontend on top of Iruka
