# API Reference

This page documents the public HTTP surface for integrators.

Base URL for the public API:

- API root: `https://api.hiruka.tech`
- API namespace: `https://api.hiruka.tech/api/v1`

## Public endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Fast liveness check |
| GET | `/chains` | Supported chain report |
| GET | `/ready` | Dependency readiness check |
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
| POST | `/api/v1/signals/:id/trigger` | Planned external-input route for future `external` trigger support |
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

- the explicit chain allowlist Iruka loaded
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

This endpoint accepts the full signal envelope.

A successful create returns the saved signal plus a top-level `complexity_score`.
If the signal would push the authenticated user over the active complexity budget, the API returns a structured `400` error instead of creating it.

A valid request must include:

- `version`
- `name`
- `triggers`
- `definition`
- `delivery`

Current outer shape:

```json
{
  "version": "1",
  "name": "High transfer count",
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
        "source": {
          "kind": "raw_event",
          "aggregation": "count",
          "chain_id": 1,
          "event": {
            "kind": "erc20_transfer",
            "contract_addresses": ["0x3333333333333333333333333333333333333333"]
          }
        },
        "operator": ">",
        "value": 100
      }
    ]
  },
  "delivery": [
    { "type": "webhook", "url": "https://antonmyown.dev/webhook/iruka" }
  ],
  "metadata": {
    "description": "Optional",
    "repeat_policy": { "mode": "cooldown" }
  }
}
```

For entity-scoped signals, put the target directly on each condition with alias-specific fields: use `token` and `account` for `ERC20.Position.balance`/`ERC4626.Position.shares`, and keep `entity_id` for Morpho aliases.

State-based `change` conditions depend on archive RPC access. Iruka evaluates those by comparing the current state read to the same state read at `window_start`.

LP pool state reads use raw `state_ref` conditions because they need protocol-specific filters such as `poolId` and `tokenIndex`. Supported LP state targets are `uniswap_v2 Pool.reserve0/reserve1`, `uniswap_v3 Pool.liquidity`, `uniswap_v4 PoolManager.liquidity`, and `curve Pool.balance`.

```json
{
  "definition": {
    "conditions": [
      {
        "type": "threshold",
        "source": { "kind": "alias", "name": "Morpho.Position.supplyShares" },
        "chain_id": 1,
        "entity_id": "0x2222222222222222222222222222222222222222222222222222222222222222",
        "operator": ">",
        "value": "1000000000000000000"
      }
    ]
  }
}
```

## Trigger entries

`triggers` is an array so one signal can wake up in more than one way.

For now, cap it at **3 entries max**.

### Relative schedule

```json
{
  "type": "schedule",
  "schedule": {
    "kind": "interval",
    "interval_seconds": 300
  }
}
```

### Absolute schedule

```json
{
  "type": "schedule",
  "schedule": {
    "kind": "cron",
    "expression": "0 8 * * *"
  }
}
```

Absolute schedule expressions use standard **five-field cron syntax** and are interpreted in **UTC**.

Common examples:

- `0 8 * * *` — every day at 08:00 UTC
- `0 * * * *` — every hour on the hour
- `*/15 * * * *` — every 15 minutes

### External trigger

```json
{
  "type": "external"
}
```

This trigger type is part of the target schema.
Public external input is not enabled yet.

### Signal-to-signal trigger

```json
{
  "type": "iruka_signal",
  "id": "upstream-signal-id"
}
```

If a user already knows another signal id, the user can add `type: "iruka_signal"` with that `id`. When the linked signal fires, it should wake this signal too.

## Delivery

Delivery stays separate from trigger semantics.

Current public delivery shapes:

```json
{
  "delivery": [
    { "type": "telegram" }
  ]
}
```

```json
{
  "delivery": [
    { "type": "webhook", "url": "https://antonmyown.dev/webhook/iruka" }
  ]
}
```

Telegram target:
- `{ "type": "telegram" }`

Webhook target:
- `{ "type": "webhook", "url": "https://your-app.example/webhook" }`

Both can coexist in the same signal:

```json
{
  "delivery": [
    { "type": "telegram" },
    { "type": "webhook", "url": "https://antonmyown.dev/webhook/iruka" }
  ]
}
```

Webhook deliveries use the normal Iruka alert payload and appear in signal history the same way other delivery attempts do.

## Metadata

Current metadata fields:

```json
{
  "metadata": {
    "description": "Optional",
    "repeat_policy": {
      "mode": "cooldown"
    }
  }
}
```

Supported repeat policies:

