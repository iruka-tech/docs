# Getting Started

## What you need

Before you start, make sure you have:

- your Iruka API base URL: `https://api.hiruka.tech`
- an API key generated from the Iruka console on `iruka.tech`
- a linked Telegram account if you plan to use Telegram delivery

In the examples below, replace `<your_api_key>` with your real API key.

## Step 1: confirm the environment

Check that the API is reachable and see what chains are enabled.

```bash
curl -sS https://api.hiruka.tech/health
curl -sS https://api.hiruka.tech/chains
curl -sS https://api.hiruka.tech/api/v1/catalog
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

This example creates a scheduled threshold signal that watches an ERC20 balance and delivers alerts to Telegram.

> [!NOTE]
> The example still includes `definition.scope` because that is part of the current backend contract.
> Treat `scope` as legacy in the docs and likely to be deprecated later.

### Option A: interval schedule

```bash
curl -sS -X POST https://api.hiruka.tech/api/v1/signals \
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
      "scope": {
        "chains": [1],
        "addresses": ["0x1111111111111111111111111111111111111111"]
      },
      "window": { "duration": "1h" },
      "conditions": [
        {
          "type": "threshold",
          "source": { "kind": "alias", "name": "ERC20.Position.balance" },
          "chain_id": 1,
          "contract_address": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          "address": "0x1111111111111111111111111111111111111111",
          "operator": ">",
          "value": "1000000000"
        }
      ]
    },
    "delivery": [
      { "type": "telegram" }
    ],
    "metadata": {
      "description": "Optional",
      "repeat_policy": { "mode": "cooldown" }
    }
  }'
```

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

Useful follow-up routes:

```bash
curl -sS https://api.hiruka.tech/api/v1/signals \
  -H "X-API-Key: <your_api_key>"

curl -sS https://api.hiruka.tech/api/v1/signals/<signal_id> \
  -H "X-API-Key: <your_api_key>"

curl -sS https://api.hiruka.tech/api/v1/signals/<signal_id>/history \
  -H "X-API-Key: <your_api_key>"
```

## What to read next

- **Signal** for the target signal schema
- **Definition** for the query structure
- **Examples** for condition examples
- **API Reference** for routes and payloads
