# Getting Started

This guide is for engineers who want to evaluate Megabat locally and make a real API call against the backend.

## Prerequisites

- Node.js 22+
- pnpm via Corepack
- Docker Desktop

## Install dependencies

From the backend repository:

```bash
corepack prepare pnpm@latest --activate
pnpm install
```

## Create env files

```bash
cp .env.example .env
cp packages/delivery/.env.example packages/delivery/.env
```

For a minimal local setup, configure:

- `DATABASE_URL`
- `SUPPORTED_CHAIN_IDS`
- one `RPC_URL_<chainId>` for each configured chain

Optional but common:

- `REDIS_URL`
- `ENVIO_ENDPOINT` for indexed protocol data
- `ENVIO_API_TOKEN` for raw-event queries through HyperSync
- `WEBHOOK_SECRET` if you will use signed webhook delivery
- `REGISTER_ADMIN_KEY` if you want to gate self-serve API key creation
- `AUTH_SIWE_DOMAIN` and `AUTH_SIWE_URI` for browser auth

If you want managed Telegram delivery as well, also configure in `packages/delivery/.env`:

- `TELEGRAM_BOT_TOKEN`
- `LINK_BASE_URL`

## Start the stack

Core backend only:

```bash
pnpm docker:up
```

Backend plus Telegram delivery:

```bash
pnpm docker:up:all
```

## Confirm the backend is running

```bash
curl http://localhost:3000/health
curl http://localhost:3000/chains
curl http://localhost:3000/ready
```

What these endpoints mean:

- `/health` — fast liveness check
- `/chains` — the chain allowlist Megabat loaded at startup
- `/ready` — stricter dependency readiness check

## Create credentials

### Option 1: API key

Create a local account and API key:

```bash
curl -sS -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"local-dev","key_name":"curl"}'
```

If `REGISTER_ADMIN_KEY` is configured, include:

```bash
curl -sS -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: <register_admin_key>" \
  -d '{"name":"local-dev","key_name":"curl"}'
```

The response includes an API key you can use as:

```http
X-API-Key: megabat_...
```

### Option 2: Browser auth with SIWE

Request a nonce:

```bash
curl -sS -X POST http://localhost:3000/api/v1/auth/siwe/nonce
```

Then sign the returned nonce with your wallet and verify it through:

```bash
curl -sS -X POST http://localhost:3000/api/v1/auth/siwe/verify \
  -H "Content-Type: application/json" \
  -d '{"message":"<signed-siwe-message>","signature":"0x..."}'
```

Megabat returns both:

- an `HttpOnly` session cookie for browser clients
- a `session_token` for bearer-style clients

## Create your first signal

The example below is valid against the backend schema today. It creates a threshold signal that watches a Morpho position and sends alerts to your webhook.

```bash
curl -sS -X POST http://localhost:3000/api/v1/signals \
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

## Try a raw-event signal

This example counts ERC-20 transfers from a specific token contract over the last hour.

```bash
curl -sS -X POST http://localhost:3000/api/v1/signals \
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

## What to read next

- **What You Can Build** for the capability model and boundaries
- **Writing Signals** for supported condition types and more examples
- **Auth** for the full authentication model
- **API Reference** for all routes
