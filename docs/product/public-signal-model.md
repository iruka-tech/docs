# What You Can Build

This page explains Iruka from an integrator's point of view.

The goal is simple: understand what Iruka can evaluate today, how signals are structured, and where the boundaries are.

## Core idea

Iruka evaluates saved **signals**.

A signal has two layers:

1. the outer envelope
2. the `definition` query

The outer envelope says:

- what the signal is called
- how it wakes up
- where alerts go
- runtime metadata

The `definition` says:

- what to watch
- over what window
- which conditions must be met
- how those conditions combine

## Signal envelope

Current public shape:

```json
{
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
      "addresses": ["0x1111111111111111111111111111111111111111"]
    },
    "window": { "duration": "1h" },
    "conditions": [
      {
        "type": "threshold",
        "source": { "kind": "alias", "name": "Morpho.Position.supplyShares" },
        "chain_id": 1,
        "market_id": "0x2222222222222222222222222222222222222222222222222222222222222222",
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
}
```

## Trigger modes

A signal can be driven by one or more trigger entries.

For now, cap `triggers` at **3 entries max**.

### 1. Schedule

Use `schedule` when Iruka should wake the signal on its own.

Relative schedule example:

```json
{
  "type": "schedule",
  "schedule": {
    "kind": "interval",
    "interval_seconds": 300
  }
}
```

Absolute schedule example:

```json
{
  "type": "schedule",
  "schedule": {
    "kind": "cron",
    "expression": "0 8 * * *"
  }
}
```

Absolute schedules should be interpreted in UTC by default.

### 2. External

Use `external` when your own authenticated caller should wake the signal through `POST /api/v1/signals/:id/trigger`.

```json
{
  "type": "external"
}
```

Use this when an upstream event already happened elsewhere and you want Iruka to handle normal evaluation, history, repeat policy, and delivery after that event.

### 3. `iruka_signal`

Use `iruka_signal` when another Iruka signal should wake this signal.

```json
{
  "type": "iruka_signal",
  "id": "upstream-signal-id"
}
```

If a user already knows another signal id, they can add this trigger. When the linked signal fires, it should wake this signal too.

## Delivery

Delivery is separate from trigger semantics.

Current public delivery model:

```json
{
  "delivery": [
    { "type": "telegram" }
  ]
}
```

Telegram is the only public delivery target documented here today.

## Metadata

Current metadata fields:

- `description`
- `repeat_policy`

Example:

```json
{
  "metadata": {
    "description": "Optional",
    "repeat_policy": {
      "mode": "post_first_alert_snooze",
      "snooze_minutes": 1440
    }
  }
}
```

## The five condition types

Iruka supports five condition types in the public API today.

### 1. Threshold

Use this when you want to compare one value against a fixed threshold.

Example condition:

```json
{
  "type": "threshold",
  "source": { "kind": "alias", "name": "Morpho.Market.utilization" },
  "operator": ">",
  "value": 0.9,
  "chain_id": 1,
  "market_id": "0xM"
}
```

### 2. Change

Use this when you care about movement over time rather than the current point-in-time value.

Example condition:

```json
{
  "type": "change",
  "source": { "kind": "alias", "name": "Morpho.Position.supplyShares" },
  "direction": "decrease",
  "by": { "percent": 10 },
  "window": { "duration": "24h" },
  "chain_id": 1,
  "market_id": "0xM",
  "address": "0xUser"
}
```

### 3. Group

Use this when the same rule should be checked across many tracked targets and you care about how many match.

Example condition:

```json
{
  "type": "group",
  "addresses": ["0x1", "0x2", "0x3"],
  "logic": "AND",
  "requirement": { "count": 2, "of": 3 },
  "conditions": [
    {
      "type": "threshold",
      "metric": "Morpho.Position.supplyShares",
      "chain_id": 1,
      "market_id": "0xM",
      "operator": ">",
      "value": "1000000000000000000"
    }
  ]
}
```

### 4. Aggregate

Use this when you want one combined value across a scoped set.

Example condition:

```json
{
  "type": "aggregate",
  "aggregation": "sum",
  "metric": "Morpho.Position.supplyShares",
  "chain_id": 1,
  "market_id": "0xM",
  "operator": ">",
  "value": "5000000000000000000"
}
```

### 5. Raw events

Use this when the cleanest model is to scan decoded events over a rolling window.

Example condition:

```json
{
  "type": "raw-events",
  "aggregation": "count",
  "chain_id": 1,
  "window": { "duration": "1h" },
  "event": {
    "kind": "erc20_transfer",
    "contract_addresses": ["0x3333333333333333333333333333333333333333"]
  },
  "operator": ">",
  "value": 25
}
```

## Current boundaries

Iruka is expressive, but it is not an arbitrary onchain programming language.

Important current limits:

- no arbitrary ABI-call DSL using raw function selectors and calldata
- no general-purpose math expression language authored by end users
- no public topic-level log query language as the primary API shape
- `group` supports either legacy `addresses` or generic `tracked: { field, values }`
- generic tracked groups are currently limited to event-style inner sources
- aggregate conditions accept `source` with `metric` still accepted as compatibility sugar
- `raw-events` is a top-level condition type; it is not exposed as a nested condition inside `group`

## What to read next

- Read **The `definition` Layer** for the query structure
- Read **Writing Signals** for condition-by-condition examples
- Read **API Reference** for the full request shape
- Read **External Triggers** if you want externally triggered signals
