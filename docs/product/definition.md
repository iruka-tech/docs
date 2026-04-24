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
    "entities": ["0x2222222222222222222222222222222222222222222222222222222222222222"],
    "addresses": ["0x1111111111111111111111111111111111111111"]
  },
  "window": { "duration": "1h" },
  "logic": "AND",
  "conditions": [
    {
      "type": "threshold",
      "source": { "kind": "alias", "name": "Morpho.Position.supplyShares" },
      "chain_id": 1,
      "entity_id": "0x2222222222222222222222222222222222222222222222222222222222222222",
      "address": "0x1111111111111111111111111111111111111111",
      "operator": ">",
      "value": "1000000000000000000"
    }
  ]
}
```

## `scope`

`scope` defines the allowed search space for the whole definition.

Think of it as the outer filter:

- which chains Iruka is allowed to look at
- which protocol family it should use
- which entities are in play
- which addresses are in play

```json
{
  "scope": {
    "chains": [1, 8453],
    "protocol": "morpho",
    "entities": ["0xabc...", "0xdef..."],
    "addresses": ["0x111...", "0x222..."]
  }
}
```

Supported fields:

- `chains` — required array of positive chain IDs
- `protocol` — optional, currently `"morpho"` or `"all"`
- `entities` — optional array of entity identifiers
- `addresses` — optional array of addresses to track

### What is an `entity`?

An `entity` is the protocol object your condition is about.

In the Morpho examples in these docs, `entity_id` is the **market id**.
So a position condition usually needs both:

- `entity_id` — which market
- `address` — which user inside that market

Today, the clearest public example is:

- `protocol: "morpho"`
- `entities: ["0x…"]` where each value is a Morpho market id

### Why define `addresses` in `scope` at all?

Because `scope` is the shared candidate set for the whole definition, while each condition is the specific test.

That split matters for three reasons:

1. **Consistency across conditions** — every condition must stay inside the same allowed address set.
2. **Less repetition** — if several conditions use the same tracked addresses, you define them once in `scope`.
3. **Compiler fallback** — if a condition omits `address` or `entity_id`, Iruka can fill it from `scope` only when there is exactly one value there. If `scope` has multiple values, leaving it out becomes ambiguous.

So the rule is:

- put the shared allowed set in `scope`
- put the exact per-condition target in the condition when needed

If you only have one tracked address, putting it in both places can feel repetitive, but it still keeps the definition explicit and consistent.

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
      "entity_id": "0x2222222222222222222222222222222222222222222222222222222222222222",
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
