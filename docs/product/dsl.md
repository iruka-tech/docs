# Examples

This page gives concrete signal examples.

Read **Signal** first for the top-level shape.
Read **Definition** first for what belongs inside `definition`.

## Example 1: threshold

A threshold condition compares one evaluated value against a target.

### Condition object

```json
{
  "type": "threshold",
  "source": { "kind": "alias", "name": "ERC20.Position.balance" },
  "chain_id": 1,
  "contract_address": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "address": "0x1111111111111111111111111111111111111111",
  "operator": ">",
  "value": "1000000000"
}
```

### Full `definition` example

```json
{
  "window": { "duration": "1h" },
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

Rules:

- preferred input is `source`
- compatibility inputs `metric` and `state_ref` are still accepted
- `operator` must be one of `>`, `<`, `>=`, `<=`, `==`, `!=`
- `value` can be a number or numeric string

---

## Example 2: change

A change condition checks movement over time instead of only the current value.

Iruka evaluates this by reading the same state leaf twice:

- `current`
- `window_start`

That historical read is powered by archive RPC access.

### Condition object

```json
{
  "type": "change",
  "source": { "kind": "alias", "name": "ERC20.Position.balance" },
  "chain_id": 1,
  "contract_address": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "address": "0x1111111111111111111111111111111111111111",
  "direction": "decrease",
  "by": { "percent": 10 },
  "window": { "duration": "24h" }
}
```

### Full `definition` example

```json
{
  "window": { "duration": "24h" },
  "conditions": [
    {
      "type": "change",
      "source": { "kind": "alias", "name": "ERC20.Position.balance" },
      "chain_id": 1,
      "contract_address": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "address": "0x1111111111111111111111111111111111111111",
      "direction": "decrease",
      "by": { "percent": 10 },
      "window": { "duration": "24h" }
    }
  ]
}
```

### More change examples

#### ERC20 balance down 20% in 2h

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

Meaning: current token balance is down at least 20% versus 2 hours ago.

#### ERC20 balance up by an absolute amount in 30m

```json
{
  "type": "change",
  "source": { "kind": "alias", "name": "ERC20.Position.balance" },
  "chain_id": 1,
  "contract_address": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "address": "0x1111111111111111111111111111111111111111",
  "direction": "increase",
  "by": { "absolute": "500000000" },
  "window": { "duration": "30m" }
}
```

Meaning: current token balance is up by at least `500000000` base units versus 30 minutes ago.

#### ERC4626 shares down 10% in 24h

```json
{
  "type": "change",
  "source": { "kind": "alias", "name": "ERC4626.Position.shares" },
  "chain_id": 1,
  "contract_address": "0xVaultAddress",
  "address": "0xOwnerAddress",
  "direction": "decrease",
  "by": { "percent": 10 },
  "window": { "duration": "24h" }
}
```

Meaning: current ERC-4626 share balance is down at least 10% versus 24 hours ago.

---

## Example 3: grouped threshold

Use this when one signal should watch many addresses and alert if enough of them match.

```json
{
  "conditions": [
    {
      "type": "group_threshold",
      "source": { "kind": "alias", "name": "ERC20.Position.balance" },
      "chain_id": 1,
      "contract_address": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "operator": ">",
      "value": "1000000000",
      "group": {
        "operator": ">=",
        "value": 2
      }
    }
  ]
}
```

---

## Example 4: LP pool liquidity change

Use raw `state_ref` for LP pool reads. This example alerts only when both pools for the same pair are down at least 20% over the same window.

```json
{
  "window": { "duration": "1h" },
  "logic": "AND",
  "conditions": [
    {
      "type": "change",
      "state_ref": {
        "type": "state",
        "protocol": "uniswap_v3",
        "entity_type": "Pool",
        "field": "liquidity",
        "filters": [
          { "field": "chainId", "op": "eq", "value": 1 },
          { "field": "contractAddress", "op": "eq", "value": "0xUniswapV3Pool005" }
        ]
      },
      "direction": "decrease",
      "by": { "percent": 20 }
    },
    {
      "type": "change",
      "state_ref": {
        "type": "state",
        "protocol": "uniswap_v3",
        "entity_type": "Pool",
        "field": "liquidity",
        "filters": [
          { "field": "chainId", "op": "eq", "value": 1 },
          { "field": "contractAddress", "op": "eq", "value": "0xUniswapV3Pool030" }
        ]
      },
      "direction": "decrease",
      "by": { "percent": 20 }
    }
  ]
}
```

You can mix protocol families in the same signal. For example, one condition can read Uniswap v3 `Pool.liquidity` while another reads Uniswap v4 `PoolManager.liquidity` with a `poolId`.

## Example 5: raw event count

Use this when you want to count decoded events over a rolling window.

```json
{
  "window": { "duration": "1h" },
  "conditions": [
    {
      "type": "threshold",
      "source": {
        "kind": "raw_event",
        "aggregation": "count",
        "chain_id": 1,
        "event": {
          "kind": "erc20_transfer",
          "contract_addresses": ["0x3333333333333333333333333333333333333333"]
        }
      },
      "operator": ">",
      "value": 25
    }
  ]
}
```

## What to read next

- Read **Signal** for the top-level signal shape
- Read **Definition** for the structure inside `definition`
- Read **API Reference** for request and response details