- `cooldown`
- `post_first_alert_snooze`
- `until_resolved`

## Signal responses

`POST /api/v1/signals`, `GET /api/v1/signals`, `GET /api/v1/signals/:id`, `PATCH /api/v1/signals/:id`, and `PATCH /api/v1/signals/:id/toggle` all use the same saved-signal response shape.

Example:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "version": "1",
  "name": "High transfer count",
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
    "conditions": []
  },
  "delivery": [
    { "type": "webhook", "url": "https://antonmyown.dev/webhook/iruka" }
  ],
  "metadata": {
    "description": "Optional",
    "repeat_policy": { "mode": "cooldown" }
  },
  "complexity_score": 13,
  "is_active": true,
  "created_at": "2026-04-23T00:00:00.000Z",
  "updated_at": "2026-04-23T00:00:00.000Z",
  "last_evaluated_at": null,
  "last_fired_at": null
}
```

`complexity_score` is always included in saved-signal responses.
Today it is derived from existing signal fields only:

- interval schedule contribution: `ceil(3600 / interval_seconds)`
- condition contribution: `+1` per condition
- signals without an interval schedule currently return `0`

## Active complexity budget errors

When create, update, or toggle-on would exceed the authenticated user's active complexity budget, the API returns `400` with a structured payload like:

```json
{
  "error": "Active complexity budget exceeded",
  "code": "active_complexity_budget_exceeded",
  "projected_complexity": 28,
  "tier_maximum": 20,
  "current_complexity": 14
}
```

- `projected_complexity` = what the user's active total would become after the requested change
- `tier_maximum` = the current allowed budget for that user's tier
- `current_complexity` = current active total when available

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
- `triggers`
- `definition`
- `delivery`
- `metadata`
- `is_active`

### `PATCH /api/v1/signals/:id/toggle`

Use this for a simple active/inactive toggle.

### `DELETE /api/v1/signals/:id`

Deletes the signal for the authenticated owner.

## Signal history

### `GET /api/v1/signals/:id/history`

Use history to inspect evaluations, notification attempts, matched conditions, and delivery failures for one authenticated user's signal.

Query parameters:

| Param | Default | Purpose |
| --- | --- | --- |
| `limit` | `100` | Page size for each returned list. Capped at `500`. |
| `offset` | `0` | Shared default offset for evaluations and notifications. Capped at `100000`. |
| `evaluation_offset` | `offset` | Offset for the evaluation timeline. Use this when paging evaluations independently. |
| `notification_offset` | `offset` | Offset for the notification timeline. Use this when paging notifications independently. |
| `include_notifications` | `true` | Set to `false` to omit notification records. |
| `triggered` | unset | Filter evaluations by triggered state: `true` or `false`. |
| `conclusive` | unset | Filter evaluations by conclusive state: `true` or `false`. |
| `notification_success` | unset | Filter notifications by delivery success: `true` for 2xx/3xx webhook status, `false` for failed or missing status. |

Evaluations and notifications are independent timelines. If you need stable pagination across both lists, prefer `evaluation_offset` and `notification_offset` instead of a shared `offset`.

The response includes:

- `evaluations` — evaluation history, including `condition_results`, `conditions_met`, `logic`, any synthesized execution `scope`, and `wake_context`
- `notifications` — notification history, unless `include_notifications=false`
- `count` — number of rows returned in this page
- `pagination` — `limit`, current `offset`, and `next_offset` for evaluations and notifications

Example response shape:

```json
{
  "signal_id": "550e8400-e29b-41d4-a716-446655440000",
  "evaluations": [],
  "notifications": [],
  "count": {
    "evaluations": 0,
    "notifications": 0
  },
  "pagination": {
    "evaluations": {
      "limit": 100,
      "offset": 0,
      "next_offset": null
    },
    "notifications": {
      "limit": 100,
      "offset": 0,
      "next_offset": null
    }
  }
}
```

This is useful for explainability and debugging integrations without direct database access.

For group results:

- legacy address groups return `matchedAddresses`
- generic tracked-value groups return `matchedTargets`

## External trigger execution

### `POST /api/v1/signals/:id/trigger`

This route belongs to the `external` trigger type.
It is **not a live public integration path yet**.
Do not build against it yet.

When this ships, it is expected to wake a signal that includes an `external` trigger entry.
Until then, use scheduled signals in real integrations.

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

## What to read next

- Read **Definition** for the query part of the signal
- Read **Examples** for condition examples
- Read **Signal** for the top-level signal shape
- Read **Telegram Delivery** if you want managed operator notifications
