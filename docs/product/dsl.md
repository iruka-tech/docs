# DSL Reference

This is the canonical syntax reference for megabat signal definitions.

If you are new to the system, read [PUBLIC_SIGNAL_MODEL.md](public-signal-model.md) first.
That document explains what the API can and cannot express today.

This document owns:

- exact field names
- exact condition syntax
- examples

It does not own the internal planner/binder/evaluator design.

## Definition Shape

```json
{
  "scope": {
    "chains": [1],
    "addresses": ["0xOwnerAddress"],
    "protocol": "all"
  },
  "window": { "duration": "1h" },
  "logic": "AND",
  "conditions": [
    {
      "type": "change",
      "metric": "ERC4626.Position.shares",
      "direction": "decrease",
      "by": { "percent": 20 },
      "chain_id": 1,
      "contract_address": "0xVaultAddress",
      "address": "0xOwnerAddress"
    }
  ]
}
```

At the HTTP layer, this object is sent as the `definition` field inside `POST /api/v1/signals`. The surrounding request wrapper is documented in [API.md](../reference/api.md).

## Mental Model

Think about the API in three layers, in this order:

1. Generic state reads
2. Generic event aggregation
3. Sugared protocol helpers

That is the right way to understand the system.

- `market` is not a first-class blockchain primitive
- `market_id` and `scope.markets` are Morpho-oriented sugar
- `contract_address`, `state_ref.filters`, and raw-event selectors are closer to the real underlying model

## Three Layers

### 1. Generic State Reads

Today the public generic state surface is `state_ref`.

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

Current state primitive:

- `protocol`
- `entity_type`
- `field`
- `filters`

Important:

- this is generic over supported protocol bindings
- it is not yet an arbitrary ABI-call DSL

Not supported today:

```json
{
  "contractAddress": "0x...",
  "selector": "0x...",
  "calldata": "0x...",
  "result": { "tuple": [...] }
}
```

That lower-level ABI-call form is a plausible future direction, but it is not the current public contract.

### 2. Generic Event Aggregation

Today the generic event surface is `type: "raw-events"`.

```json
{
  "type": "raw-events",
  "aggregation": "sum",
  "operator": ">",
  "value": 1000,
  "field": "value",
  "chain_id": 1,
  "event": {
    "kind": "contract_event",
    "contract_addresses": ["0xTokenAddress"],
    "signature": "Transfer(address indexed from, address indexed to, uint256 value)"
  },
  "filters": [
    { "field": "from", "op": "eq", "value": "0xFromAddress" }
  ]
}
```

Generic event primitive:

- contracts
- event selector / signature
- decoded filters
- time window
- field to aggregate

### 3. Sugared Protocol Helpers

Protocol sugar sits on top of those primitives.

Examples:

- `Morpho.Position.supplyShares`
- `Morpho.Market.utilization`
- `ERC4626.Position.shares`

These are convenience names that compile down into the same internal state/event machinery.

## Scope

```json
{
  "scope": {
    "chains": [1],
    "addresses": ["0xaddress"],
    "protocol": "all"
  }
}
```

Rules:

- `chains` is required
- `addresses` is optional
- `markets` is optional and mainly useful for Morpho sugar
- `protocol` is optional and currently supports `morpho` and `all`
- if a condition omits `chain_id`, `market_id`, or `address`, the compiler may infer it from scope when there is only one unambiguous value
- if scope contains multiple values, set the specific field in the condition to avoid ambiguity

Practical guidance:

- prefer condition-local `contract_address` or `state_ref.filters` for contract-scoped signals
- treat `scope.markets` as Morpho-specific convenience, not a universal state primitive

## Window

```json
{ "window": { "duration": "1h" } }
```

Rules:

- duration format is `{number}{unit}`
- supported units: `s`, `m`, `h`, `d`, `w`
- examples: `30m`, `1h`, `7d`, `3600s`
- the public DSL window is duration-based only
- a condition may override the signal-level window with its own `window`

## Numeric Inputs

State-backed conditions can now accept large integer literals either as JSON numbers or decimal strings.

Use strings when the value may exceed JavaScript's safe integer range.

Examples:

- `"1000000000000000000"` for 1e18 share thresholds
- `"500000000000000000"` for absolute state deltas

Percent values remain normal JSON numbers.

## Reference Families

