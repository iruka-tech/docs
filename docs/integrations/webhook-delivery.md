# Webhook Delivery

Iruka can deliver alerts directly to your own HTTPS endpoint.

Use this when you want alerts to land in your backend, queue, bot, workflow engine, or incident system.

## When to use webhook delivery

Choose webhook delivery when:

- your own app should receive the alert payload
- you want machine-readable delivery instead of a chat message
- you want to feed alerts into your own automations

## How it works

1. you create a signal with a webhook delivery target
2. Iruka evaluates the signal
3. when the rule matches, Iruka POSTs the alert payload to your configured URL
4. the attempt is recorded in signal history

## Delivery target shape

Use this inside `delivery[]`:

```json
{
  "type": "webhook",
  "url": "https://antonmyown.dev/webhook/iruka"
}
```

Optional retry policy:

```json
{
  "type": "webhook",
  "url": "https://antonmyown.dev/webhook/iruka",
  "retry_policy": {
    "max_retries": 2
  }
}
```

## Coexisting with Telegram

One signal can deliver to both Telegram and a webhook:

```json
{
  "delivery": [
    { "type": "telegram" },
    {
      "type": "webhook",
      "url": "https://antonmyown.dev/webhook/iruka"
    }
  ]
}
```

That means the same trigger can reach a human chat and your own system.

## Example signal

```json
{
  "version": "1",
  "name": "USDC whale webhook",
  "triggers": [
    {
      "type": "schedule",
      "schedule": {
        "kind": "interval",
        "interval_seconds": 300
      }
    }
  ],
  "definition": {
    "window": { "duration": "1h" },
    "conditions": [
      {
        "type": "threshold",
        "source": { "kind": "alias", "name": "ERC20.Position.balance" },
        "chain_id": 1,
        "token": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "account": "0x1111111111111111111111111111111111111111",
        "operator": ">",
        "value": "1000000000"
      }
    ]
  },
  "delivery": [
    {
      "type": "webhook",
      "url": "https://antonmyown.dev/webhook/iruka"
    }
  ],
  "metadata": {
    "repeat_policy": { "mode": "cooldown" }
  }
}
```

## What Iruka sends

Iruka sends the normal alert payload for a triggered signal.

At a high level, expect fields like:

- `signal_id`
- `signal_name`
- `triggered_at`
- `summary`
- `scope` (synthesized from the signal's explicit condition targeting, not authored via `definition.scope`)
- `conditions_met`
- `wake_context`
- `context`

The exact shape follows the current backend alert payload used for signal delivery.

## Notes

- use a public HTTPS URL that your system controls
- webhook delivery is configured per signal, not as a global account setting
- webhook attempts are recorded in signal history

## What to read next

- Read **API Reference** for create, update, and history routes
- Read **Telegram Delivery** if you also want chat delivery
