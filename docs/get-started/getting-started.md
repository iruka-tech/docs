# Getting Started

## What you need

Before you start, make sure you have:

- your Iruka API base URL: `https://api.iruka.tech`
- an API key generated from the Iruka console on `iruka.tech`
- a linked Telegram account if you plan to use Telegram delivery
- a public HTTPS endpoint if you plan to use webhook delivery

In the examples below, replace `<your_api_key>` with your real API key.

## Step 1: confirm the environment

Check that the API is reachable and see what chains are enabled.

```bash
curl -sS https://api.iruka.tech/health
curl -sS https://api.iruka.tech/chains
curl -sS https://api.iruka.tech/api/v1/catalog
```

These endpoints tell you:

- `/health` — the service is up
- `/chains` — which chains this environment supports
- `/api/v1/catalog` — the currently supported signal template catalog

## Step 2: get an API key

Sign in on `iruka.tech`, open the Iruka console, and generate an API key there.

Send protected requests with:

```http
X-API-Key: iruka_...
```

## Step 3: create your first signal

This example creates a scheduled threshold signal that watches an ERC20 balance and delivers alerts to a webhook.

### Option A: interval schedule

```bash
curl -sS -X POST https://api.iruka.tech/api/v1/signals \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your_api_key>" \
  -d '{
    "version": "1",
    "name": "Large USDC holder",
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
      "description": "Optional",
      "repeat_policy": { "mode": "cooldown" }
    }
  }'
```

If you want both human alerts and machine-readable delivery, use both targets:

```json
{
  "delivery": [
    { "type": "telegram" },
    { "type": "webhook", "url": "https://antonmyown.dev/webhook/iruka" }
  ]
}
```

If you want a simple first signal, start with a threshold or a change condition.

Example: notify when a USDC balance drops 20% in 2 hours.

```json
{
  "version": "1",
  "name": "USDC balance down 20% in 2h",
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
    "window": { "duration": "2h" },
    "conditions": [
      {
        "type": "change",
        "source": { "kind": "alias", "name": "ERC20.Position.balance" },
        "chain_id": 1,
        "token": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "account": "0x1111111111111111111111111111111111111111",
        "direction": "decrease",
        "by": { "percent": 20 }
      }
    ]
  },
  "delivery": [
    {
      "type": "webhook",
      "url": "https://antonmyown.dev/webhook/iruka"
    }
  ]
}
```

That works because Iruka uses archive RPC reads for state-based `change` conditions, so it can compare the current balance to the balance at `window_start`.

### Option B: cron schedule

Use cron when the signal should wake at a fixed UTC time instead of every N seconds.

```json
{
  "type": "schedule",
  "schedule": {
    "kind": "cron",
    "expression": "0 8 * * *"
  }
}
```

That example runs every day at **08:00 UTC**. Use standard **five-field** cron syntax.

## Step 4: inspect what you created

Saved-signal responses now include a top-level `complexity_score`, so you can immediately see how expensive a signal is from the API response itself.

Useful follow-up routes:

```bash
curl -sS https://api.iruka.tech/api/v1/signals \
  -H "X-API-Key: <your_api_key>"

curl -sS https://api.iruka.tech/api/v1/signals/<signal_id> \
  -H "X-API-Key: <your_api_key>"

curl -sS https://api.iruka.tech/api/v1/signals/<signal_id>/history \
  -H "X-API-Key: <your_api_key>"
```

Saved-signal responses now include a top-level `complexity_score`, so a successful create/read response tells you how expensive that signal currently is.
If create, update, or toggle-on would exceed your active complexity budget, the API returns a structured `400` error with `code = "active_complexity_budget_exceeded"` plus numeric budget fields.

For the plan model and examples, read **Usage Limits**. The short version: active scheduled signals consume `ceil(3600 / interval_seconds) + number_of_conditions` complexity units.

## What to read next

- **Signal** for the target signal schema
- **Usage Limits** for complexity units and plan budgets
- **Definition** for the query structure
- **Examples** for condition examples
- **API Reference** for routes and payloads