megabat supports three canonical reference families in the DSL:

| Family | How you reference it in DSL | Typical examples | Backing source today |
| --- | --- | --- | --- |
| state | `metric` or `state_ref` on state-based conditions | `Morpho.Position.supplyShares`, `Morpho.Market.totalBorrowAssets`, `ERC4626.Position.shares` | RPC |
| indexed | `metric` on `threshold` or `aggregate` (advanced) | `Morpho.Event.Supply.assets`, `Morpho.Flow.netSupply` | indexing boundary, currently Envio |
| raw | `type: "raw-events"` with `event`, optional `filters`, and `field` for non-`count` aggregations (default event primitive) | ERC-20/ERC-721/ERC-1155 transfers and approvals, raw swap logs, custom ABI events | indexing boundary, currently HyperSync |

These are the only three top-level families users need to think about.

Provider choice is an implementation detail:

- RPC powers current and historical state reads
- the indexing boundary powers indexed semantic history plus raw decoded event scans
- today the indexing boundary uses Envio for indexed reads and HyperSync for raw reads

Runtime gating:

- state stays enabled by default
- indexed requires `ENVIO_ENDPOINT`
- raw requires `ENVIO_API_TOKEN`
- if a required source family is disabled, megabat rejects that signal definition through the API instead of storing it and failing later

See [SOURCES.md](../internals/sources.md) for the full capability model and future extension path.

## How Families Compose

The public DSL is family-first, not provider-first.

- `metric` references compile into state or indexed AST refs
- `state_ref` compiles directly into a raw state AST ref
- `raw-events` compiles into raw-event AST refs
- the evaluator can combine those refs through normal expression and condition nodes

For state specifically:

- `metric` is the sugared registry layer for stable common reads
- `state_ref` is the public raw state layer
- both converge into the same internal `StateRef` shape before planning and evaluation

That is the path for future extension too:

- if a new provider serves an existing family, keep the DSL unchanged and update the planner
- if a genuinely new family is needed, add a new leaf ref type and keep provider details out of the DSL

## Condition Inputs

Each condition shape accepts one of two input styles:

| Condition type | Input style | Used for |
| --- | --- | --- |
| `threshold` | `metric` or `state_ref` | compare one state or indexed metric to a fixed value, or compare a raw state read to a fixed value |
| `change` | `metric` or `state_ref` | compare current state to historical state |
| `aggregate` | `metric` | aggregate one state or indexed metric across the current scope |
| `raw-events` | `event` + optional `field` | scan raw decoded logs and aggregate matching rows; `field` is only required when `aggregation` is not `count` |

## Protocol Sugar

The `metric` field is the sugared protocol layer on top of generic state/event primitives.

Current sugared namespaces:

- `Morpho.Position.*` for position state
- `Morpho.Market.*` for market state and computed state
- `ERC4626.Position.*` for ERC-4626 position state
- `Morpho.Event.*` for indexed semantic event metrics
- `Morpho.Flow.*` for indexed derived event flows

Examples:

- state: `Morpho.Position.supplyShares`
- state: `Morpho.Market.totalBorrowAssets`
- state: `ERC4626.Position.shares`
- computed state: `Morpho.Market.utilization`
- indexed event metric: `Morpho.Event.Supply.assets`
- indexed flow metric: `Morpho.Flow.netSupply`

Important:

- `Morpho.Event.*` and `Morpho.Flow.*` are indexed semantic references, not raw logs
- if you need raw decoded logs, use `type: "raw-events"` instead of `metric`

## Generic State Fields

`state_ref` exposes raw public state reads for `threshold` and `change` conditions without going through the metric registry.

```json
{
  "type": "change",
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
  "direction": "decrease",
  "by": { "percent": 20 },
  "window": { "duration": "7d" }
}
```

Rules:

- `threshold` and `change` require exactly one of `metric` or `state_ref`
- `state_ref` is close to the internal `StateRef` shape: `protocol`, `entity_type`, `field`, `filters`
- required filters depend on the bound protocol/entity/field combination
- inside `group`, omit the tracked address filter from `state_ref.filters`; megabat injects it per tracked address at runtime

Current supported binding fields are protocol-specific.

Examples:

- Morpho position state uses `marketId` and `user`
- Morpho market state uses `marketId`
- ERC-4626 position state uses `contractAddress` and `owner`

