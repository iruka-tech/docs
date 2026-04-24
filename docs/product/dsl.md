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

## Example 4: raw event count

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
