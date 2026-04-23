# Definition

This page explains what goes inside `definition`.

Read **Signal** first if you want the full top-level signal shape.

## What `definition` contains

`definition` is the query Iruka evaluates.

It contains:

- `scope`
- `window`
- `logic`
- `conditions`

## `definition` example

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

## `scope`

`scope` defines the broad search space.

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

Use `scope` for broad narrowing. Put the actual threshold or event test in `conditions`.

## `window`

`window` defines the default time range for the whole definition.

```json
{
  "window": { "duration": "1h" }
}
```

Some condition types can override `window` locally.

## `logic`

`logic` defines how multiple conditions combine.

```json
{ "logic": "AND" }
```

Supported values:

- `AND`
- `OR`

If omitted, Iruka should treat `AND` as the safe default.

## `conditions`

`conditions` is the list of tests inside the definition.

Each condition checks one thing, such as:

- current value above a threshold
- value changed over time
- grouped matches across many addresses
- event count over a rolling window

A threshold example belongs here, not at the top level.

```json
{
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

## What to read next

- Read **Examples** for complete condition examples
- Read **API Reference** for request and response details