So today `field` is generic, but supported field/filter combinations are constrained by registered bindings.

## Condition Types

### Threshold

Compare a metric to a fixed value.

Works with:

- state metrics
- raw state refs
- indexed event metrics
- indexed flow metrics
- computed state metrics

```json
{
  "type": "threshold",
  "metric": "Morpho.Market.utilization",
  "operator": ">",
  "value": 0.9,
  "chain_id": 1,
  "market_id": "0x..."
}
```

Rules:

- set exactly one of `metric` or `state_ref`
- `filters` is only valid for indexed event metrics, not `state_ref`
- for large integer state thresholds, prefer string literals over JSON numbers

### Change

Compare a current value to a historical value.

Works with:

- state metrics
- raw state refs

```json
{
  "type": "change",
  "metric": "Morpho.Position.supplyShares",
  "direction": "decrease",
  "by": { "percent": 20 },
  "chain_id": 1,
  "market_id": "0x...",
  "address": "0x..."
}
```

ERC-4626 metric sugar example:

```json
{
  "type": "change",
  "metric": "ERC4626.Position.shares",
  "direction": "decrease",
  "by": { "percent": 20 },
  "chain_id": 1,
  "contract_address": "0xVaultAddress",
  "address": "0xOwnerAddress"
}
```

Rules:

- set exactly one of `metric` or `state_ref`
- `direction` should be `increase` or `decrease`
- `by` accepts either `{ "percent": number }` or `{ "absolute": number }`
- `contract_address` is the metric-mode convenience field for contract-backed state metrics such as `ERC4626.Position.shares`
- for large integer absolute deltas, prefer string literals in `by.absolute`

### Group

Evaluate one or more conditions per address, then apply an N-of-M requirement.

```json
{
  "type": "group",
  "addresses": ["0xA", "0xB", "0xC"],
  "requirement": { "count": 2, "of": 3 },
  "logic": "AND",
  "conditions": [
    {
      "type": "threshold",
      "metric": "Morpho.Position.collateral",
      "operator": "<",
      "value": 100,
      "chain_id": 1,
      "market_id": "0x..."
    }
  ]
}
```

Rules:

- `requirement.of` must equal the number of `addresses`
- inner conditions should not set `address`; megabat injects it per address
- raw `state_ref` inner conditions should also omit their tracked address filter (for example `owner`)
- use `logic` when each address must satisfy multiple inner conditions together

### Aggregate

Aggregate conditions still use `metric`, but they now support contract-scoped state metrics as well as market-scoped ones.

ERC-4626 aggregate example:

```json
{
  "type": "aggregate",
  "aggregation": "sum",
  "metric": "ERC4626.Position.shares",
  "operator": ">",
  "value": "1000000000000000000",
  "chain_id": 1,
  "contract_address": "0xVaultAddress"
}
```

Rules:

- state aggregates still use `metric`, not `state_ref`
- market-scoped state aggregates use `market_id`
- contract-scoped state aggregates use `contract_address`
- position aggregates still require `scope.addresses`
- for large integer aggregate thresholds, prefer string literals

Aggregate a metric across the current scope.

Works with:

- state metrics
- computed state metrics
- indexed event metrics
- indexed flow metrics

```json
{
  "type": "aggregate",
  "aggregation": "sum",
  "metric": "Morpho.Event.Supply.assets",
  "operator": ">",
  "value": 1000000,
  "chain_id": 1,
  "market_id": "0x..."
}
```

Rules:

- `aggregation` supports `sum`, `avg`, `min`, `max`, `count`
- market aggregates need market scope
- position aggregates need both market and address scope

### Raw Events

Scan raw logs with HyperSync, decode them with an ABI event signature or preset, filter them, then aggregate the matching rows.

```json
{
  "type": "raw-events",
  "aggregation": "sum",
  "field": "value",
  "operator": ">",
  "value": 1000000,
  "chain_id": 1,
  "window": { "duration": "1h" },
  "event": {
    "kind": "erc20_transfer",
    "contract_addresses": ["0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"]
  },
  "filters": [{ "field": "from", "op": "eq", "value": "0xC..." }]
}
```

Count-only example:

