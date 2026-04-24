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

This example creates a scheduled threshold signal that watches a Morpho position and delivers alerts to Telegram.

### Option A: interval schedule

```bash
curl -sS -X POST https://api.hiruka.tech/api/v1/signals \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your_api_key>" \
  -d '{
    "version": "1",
    "name": "Large supplier position",
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
        "protocol": "morpho",
        "entities": ["0x2222222222222222222222222222222222222222222222222222222222222222"],
        "addresses": ["0x1111111111111111111111111111111111111111"]
      },
      "window": { "duration": "1h" },
      "conditions": [
        {
          "type": "threshold",
          "source": { "kind": "alias", "name": "Morpho.Position.supplyShares" },
          "chain_id": 1,
          "entity_id": "0x2222222222222222222222222222222222222222222222222222222222222222",
          "address": "0x1111111111111111111111111111111111111111",
          "operator": ">",
          "value": "1000000000000000000"
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
- **Auth** for API key usage
- **API Reference** for routes and payloads
- **Webapp Integration** if you are embedding Iruka into a frontend product
