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
- `uniswap_v2`
- `uniswap_v3`
- `uniswap_v4`
- `curve`

Current alias-backed protocol/entity shapes:

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

LP pool reads are lower-level raw `state_ref` inputs, not aliases:

| Protocol | Entity | Field | Required filters |
| --- | --- | --- | --- |
| `uniswap_v2` | `Pool` | `reserve0`, `reserve1` | `chainId`, `contractAddress` |
| `uniswap_v3` | `Pool` | `liquidity`, `sqrtPriceX96` | `chainId`, `contractAddress` |
| `uniswap_v4` | `PoolManager` | `liquidity` | `chainId`, `contractAddress`, `poolId` |
| `curve` | `Pool` | `balance` | `chainId`, `contractAddress`, `tokenIndex` |
| `curve` | `Pool` | `dy` | `chainId`, `contractAddress`, `i`, `j`, `dx` |

These LP fields return raw contract integers/liquidity/quote units. They are not USD liquidity, token-decimal-normalized TVL, or derived pool math. Curve `Pool.balance` uses `balances(uint256 index)`, and Curve `Pool.dy` uses stable-style `get_dy(int128 i, int128 j, uint256 dx)`. Uniswap v3 `sqrtPriceX96` is the raw `slot0()` price field and can be used for pool-price thresholds after converting the human price into Uniswap's fixed-point format.

## How to think about entities

Each protocol family has its own entity model.

Today:

- **Morpho** uses `Position`, `Market`, `Event`, and `Flow`
- **ERC4626** uses `Position`
- **ERC20** uses `Position`
- **Uniswap v2/v3** use `Pool`
- **Uniswap v4** uses `PoolManager`
- **Curve** uses `Pool`

That means the required condition inputs differ by protocol.

For example:

- **Morpho.Position** usually needs a market target plus a user address
- **ERC4626.Position** needs a vault contract plus an owner address
- **ERC20.Position** needs a token contract plus a holder address
- **Uniswap v2/v3 Pool** reads need a pool contract
- **Uniswap v4 PoolManager** reads need the PoolManager contract plus a `poolId`
- **Curve Pool** balance reads need the pool contract plus a `tokenIndex`; quote reads need `i`, `j`, and raw `dx`

ERC20 is the simplest example to read first because there is no market-style `entity_id` in the public condition shape. You mainly provide:

- `token` — which token contract
- `account` — which holder account

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
      "token": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "account": "0x1111111111111111111111111111111111111111",
      "operator": ">",
      "value": "1000000000"
    }
  ]
}
```

## Raw LP pool state refs

Use `state_ref` when the source needs protocol-specific filters that alias shorthand cannot carry.

Example: alert when a Uniswap v3 pool's raw `liquidity()` value drops 20% over one hour.

```json
{
  "type": "change",
  "state_ref": {
    "type": "state",
    "protocol": "uniswap_v3",
    "entity_type": "Pool",
    "field": "liquidity",
    "filters": [
      { "field": "chainId", "op": "eq", "value": 1 },
      { "field": "contractAddress", "op": "eq", "value": "0xUniswapV3Pool" }
    ]
  },
  "direction": "decrease",
  "by": { "percent": 20 },
  "window": { "duration": "1h" }
}
```

For Uniswap v4, the contract address is the PoolManager and the pool is selected by `poolId`. For Curve, select the reserve with `tokenIndex`.

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

- current `balanceOf(account)` now
- historical `balanceOf(account)` at the start of the window

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
  "token": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "account": "0x1111111111111111111111111111111111111111",
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
      "token": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "account": "0x1111111111111111111111111111111111111111",
      "operator": ">",
      "value": "1000000000"
    }
  ]
}
```

## What to read next

- Read **Examples** for complete condition examples
- Read **API Reference** for request and response details