```json
{
  "type": "raw-events",
  "aggregation": "count",
  "operator": ">",
  "value": 25,
  "chain_id": 1,
  "event": {
    "kind": "erc20_transfer",
    "contract_addresses": ["0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"]
  },
  "filters": [{ "field": "to", "op": "eq", "value": "0xReceiver" }]
}
```

Generic contract event example:

```json
{
  "type": "raw-events",
  "aggregation": "sum",
  "field": "amount0In",
  "operator": ">",
  "value": 500000,
  "chain_id": 1,
  "window": { "duration": "30m" },
  "event": {
    "kind": "contract_event",
    "contract_addresses": ["0xPool"],
    "signature": "Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)"
  }
}
```

Normalized swap preset example:

```json
{
  "type": "raw-events",
  "aggregation": "sum",
  "field": "amount0_abs",
  "operator": ">",
  "value": 500000,
  "chain_id": 1,
  "window": { "duration": "30m" },
  "event": {
    "kind": "swap",
    "protocols": ["uniswap_v2", "uniswap_v3"],
    "contract_addresses": ["0xPoolA", "0xPoolB"]
  },
  "filters": [{ "field": "recipient", "op": "eq", "value": "0xRecipient" }]
}
```

Rules:

- `aggregation` supports `sum`, `avg`, `min`, `max`, `count`
- `field` is required for `sum`, `avg`, `min`, and `max`
- `field` may be omitted when `aggregation` is `count`
- well-known `event.kind` values currently include: `erc20_transfer`, `erc20_approval`, `erc721_transfer`, `erc721_approval`, `erc721_approval_for_all`, `erc4626_deposit`, `erc4626_withdraw`, and `swap`
- `event.kind = "erc20_transfer"` uses the canonical ERC-20 `Transfer` signature
- `event.kind = "swap"` expands into all requested supported swap presets; if `protocols` is omitted, megabat currently queries both `uniswap_v2` and `uniswap_v3`
- `event.kind = "contract_event"` requires a full ABI event signature, including `indexed` markers
- `signature` is only valid with `event.kind = "contract_event"`
- `protocols` is only valid with `event.kind = "swap"`
- `filters` run against decoded event arguments and metadata fields such as `contract_address`, `block_number`, and `transaction_hash`
- `swap` presets also add normalized fields: `recipient`, `amount0_in`, `amount0_out`, `amount0_abs`, `amount1_in`, `amount1_out`, `amount1_abs`, and `swap_protocol`
- `contract_addresses` is optional, but omitting it can create very broad scans

## Metrics

The canonical registry lives in `src/engine/metrics.ts`.

Common state metrics:

- `Morpho.Position.supplyShares`
- `Morpho.Position.borrowShares`
- `Morpho.Position.collateral`
- `Morpho.Market.totalSupplyAssets`
- `Morpho.Market.totalBorrowAssets`
- `Morpho.Market.fee`

Computed metrics:

- `Morpho.Market.utilization`

Indexed event metrics:

- `Morpho.Event.Supply.assets`
- `Morpho.Event.Supply.count`
- `Morpho.Event.Withdraw.assets`
- `Morpho.Event.Borrow.assets`
- `Morpho.Event.Repay.assets`
- `Morpho.Event.Liquidate.repaidAssets`

Flow metrics:

- `Morpho.Flow.netSupply`
- `Morpho.Flow.netBorrow`
- `Morpho.Flow.totalLiquidations`

## Event Filters

Event-based `threshold` and `aggregate` conditions can add `filters`:

```json
{
  "type": "threshold",
  "metric": "Morpho.Event.Supply.assets",
  "operator": ">",
  "value": 1000,
  "chain_id": 1,
  "market_id": "0xM",
  "filters": [
    { "field": "caller", "op": "eq", "value": "0xC" },
    { "field": "isMonarch", "op": "eq", "value": true }
  ]
}
```

Filters are for event metrics only.

They do not apply to `raw-events`. Raw-event filters are decoded in-memory after HyperSync returns raw logs.

## Compile-Tested Canonical Examples

Everything in this section is intended to work now and is covered by compile-level tests in `src/engine/compile-signal.test.ts`.

### State: Simple Market Threshold

```json
{
  "scope": { "chains": [1], "markets": ["0xM"] },
  "window": { "duration": "1h" },
  "conditions": [
    {
      "type": "threshold",
      "metric": "Morpho.Market.utilization",
      "operator": ">",
      "value": 0.9,
      "chain_id": 1,
      "market_id": "0xM"
    }
  ]
}
```

