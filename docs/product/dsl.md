# Writing Signals

This page focuses on the condition language used inside `definition.conditions[]`.

If you want the full signal envelope first, read **The `definition` Layer** and **API Reference**.

## Signal layering

A full signal has two layers:

- outer envelope: `version`, `name`, `triggers`, `delivery`, `metadata`
- query logic: `definition`

Condition examples on this page belong inside:

```json
{
  "definition": {
    "scope": { "chains": [1], "protocol": "all" },
    "window": { "duration": "1h" },
    "conditions": [
      {
        "type": "threshold",
        "source": { "kind": "alias", "name": "Morpho.Market.utilization" },
        "operator": ">",
        "value": 0.9,
        "chain_id": 1,
        "market_id": "0xMarket"
      }
    ]
  }
}
```

## Condition types

Iruka currently supports these public condition types:

- `threshold`
- `change`
- `group`
- `aggregate`
- `raw-events`

## 1. Threshold

Definition:

A threshold condition compares one evaluated value against a target.

Example:

```json
{
  "type": "threshold",
  "source": { "kind": "alias", "name": "Morpho.Position.supplyShares" },
  "chain_id": 1,
  "market_id": "0x2222222222222222222222222222222222222222222222222222222222222222",
  "address": "0x1111111111111111111111111111111111111111",
  "operator": ">",
  "value": "1000000000000000000"
}
```

Rules:

- preferred input is `source`
- compatibility inputs `metric` and `state_ref` are still accepted
- `operator` must be one of `>`, `<`, `>=`, `<=`, `==`, `!=`
- `value` can be a number or numeric string

## 2. Change

Definition:

A change condition checks movement over time instead of only the current value.

Example:

```json
{
  "type": "change",
  "source": { "kind": "alias", "name": "Morpho.Position.supplyShares" },
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

## 3. Group

Definition:

A group condition applies the same inner test across many tracked targets and checks how many matched.

Address-group example:

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

Tracked-value example:

```json
{
  "type": "group",
  "tracked": {
    "field": "oracleId",
    "values": [101, 202, 303]
  },
  "logic": "AND",
  "requirement": {
    "count": 2,
    "of": 3
  },
  "conditions": [
    {
      "type": "threshold",
      "source": { "kind": "alias", "name": "Morpho.Event.Supply.assets" },
      "chain_id": 1,
      "market_id": "0x4444444444444444444444444444444444444444444444444444444444444444",
      "operator": ">",
      "value": 100
    }
  ]
}
```

Rules:

- set exactly one of `addresses` or `tracked`
- generic tracked groups are currently limited to event-style inner sources
- response/history payloads may include `matchedTargets` for tracked groups

## 4. Aggregate

Definition:

An aggregate condition reduces a scoped set to one combined number.

Example:

```json
{
  "type": "aggregate",
  "aggregation": "sum",
  "metric": "Morpho.Position.supplyShares",
  "chain_id": 1,
  "market_id": "0x2222222222222222222222222222222222222222222222222222222222222222",
  "operator": ">",
  "value": "5000000000000000000"
}
```

Supported aggregations:

- `sum`
- `avg`
- `min`
- `max`
- `count`

What gets aggregated depends on the surrounding signal scope and source family.

## 5. Raw events

Definition:

A raw-events condition scans decoded events over a rolling window.

Example:

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
    { "field": "from", "op": "eq", "value": "0x1111111111111111111111111111111111111111" }
  ]
}
```

This is the right choice when event activity is the source of truth.

## Common pattern: full `definition`

```json
{
  "scope": {
    "chains": [1],
    "protocol": "all"
  },
  "window": { "duration": "1h" },
  "logic": "AND",
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
}
```

## What this page does not cover

This page does not define:

- `version`
- `name`
- `triggers`
- `delivery`
- `metadata`

Those belong to the outer signal envelope.

## What to read next

- Read **The `definition` Layer** for `scope`, `window`, `logic`, and `conditions`
- Read **API Reference** for the full create-signal request shape
- Read **External Triggers** for externally triggered signals
