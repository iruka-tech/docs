# Signal Model

This page gives the big picture.

Read this before **Create a Signal** if you want to understand what an Iruka signal is conceptually.

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

## Condition types

Iruka currently supports five public condition types:

- `threshold`
- `change`
- `group`
- `aggregate`
- `raw-events`

Those condition objects live inside `definition.conditions[]`.

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

## Reading order

If you are learning Iruka step by step:

1. **Signal Model** — high-level structure and capabilities
2. **Create a Signal** — top-level signal fields
3. **The `definition` Object** — what `definition` contains
4. **Writing Signals** — condition-by-condition examples
5. **API Reference** — routes and request behavior
