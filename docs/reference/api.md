# API Reference

This page documents the public HTTP surface for integrators.

Base URL examples in this page use a placeholder Megabat environment:

- API root: `<your_megabat_base_url>`
- API namespace: `<your_megabat_base_url>/api/v1`

Use the environment URL provided to your team.

## Public endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Fast liveness check |
| GET | `/chains` | Supported chain report |
| GET | `/ready` | Dependency readiness check |
| POST | `/api/v1/auth/register` | Create a user and API key |
| POST | `/api/v1/auth/siwe/nonce` | Issue a SIWE nonce |
| POST | `/api/v1/auth/siwe/verify` | Verify a SIWE message and create a session |
| GET | `/api/v1/catalog` | Return the backend-supported signal template catalog |

## Protected endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/auth/me` | Return the authenticated profile |
| POST | `/api/v1/auth/logout` | Revoke the current session |
| GET | `/api/v1/me/integrations/telegram` | Return Telegram link status |
| POST | `/api/v1/me/integrations/telegram/link` | Link a Telegram token to the current user |
| POST | `/api/v1/signals` | Create a signal |
| GET | `/api/v1/signals` | List signals |
| GET | `/api/v1/signals/:id` | Get one signal |
| PATCH | `/api/v1/signals/:id` | Update a signal |
| PATCH | `/api/v1/signals/:id/toggle` | Toggle active status |
| DELETE | `/api/v1/signals/:id` | Delete a signal |
| GET | `/api/v1/signals/:id/history` | Evaluation and notification history |
| POST | `/api/v1/simulate/:id/simulate` | Simulate a signal over a time range |
| POST | `/api/v1/simulate/:id/first-trigger` | Find the first matching point in a range |

## Health endpoints

### `GET /health`

Use `/health` as the fast platform-level liveness check.

It reports:

- process status
- configured source-family capability status
- chain configuration loaded at startup

### `GET /chains`

Use `/chains` to inspect:

- the explicit chain allowlist Megabat loaded
- the required `RPC_URL_<chainId>` configuration names

### `GET /ready`

Use `/ready` when you want a stricter readiness signal.

It checks:

- PostgreSQL
- Redis
- configured archive RPC endpoints
- optional indexed/raw providers when enabled

## Catalog endpoint

### `GET /api/v1/catalog`

This returns the backend-supported template catalog for signal builders.

It is useful when you want your UI to present backend-native templates instead of hardcoding them in the frontend.

## Create a signal

### `POST /api/v1/signals`

This endpoint accepts the signal payload described in **Writing Signals**.

A valid request must include:

- `name`
- `definition`
- either `webhook_url` or `delivery`

Example:

```json
{
  "name": "High transfer count",
  "definition": {
    "scope": {
      "chains": [1],
      "protocol": "all"
    },
    "window": { "duration": "1h" },
    "conditions": [
      {
        "type": "raw-events",
        "aggregation": "count",
        "operator": ">",
        "value": 100,
        "chain_id": 1,
        "event": {
          "kind": "erc20_transfer",
          "contract_addresses": ["0x3333333333333333333333333333333333333333"]
        }
      }
    ]
  },
  "webhook_url": "https://example.com/webhook",
  "cooldown_minutes": 5,
  "repeat_policy": { "mode": "cooldown" }
}
```

Response:

- returns the created signal
- echoes the public `definition`
- includes normalized `repeat_policy`
- includes inferred `delivery` when relevant

## List and fetch signals

### `GET /api/v1/signals`

Query parameter:

- `active=true` — return only active signals

### `GET /api/v1/signals/:id`

Returns one signal for the authenticated owner.

## Update, toggle, and delete

### `PATCH /api/v1/signals/:id`

Supports partial updates for fields such as:

- `name`
- `description`
- `definition`
- `webhook_url`
- `delivery`
- `cooldown_minutes`
- `repeat_policy`
- `is_active`

### `PATCH /api/v1/signals/:id/toggle`

Use this for a simple active/inactive toggle.

### `DELETE /api/v1/signals/:id`

Deletes the signal for the authenticated owner.

## Signal history

### `GET /api/v1/signals/:id/history`

Query parameters:

- `limit` — max 500, default 100
- `include_notifications=false` — skip notification records

The response includes:

- evaluation history
- notification history
- `condition_results`
- `conditions_met`

This is useful for explainability and debugging integrations.

## Simulation

### `POST /api/v1/simulate/:id/simulate`

Use this to simulate a saved signal over a time range.

### `POST /api/v1/simulate/:id/first-trigger`

Use this to find the first point where the signal would have matched.

These endpoints are useful for:

- backtesting
- signal tuning
- verifying whether a rule is too noisy before enabling it

## Response and error behavior

Common response patterns:

- `400` for schema or validation failures
- `401` for missing or invalid auth
- `404` when a signal is not found for the authenticated owner
- `409` when a signal requires source capabilities that are not enabled
- `500` for unexpected server errors

## Webhook delivery note

When you use a custom `webhook_url`, Megabat will send alert notifications to your endpoint.

When you use managed Telegram delivery, create the signal with:

```json
{ "delivery": { "provider": "telegram" } }
```

Megabat will resolve the actual delivery target internally.

## What to read next

- Read **Writing Signals** for payload examples
- Read **Telegram Delivery** if you want managed operator notifications
