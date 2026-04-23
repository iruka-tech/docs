# The `definition` Object

This page explains the `definition` part of a signal.

A full signal has two layers:

1. the **outer signal envelope**
2. the **`definition` object**

The outer signal envelope owns:

- `version`
- `name`
- `triggers`
- `delivery`
- `metadata`

The `definition` object owns:

- `scope`
- `window`
- `logic`
- `conditions`

## Full signal vs `definition`

Full signal example:

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
    "logic": "AND",
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

`definition` only:

```json
{
  "scope": {
    "chains": [1],
    "protocol": "morpho",
    "addresses": ["0x1111111111111111111111111111111111111111"]
  },
  "window": { "duration": "1h" },
  "logic": "AND",
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
}
```

Everything inside `definition` is the query Iruka evaluates.

## Structure inside `definition`

## 1. `scope`

`scope` defines the broad search space.

Example:

```json
{
  "scope": {
    "chains": [1, 8453],
    "protocol": "morpho",
    "addresses": ["0xabc...", "0xdef..."]
  }
}
```

Supported fields:

- `chains` — required array of positive chain IDs
- `markets` — optional array of market identifiers
- `addresses` — optional array of addresses to track
- `protocol` — optional, currently `"morpho"` or `"all"`

Use `scope` for broad narrowing. Do not put the actual threshold or event test here.

## 2. `window`

`window` defines the default time range for the whole definition.

Example:

```json
{
  "window": { "duration": "1h" }
}
```

Some condition types can override `window` locally.

## 3. `logic`

`logic` controls how multiple condition results combine.

Example:

```json
{
  "logic": "AND"
}
```

Supported values:

- `AND`
- `OR`

## 4. `conditions`

`conditions` is the array of actual checks.

Example:

```json
{
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
```

This is the key rule:

- `scope` narrows where Iruka looks
- `window` defines the time range
- `logic` combines results
- `conditions[]` holds the actual threshold, change, group, aggregate, and raw-events objects

## Where condition examples belong

When the docs show a condition example like `threshold`, `change`, or `group`, that JSON is a **condition object**, not a full signal.

That object belongs inside:

```json
{
  "definition": {
    "conditions": [
      { "type": "threshold", "...": "condition fields here" }
    ]
  }
}
```

## What does not belong in `definition`

These do **not** belong inside `definition`:

- `version`
- `name`
- `triggers`
- `delivery`
- `metadata`

Those live in the outer signal envelope.

## Reading rule of thumb

When you read a signal:

- top level = signal envelope
- `definition` = query logic
- `definition.scope` = where to look
- `definition.window` = time range
- `definition.logic` = AND / OR combination
- `definition.conditions[]` = actual checks

## What to read next

- Read **Writing Signals** for condition-by-condition examples
- Read **API Reference** for the full outer signal payload
- Read **What You Can Build** for the product model and boundaries
