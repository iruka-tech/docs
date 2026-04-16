# Writing Signals

This page shows how to write signal payloads that the Megabat backend accepts today.

Every example on this page follows the public request schema used by `POST /api/v1/signals`.

## Top-level shape

A create request looks like this:

```json
{
  "name": "Human-readable signal name",
  "definition": {
    "scope": {
      "chains": [1],
      "protocol": "morpho",
      "addresses": ["0x..."]
    },
    "window": { "duration": "1h" },
    "conditions": []
  },
  "webhook_url": "https://example.com/webhook",
  "cooldown_minutes": 10,
  "repeat_policy": { "mode": "cooldown" }
}
```

You must provide at least one of:

- `webhook_url`
- `delivery`

## Scope

`scope` defines the broad search space for the signal.

```json
{
  "chains": [1, 8453],
  "protocol": "morpho",
  "addresses": ["0xabc...", "0xdef..."]
}
```

Supported fields:

- `chains` — required array of positive chain IDs
- `markets` — optional array of market identifiers
- `addresses` — optional array of addresses to track
- `protocol` — optional, currently `"morpho"` or `"all"`

## Window

A signal must define a root window:

```json
{ "duration": "1h" }
```

Per-condition window overrides are also supported on condition objects.

## Threshold example

This example checks whether a Morpho position is above a threshold.

```json
{
  "type": "threshold",
  "metric": "Morpho.Position.supplyShares",
  "chain_id": 1,
  "market_id": "0x2222222222222222222222222222222222222222222222222222222222222222",
  "address": "0x1111111111111111111111111111111111111111",
  "operator": ">",
  "value": "1000000000000000000"
}
```

Rules:

- use exactly one of `metric` or `state_ref`
- `operator` must be one of `>`, `<`, `>=`, `<=`, `==`, `!=`
- `value` can be a number or numeric string

## Change example

This example checks whether a Morpho position decreased by 10% over 24 hours.

```json
{
  "type": "change",
  "metric": "Morpho.Position.supplyShares",
  "chain_id": 1,
  "market_id": "0x2222222222222222222222222222222222222222222222222222222222222222",
  "address": "0x1111111111111111111111111111111111111111",
  "direction": "decrease",
  "by": { "percent": 10 },
  "window": { "duration": "24h" }
}
```

Supported directions:

- `increase`
- `decrease`
- `any`

`by` can be:

- `{ "percent": 10 }`
- `{ "absolute": "1000000" }`

## Group example

This example checks whether at least 2 of 3 tracked addresses satisfy the same threshold condition.

`group` is address-based in the public API today. It is not a generic "group over arbitrary IDs" construct.

```json
{
  "type": "group",
  "addresses": [
    "0x1111111111111111111111111111111111111111",
    "0x2222222222222222222222222222222222222222",
    "0x3333333333333333333333333333333333333333"
  ],
  "logic": "AND",
  "requirement": {
    "count": 2,
    "of": 3
  },
  "conditions": [
    {
      "type": "threshold",
      "metric": "Morpho.Position.supplyShares",
      "chain_id": 1,
      "market_id": "0x4444444444444444444444444444444444444444444444444444444444444444",
      "operator": ">",
      "value": "1000000000000000000"
    }
  ]
}
```

## Aggregate example

Aggregate conditions are evaluated against the surrounding signal scope.

What gets aggregated depends on the metric:

- for position metrics, include the tracked addresses in `scope.addresses`
- for market metrics, use `scope.markets` or `market_id`
- for event metrics, the aggregate is computed over the matching event set, optionally narrowed by filters

Example definition snippet:

```json
{
  "scope": {
    "chains": [1],
    "protocol": "morpho",
    "addresses": [
      "0x1111111111111111111111111111111111111111",
      "0x2222222222222222222222222222222222222222"
    ]
  },
  "window": { "duration": "1h" },
  "conditions": [
    {
      "type": "aggregate",
      "aggregation": "sum",
      "metric": "Morpho.Position.supplyShares",
      "chain_id": 1,
      "market_id": "0x2222222222222222222222222222222222222222222222222222222222222222",
      "operator": ">",
      "value": "5000000000000000000"
    }
  ]
}
```

