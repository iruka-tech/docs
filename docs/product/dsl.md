# Examples

This page gives concrete signal examples.

Read **Signal Model** first for the big picture.
Read **Create a Signal** for the top-level schema.
Read **The `definition` Object** for what belongs inside `definition`.

This page focuses on practical examples.

## Example 1: threshold

A threshold condition compares one evaluated value against a target.

### Condition object

```json
{
  "type": "threshold",
  "source": { "kind": "alias", "name": "Morpho.Position.supplyShares" },
  "chain_id": 1,
  "market_id": "0x2222222222222222222222222222222222222222222222222222222222222222",
  "address": "0x1111111111111111111111111111111111111111",
  "operator": ">",
  "value": "1000000000000000000"
}
```

### Full `definition` example

```json
{
  "scope": {
    "chains": [1],
    "protocol": "morpho",
    "addresses": ["0x1111111111111111111111111111111111111111"]
  },
  "window": { "duration": "1h" },
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
  "source": { "kind": "alias", "name": "Morpho.Position.supplyShares" },
  "chain_id": 1,
  "market_id": "0x2222222222222222222222222222222222222222222222222222222222222222",
  "address": "0x1111111111111111111111111111111111111111",
  "direction": "decrease",
  "by": { "percent": 10 },
  "window": { "duration": "24h" }
}
```

### Full `definition` example

```json
{
  "scope": {
    "chains": [1],
    "protocol": "morpho",
    "addresses": ["0x1111111111111111111111111111111111111111"]
  },
  "window": { "duration": "1h" },
  "conditions": [
    {
      "type": "change",
      "source": { "kind": "alias", "name": "Morpho.Position.supplyShares" },
      "chain_id": 1,
      "market_id": "0x2222222222222222222222222222222222222222222222222222222222222222",
      "address": "0x1111111111111111111111111111111111111111",
      "direction": "decrease",
      "by": { "percent": 10 },
      "window": { "duration": "24h" }
    }
  ]
}
```

Supported directions:

- `increase`
- `decrease`
- `any`

`by` can be:

- `{ "percent": 10 }`
- `{ "absolute": "1000000" }`

---

## Example 3: group

A group condition applies the same inner test across many tracked targets and checks how many matched.

### Condition object

Address-group form:

```json
{
  "type": "group",
  "addresses": [
    "0x1111111111111111111111111111111111111111",
    "0x2222222222222222222222222222222222222222",
    "0x3333333333333333333333333333333333333333"
  ],
  "logic": "AND",
  "requirement": {
    "count": 2,
    "of": 3
  },
  "conditions": [
    {
      "type": "threshold",
      "metric": "Morpho.Position.supplyShares",
      "chain_id": 1,
      "market_id": "0x4444444444444444444444444444444444444444444444444444444444444444",
      "operator": ">",
      "value": "1000000000000000000"
    }
  ]
}
```

Tracked-value form:

```json
{
  "type": "group",
  "tracked": {
    "field": "oracleId",
    "values": [101, 202, 303]
  },
  "logic": "AND",
  "requirement": {
    "count": 2,
    "of": 3
  },
  "conditions": [
    {
      "type": "threshold",
      "source": { "kind": "alias", "name": "Morpho.Event.Supply.assets" },
      "chain_id": 1,
      "market_id": "0x4444444444444444444444444444444444444444444444444444444444444444",
      "operator": ">",
      "value": 100
    }
  ]
}
```

### Full `definition` example

```json
{
  "scope": {
    "chains": [1],
    "protocol": "all"
  },
  "window": { "duration": "1h" },
  "conditions": [
    {
      "type": "group",
      "addresses": ["0x1", "0x2", "0x3"],
      "logic": "AND",
      "requirement": { "count": 2, "of": 3 },
      "conditions": [
        {
          "type": "threshold",
          "metric": "Morpho.Position.supplyShares",
          "chain_id": 1,
          "market_id": "0xMarket",
          "operator": ">",
          "value": "1000000000000000000"
        }
      ]
    }
  ]
}
```

Rules:

- set exactly one of `addresses` or `tracked`
- generic tracked groups are currently limited to event-style inner sources
- response/history payloads may include `matchedTargets` for tracked groups

---

## Example 4: aggregate

An aggregate condition reduces a scoped set to one combined number.

### Condition object

```json
{
  "type": "aggregate",
  "aggregation": "sum",
  "metric": "Morpho.Position.supplyShares",
  "chain_id": 1,
  "market_id": "0x2222222222222222222222222222222222222222222222222222222222222222",
  "operator": ">",
  "value": "5000000000000000000"
}
```

### Full `definition` example

```json
{
  "scope": {
    "chains": [1],
    "protocol": "morpho",
    "addresses": ["0x1", "0x2"]
  },
  "window": { "duration": "1h" },
  "conditions": [
    {
      "type": "aggregate",
      "aggregation": "sum",
      "metric": "Morpho.Position.supplyShares",
      "chain_id": 1,
      "market_id": "0xMarket",
      "operator": ">",
      "value": "5000000000000000000"
    }
  ]
}
```

Supported aggregations:

- `sum`
- `avg`
- `min`
- `max`
- `count`

What gets aggregated depends on the surrounding signal scope and source family.

---

## Example 5: raw-events

A raw-events condition scans decoded events over a rolling window.

### Condition object

```json
{
  "type": "raw-events",
  "aggregation": "sum",
  "field": "value",
  "operator": ">",
  "value": 1000000000000000000000,
  "chain_id": 1,
  "window": { "duration": "1h" },
  "event": {
    "kind": "erc20_transfer",
    "contract_addresses": ["0x3333333333333333333333333333333333333333"]
  },
  "filters": [
    { "field": "from", "op": "eq", "value": "0x1111111111111111111111111111111111111111" }
  ]
}
```

### Full `definition` example

```json
{
  "scope": {
    "chains": [1],
    "protocol": "all"
  },
  "window": { "duration": "1h" },
  "conditions": [
    {
      "type": "raw-events",
      "aggregation": "sum",
      "field": "value",
      "operator": ">",
      "value": 1000000000000000000000,
      "chain_id": 1,
      "window": { "duration": "1h" },
      "event": {
        "kind": "erc20_transfer",
        "contract_addresses": ["0x3333333333333333333333333333333333333333"]
      },
      "filters": [
        { "field": "from", "op": "eq", "value": "0x1111111111111111111111111111111111111111" }
      ]
    }
  ]
}
```

This is the right choice when event activity is the source of truth.

## What to read next

- Read **Create a Signal** for the top-level schema
- Read **The `definition` Object** for the structure inside `definition`
- Read **API Reference** for routes and request behavior
