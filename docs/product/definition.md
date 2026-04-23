# The `definition` Layer

This page explains the part of a signal that contains the actual monitoring logic.

The full signal request has two layers:

1. the **outer signal envelope**
2. the **definition** object

The outer envelope answers:

- what this signal is called
- how it wakes up
- where alerts go
- runtime metadata

The `definition` object answers:

- what to watch
- over what window
- which conditions must be true
- how multiple conditions combine

## Where `definition` lives

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

Everything under `definition` is the signal query itself.

## The 4 parts inside `definition`

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

Use `scope` for broad narrowing. Do not put the full condition logic here.

## 2. `window`

`window` defines the default time range for the signal.

Example:

```json
{
  "window": { "duration": "1h" }
}
```

This is the default evaluation window for the root definition.

Some condition types can override `window` locally.

## 3. `logic`

`logic` controls how multiple conditions combine.

Example:

```json
{
  "logic": "AND"
}
```

Supported values:

- `AND`
- `OR`

If omitted, backend should treat it as the default root combination rule.

## 4. `conditions`

`conditions` is the heart of the definition.

It is an array of condition objects.

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

A “threshold example” belongs here: inside `definition.conditions[]`.

## Full definition example

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
- `definition.conditions[]` = actual tests

## What to read next

- Read **Writing Signals** for condition-by-condition examples
- Read **API Reference** for the full outer signal payload
- Read **What You Can Build** for the product model and boundaries
