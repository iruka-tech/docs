# Public Signal Model

This document is the first-principles public explanation of what megabat can express today.

Read this before [DSL.md](dsl.md) if you are new to the system.

`DSL.md` owns exact syntax.
This document owns the mental model, capability boundaries, and limitations.

## The Three Public Layers

Think about megabat in this order:

1. Generic state reads
2. Generic event aggregation
3. Sugared protocol helpers

That is the cleanest way to understand the product surface.

Important:

- `market` is not a first-class primitive
- `market_id` and `scope.markets` are Morpho-oriented sugar
- `contract_address`, `state_ref.filters`, and raw-event definitions are closer to the true underlying model

## 1. Generic State Reads

Today, megabat exposes generic bound state reads through `state_ref`.

Example:

```json
{
  "type": "threshold",
  "state_ref": {
    "protocol": "erc4626",
    "entity_type": "Position",
    "field": "shares",
    "filters": [
      { "field": "chainId", "op": "eq", "value": 1 },
      { "field": "contractAddress", "op": "eq", "value": "0xVaultAddress" },
      { "field": "owner", "op": "eq", "value": "0xOwnerAddress" }
    ]
  },
  "operator": ">",
  "value": "1000000000000000000"
}
```

What this means:

- read one bound state value
- at the current block or at a historical point, depending on condition type
- compare it to a threshold or compare it to an earlier snapshot

What is generic here:

- the overall shape
- the filter model
- the time-travel behavior

What is still opinionated:

- supported `protocol + entity_type + field + filters` combinations are registry-backed
- this is not yet a fully arbitrary ABI-call DSL

Not supported today:

```json
{
  "contractAddress": "0x...",
  "selector": "0x...",
  "calldata": "0x...",
  "result": { "tuple": [...] }
}
```

That lower-level ABI-call shape is a reasonable future direction, but it is not the current public contract.

## 2. Generic Event Aggregation

Today, megabat exposes generic event aggregation through `type: "raw-events"`.

Example:

```json
{
  "type": "raw-events",
  "aggregation": "count",
  "operator": ">",
  "value": 10,
  "window": { "duration": "1h" },
  "chain_id": 1,
  "event": {
    "kind": "contract_event",
    "contract_addresses": ["0xTokenAddress"],
    "signature": "Transfer(address indexed from, address indexed to, uint256 value)"
  }
}
```

What this means:

- fetch all matching logs
- over the requested timeframe
- aggregate the chosen field or count rows
- compare the result to a threshold

This is the current generic event primitive.

What is supported:

- `count`, `sum`, `avg`, `min`, `max`
- well-known event presets
- arbitrary ABI event signatures via `contract_event`
- contract filtering
- decoded-argument filtering

What is not exposed today:

- bare `topic0` / `topic1` / `topic2` / `topic3` as the primary public shape
- a fully generic log-query surface written directly in topic-space

## 3. Sugared Protocol Helpers

The `metric` field is sugar on top of the generic state/event surfaces.

Examples:

- `Morpho.Position.supplyShares`
- `Morpho.Market.utilization`
- `ERC4626.Position.shares`

These are convenience names, not a separate execution engine.

They compile down into the same internal references used by raw state and event paths.

## What You Can Express Today

### Threshold

Supported with:

- `metric`
- `state_ref`
- `raw-events`

Typical uses:

- current state above/below a threshold
- event count or sum in a timeframe

### Change

Supported with:

- `metric`
- `state_ref`

Typical uses:

- share balances dropped over a window
- state increased/decreased by percent or absolute amount

### Aggregate

Supported today with:

- `metric`

Typical uses:

- sum state across a set of tracked addresses
- aggregate indexed event metrics across a scoped set

### Group

Supported today with inner:

- `threshold`
- `change`

Typical uses:

- N-of-M tracked addresses match the same state condition

## What You Cannot Express Today

These are important limitations of the current public API:

- no arbitrary ABI-call state DSL using raw `selector` / `calldata` / tuple decoding
- no public raw topic-based log query language as the primary API shape
- no `aggregate + state_ref`
- no nested `raw-events` inside `group`
- no user-authored arbitrary math expressions over raw refs
- no generalized protocol discovery or vault discovery

## String Enums You Can Use Today

### Raw Event `kind`

- `erc20_transfer`
- `erc20_approval`
- `erc721_transfer`
- `erc721_approval`
- `erc721_approval_for_all`
- `erc4626_deposit`
- `erc4626_withdraw`
- `swap`
- `contract_event`

### Swap `protocols`

- `uniswap_v2`
- `uniswap_v3`

### Scope `protocol`

- `morpho`
- `all`

## Numeric Inputs

State-backed numeric inputs can be:

- JSON numbers
- decimal strings

Use strings when values may exceed JavaScript's safe integer range.

Examples:

- `"1000000000000000000"`
- `"500000000000000000"`

Percent values remain ordinary JSON numbers.

## Practical Reading Order

If you are building against megabat:

1. Read this document
2. Read [DSL.md](dsl.md) for exact syntax
3. Read [API.md](../reference/api.md) for routes and payload wrappers

If you are changing megabat internals:

1. Read [ARCHITECTURE.md](../internals/architecture.md)
2. Read [SOURCES.md](../internals/sources.md)
3. Read [INTERNAL_SIGNAL_ENGINE.md](../internals/internal-signal-engine.md)