Supported aggregations:

- `sum`
- `avg`
- `min`
- `max`
- `count`

## Raw-events example: ERC-20 outbound transfer volume

This example tracks total ERC-20 transfer volume sent from one address over the last hour.

```json
{
  "type": "raw-events",
  "aggregation": "sum",
  "field": "value",
  "operator": ">",
  "value": 1000000000000000000000,
  "chain_id": 1,
  "window": { "duration": "1h" },
  "event": {
    "kind": "erc20_transfer",
    "contract_addresses": ["0x3333333333333333333333333333333333333333"]
  },
  "filters": [
    {
      "field": "from",
      "op": "eq",
      "value": "0x1111111111111111111111111111111111111111"
    }
  ]
}
```

You can also filter by `to`, or by both `from` and `to` in the same raw-events condition.

For ERC-20 transfers, common decoded filter fields include:

- `from`
- `to`
- `value`

For `count`, `field` is optional.

Megabat can track gross inbound or outbound volume this way. Netting inflow minus outflow for the same address is not exposed as a single raw-events primitive today.

## Raw-events example: swaps

```json
{
  "type": "raw-events",
  "aggregation": "sum",
  "field": "amount0_abs",
  "operator": ">",
  "value": 1000000,
  "chain_id": 1,
  "window": { "duration": "30m" },
  "event": {
    "kind": "swap",
    "protocols": ["uniswap_v3"]
  }
}
```

## Raw-events example: custom contract event

```json
{
  "type": "raw-events",
  "aggregation": "count",
  "operator": ">",
  "value": 2,
  "chain_id": 1,
  "window": { "duration": "1h" },
  "event": {
    "kind": "contract_event",
    "contract_addresses": ["0x5555555555555555555555555555555555555555"],
    "signature": "Transfer(address indexed from, address indexed to, uint256 value)"
  }
}
```

## Using `state_ref`

If you do not want to rely on a named metric, you can use an explicit `state_ref`.

```json
{
  "type": "threshold",
  "state_ref": {
    "protocol": "erc4626",
    "entity_type": "Position",
    "field": "shares",
    "filters": [
      { "field": "chainId", "op": "eq", "value": 1 },
      { "field": "contractAddress", "op": "eq", "value": "0x6666666666666666666666666666666666666666" },
      { "field": "owner", "op": "eq", "value": "0x1111111111111111111111111111111111111111" }
    ]
  },
  "operator": ">",
  "value": "1000000000000000000"
}
```

Rules:

- `state_ref` must include `protocol`, `entity_type`, `field`, and at least one filter
- do not send both `metric` and `state_ref` in the same threshold or change condition

## Full create example with Telegram delivery

```json
{
  "name": "High swap activity",
  "definition": {
    "scope": {
      "chains": [1],
      "protocol": "all"
    },
    "window": { "duration": "30m" },
    "conditions": [
      {
        "type": "raw-events",
        "aggregation": "count",
        "operator": ">",
        "value": 10,
        "chain_id": 1,
        "event": {
          "kind": "swap",
          "protocols": ["uniswap_v2", "uniswap_v3"]
        }
      }
    ]
  },
  "delivery": { "provider": "telegram" },
  "cooldown_minutes": 5,
  "repeat_policy": { "mode": "until_resolved" }
}
```

## Common validation rules to remember

- `scope.chains` is required
- `definition.window` is required
- `conditions` must contain at least one condition
- threshold and change conditions require exactly one of `metric` or `state_ref`
- `raw-events` requires `field` unless `aggregation` is `count`
- `webhook_url` or `delivery` is required at the top level

## What to read next

- Read **Auth** before integrating from a real application
- Read **API Reference** for route behavior and response payloads
