# Definition

This page explains what goes inside `definition`.

Read **Signal** first if you want the full top-level signal shape.

## What `definition` contains

`definition` is the query Iruka evaluates.

It contains:

- `window`
- `logic`
- `conditions`

## Supported protocols today

The first thing to know is what kinds of signals you can actually build today.

Current supported protocol families in the public docs are:

- `Morpho`
- `ERC4626`
- `ERC20`

Current protocol/entity shapes:

- `Morpho.Position`
- `Morpho.Market`
- `Morpho.Event`
- `Morpho.Flow`
- `ERC4626.Position`
- `ERC20.Position`

Use those through `source.kind = "alias"` names such as:

- `Morpho.Position.supplyShares`
- `Morpho.Market.totalBorrowAssets`
- `ERC4626.Position.shares`
- `ERC20.Position.balance`

> [!NOTE]
> We plan to generalize this further over time so signals can target broader function- and event-level inputs.
> For now, the clearest public starting point is the current alias-based protocol set above.

## How to think about entities

Each protocol family has its own entity model.

Today:

- **Morpho** uses `Position`, `Market`, `Event`, and `Flow`
- **ERC4626** uses `Position`
- **ERC20** uses `Position`

That means the required condition inputs differ by protocol.

For example:

- **Morpho.Position** usually needs a market target plus a user address
- **ERC4626.Position** needs a vault contract plus an owner address
- **ERC20.Position** needs a token contract plus a holder address

ERC20 is the simplest example to read first because there is no market-style `entity_id` in the public condition shape. You mainly provide:

- `contract_address` — which token
- `address` — which holder

## `definition` example

```json
{
  "window": { "duration": "1h" },
  "logic": "AND",
  "conditions": [
    {
      "type": "threshold",
      "source": { "kind": "alias", "name": "ERC20.Position.balance" },
      "chain_id": 1,
      "contract_address": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "address": "0x1111111111111111111111111111111111111111",
      "operator": ">",
      "value": "1000000000"
    }
  ]
}
```

## `window`

`window` defines the default time range for the whole definition.

```json
{
  "window": { "duration": "1h" }
}
```

Some condition types can override `window` locally.

For `change` conditions, this window is especially important: Iruka reads the current value and compares it to the value at the start of the window.

That means a definition window of `2h` turns a change condition into "current value vs 2 hours ago".

## Time-travel state reads

`change` conditions for state-based sources are powered by archive RPC access.

In practice, Iruka does two reads for the same state leaf:

- `current`
- `window_start`

For example, an ERC-20 balance change signal reads:

- current `balanceOf(address)` now
- historical `balanceOf(address)` at the start of the window

This is what lets you express rules like:

- notify me when this ERC-20 balance is down 20% in the last 2 hours
- notify me when this ERC-4626 share balance increased by 10% in the last day

Today, `change` is the main public condition type that depends on archive RPC-backed historical state reads.

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

The two condition families most users should learn first are:

- `threshold` — compare one evaluated value to a target now
- `change` — compare the current value to the value at `window_start`

Example `change` condition:

```json
{
  "type": "change",
  "source": { "kind": "alias", "name": "ERC20.Position.balance" },
  "chain_id": 1,
  "contract_address": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "address": "0x1111111111111111111111111111111111111111",
  "direction": "decrease",
  "by": { "percent": 20 },
  "window": { "duration": "2h" }
}
```

That means: current ERC-20 balance is down at least 20% versus 2 hours ago.

A threshold example belongs here, not at the top level.

```json
{
  "conditions": [
    {
      "type": "threshold",
      "source": { "kind": "alias", "name": "ERC20.Position.balance" },
      "chain_id": 1,
      "contract_address": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "address": "0x1111111111111111111111111111111111111111",
      "operator": ">",
      "value": "1000000000"
    }
  ]
}
```

## What to read next

- Read **Examples** for complete condition examples
- Read **API Reference** for request and response details
