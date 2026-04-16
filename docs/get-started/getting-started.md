# Getting Started

This guide is for integrators using a Megabat environment provided by our team.

You do **not** need to run the backend yourself to evaluate the product or ship an integration.

## What you need

Before you start, make sure you have:

- your Megabat **base URL**
- either an **API key** or access to **SIWE login**
- a destination for alerts:
  - your own webhook endpoint, or
  - a linked Telegram account if you plan to use managed Telegram delivery

In the examples below, replace:

- `<your_megabat_base_url>` with your Megabat environment URL
- `<your_api_key>` with your real API key

## Step 1: confirm the environment

Check that the environment is reachable and see what chains are enabled.

```bash
curl -sS <your_megabat_base_url>/health
curl -sS <your_megabat_base_url>/chains
curl -sS <your_megabat_base_url>/api/v1/catalog
```

These endpoints tell you:

- `/health` — the service is up
- `/chains` — which chains this environment supports
- `/api/v1/catalog` — the currently supported signal template catalog

## Step 2: choose your auth model

### Option A: API key

Use API keys for:

- backend-to-backend integrations
- cron jobs and automation
- internal services
- webhook-driven products

Send protected requests with:

```http
X-API-Key: megabat_...
```

### Option B: SIWE session

Use SIWE if your product has a wallet-connected frontend and you want browser-native authenticated flows.

Read **Auth** for the full SIWE flow.

## Step 3: create your first signal

This example creates a threshold signal that watches a Morpho position and sends alerts to your webhook.

```bash
curl -sS -X POST <your_megabat_base_url>/api/v1/signals \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your_api_key>" \
  -d '{
    "name": "Large supplier position",
    "definition": {
      "scope": {
        "chains": [1],
        "protocol": "morpho",
        "addresses": ["0x1111111111111111111111111111111111111111"]
      },
      "window": { "duration": "1h" },
      "conditions": [
        {
          "type": "threshold",
          "metric": "Morpho.Position.supplyShares",
          "chain_id": 1,
          "market_id": "0x2222222222222222222222222222222222222222222222222222222222222222",
          "address": "0x1111111111111111111111111111111111111111",
          "operator": ">",
          "value": "1000000000000000000"
        }
      ]
    },
    "webhook_url": "https://example.com/webhook",
    "cooldown_minutes": 10,
    "repeat_policy": { "mode": "cooldown" }
  }'
```

## Step 4: try an event-driven signal

This example counts ERC-20 transfers from a specific token contract over the last hour.

```bash
curl -sS -X POST <your_megabat_base_url>/api/v1/signals \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your_api_key>" \
  -d '{
    "name": "Busy ERC-20 token",
    "definition": {
      "scope": { "chains": [1], "protocol": "all" },
      "window": { "duration": "1h" },
      "conditions": [
        {
          "type": "raw-events",
          "aggregation": "count",
          "operator": ">",
          "value": 25,
          "chain_id": 1,
          "event": {
            "kind": "erc20_transfer",
            "contract_addresses": ["0x3333333333333333333333333333333333333333"]
          }
        }
      ]
    },
    "webhook_url": "https://example.com/webhook"
  }'
```

## Step 5: inspect what you created

Useful follow-up routes:

```bash
curl -sS <your_megabat_base_url>/api/v1/signals \
  -H "X-API-Key: <your_api_key>"

curl -sS <your_megabat_base_url>/api/v1/signals/<signal_id> \
  -H "X-API-Key: <your_api_key>"

curl -sS <your_megabat_base_url>/api/v1/signals/<signal_id>/history \
  -H "X-API-Key: <your_api_key>"
```

## Common next steps

Once the first signal works, most teams do one or more of these next:

- connect alert delivery to a production webhook
- link Telegram delivery for human review flows
- move from one wallet to grouped wallet monitoring
- add swap, transfer, or contract-event monitoring
- create product-specific signals from your app backend or webapp

## What to read next

- **What You Can Build** for the capability model and boundaries
- **Writing Signals** for more request examples
- **Auth** for API keys and SIWE sessions
- **API Reference** for routes and payloads
- **Webapp Integration** if you are embedding Megabat into a frontend product
