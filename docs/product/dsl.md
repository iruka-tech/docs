# Writing Signals

This page is a **condition reference**.

It explains the objects that belong inside:

```json
{
  "definition": {
    "conditions": [
      { "type": "..." }
    ]
  }
}
```

If you want the full signal shape first, read **API Reference**.
If you want the structure of `definition` first, read **The `definition` Object**.

## Before the condition examples

A full signal has two layers:

- outer envelope: `version`, `name`, `triggers`, `delivery`, `metadata`
- query layer: `definition`

This page covers only the condition objects that go inside:

```json
{
  "definition": {
    "scope": { "chains": [1], "protocol": "all" },
    "window": { "duration": "1h" },
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
}
```

## Condition types

Iruka currently supports these public condition types:

- `threshold`
- `change`
- `group`
- `aggregate`
- `raw-events`

---

## 1. `threshold`

### What it means

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

### Where it lives

```json
{
  "definition": {
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
}
```

### Rules

- preferred input is `source`
- compatibility inputs `metric` and `state_ref` are still accepted
- `operator` must be one of `>`, `<`, `>=`, `<=`, `==`, `!=`
- `value` can be a number or numeric string

---

## 2. `change`

### What it means

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

### Where it lives

```json
{
  "definition": {
    "conditions": [
      {
        "type": "change",
        "source": { "kind": "alias", "name": "Morpho.Position.supplyShares" },
        "direction": "decrease",
        "by": { "percent": 10 },
        "window": { "duration": "24h" },
        "chain_id": 1,
        "market_id": "0xMarket",
        "address": "0xUser"
      }
    ]
  }
}
```

### Rules

Supported directions:

- `increase`
- `decrease`
- `any`

`by` can be:

- `{ "percent": 10 }`
- `{ "absolute": "1000000" }`

---

## 3. `group`

### What it means

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

### Where it lives

```json
{
  "definition": {
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
}
```

### Rules

- set exactly one of `addresses` or `tracked`
- generic tracked groups are currently limited to event-style inner sources
- response/history payloads may include `matchedTargets` for tracked groups

---

## 4. `aggregate`

### What it means

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

### Where it lives

```json
{
  "definition": {
    "scope": {
      "chains": [1],
      "protocol": "morpho",
      "addresses": ["0x1", "0x2"]
    },
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
}
```

### Rules

Supported aggregations:

- `sum`
- `avg`
- `min`
- `max`
- `count`

What gets aggregated depends on the surrounding signal scope and source family.

---

## 5. `raw-events`

### What it means

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

### Where it lives

```json
{
  "definition": {
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
        }
      }
    ]
  }
}
```

### Rules

This is the right choice when event activity is the source of truth.

---

## Full `definition` example

```json
{
  "scope": {
    "chains": [1],
    "protocol": "all"
  },
  "window": { "duration": "1h" },
  "logic": "AND",
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
      "value": 100
    }
  ]
}
```

## What this page does not cover

This page does not define:

- `version`
- `name`
- `triggers`
- `delivery`
- `metadata`

Those belong to the outer signal envelope.

## What to read next

- Read **The `definition` Object** for `scope`, `window`, `logic`, and `conditions`
- Read **API Reference** for the full create-signal request shape
- Read **External Triggers** for externally triggered signals