### State: Position Drop Over Time

```json
{
  "scope": {
    "chains": [1],
    "markets": ["0xM"],
    "addresses": ["0xA"]
  },
  "window": { "duration": "24h" },
  "conditions": [
    {
      "type": "change",
      "metric": "Morpho.Position.supplyShares",
      "direction": "decrease",
      "by": { "percent": 20 },
      "chain_id": 1,
      "market_id": "0xM",
      "address": "0xA"
    }
  ]
}
```

### State: Group Alert Across Addresses

```json
{
  "scope": { "chains": [1], "markets": ["0xM"] },
  "window": { "duration": "6h" },
  "conditions": [
    {
      "type": "group",
      "addresses": ["0xA", "0xB", "0xC"],
      "requirement": { "count": 2, "of": 3 },
      "logic": "AND",
      "conditions": [
        {
          "type": "threshold",
          "metric": "Morpho.Position.collateral",
          "operator": "<",
          "value": 100,
          "chain_id": 1,
          "market_id": "0xM"
        }
      ]
    }
  ]
}
```

### Raw: ERC-20 Transfer Volume

```json
{
  "scope": { "chains": [1], "protocol": "all" },
  "window": { "duration": "1h" },
  "conditions": [
    {
      "type": "raw-events",
      "aggregation": "sum",
      "field": "value",
      "operator": ">",
      "value": 1000000,
      "event": {
        "kind": "erc20_transfer",
        "contract_addresses": ["0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"]
      },
      "filters": [{ "field": "to", "op": "eq", "value": "0xReceiver" }]
    }
  ]
}
```

### Raw: ERC-20 Transfer Count

```json
{
  "scope": { "chains": [1], "protocol": "all" },
  "window": { "duration": "1h" },
  "conditions": [
    {
      "type": "raw-events",
      "aggregation": "count",
      "operator": ">",
      "value": 25,
      "event": {
        "kind": "erc20_transfer",
        "contract_addresses": ["0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"]
      },
      "filters": [{ "field": "to", "op": "eq", "value": "0xReceiver" }]
    }
  ]
}
```

### Indexed: Aggregate Event Burst

```json
{
  "scope": { "chains": [1], "markets": ["0xM"] },
  "window": { "duration": "6h" },
  "logic": "AND",
  "conditions": [
    {
      "type": "aggregate",
      "aggregation": "sum",
      "metric": "Morpho.Event.Supply.count",
      "operator": ">",
      "value": 25,
      "chain_id": 1,
      "market_id": "0xM"
    },
    {
      "type": "aggregate",
      "aggregation": "sum",
      "metric": "Morpho.Event.Supply.assets",
      "operator": ">",
      "value": 1000000,
      "chain_id": 1,
      "market_id": "0xM"
    }
  ]
}
```

### Raw: Swap Volume Across Supported Presets

```json
{
  "scope": { "chains": [1], "protocol": "all" },
  "window": { "duration": "30m" },
  "conditions": [
    {
      "type": "raw-events",
      "aggregation": "sum",
      "field": "amount0_abs",
      "operator": ">",
      "value": 500000,
      "event": {
        "kind": "swap",
        "protocols": ["uniswap_v2", "uniswap_v3"],
        "contract_addresses": ["0xPoolA", "0xPoolB"]
      },
      "filters": [{ "field": "recipient", "op": "eq", "value": "0xRecipient" }]
    }
  ]
}
```

### Raw: Custom Contract Event

```json
{
  "scope": { "chains": [1], "protocol": "all" },
  "window": { "duration": "30m" },
  "conditions": [
    {
      "type": "raw-events",
      "aggregation": "sum",
      "field": "amount0In",
      "operator": ">",
      "value": 500000,
      "event": {
        "kind": "contract_event",
        "contract_addresses": ["0xPool"],
        "signature": "Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)"
      }
    }
  ]
}
```

## Related Docs

- API payloads and routes: [API.md](../reference/api.md)
- Local setup: [GETTING_STARTED.md](../get-started/getting-started.md)
- Telegram delivery contract: [TELEGRAM_DELIVERY.md](../integrations/telegram-delivery.md)
- Internal runtime design: [ARCHITECTURE.md](../internals/architecture.md)
