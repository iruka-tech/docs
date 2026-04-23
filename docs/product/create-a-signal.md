# Create a Signal

This page explains the **top-level signal schema**.

Read this page first if you want to understand the outer shape of a signal request.

This page is only about the highest-level fields.

If you want to understand what goes inside `definition`, read **The `definition` Object** next.

## A signal has two layers

### 1. Outer signal schema

The top-level signal owns:

- `version`
- `name`
- `triggers`
- `definition`
- `delivery`
- `metadata`

### 2. `definition`

`definition` is the query layer.

It owns:

- `scope`
- `window`
- `logic`
- `conditions`

That split is the main mental model.

## Full top-level shape

```json
{
  "version": "1",
  "name": "Large supplier position",
  "triggers": [
    {
      "type": "schedule",
      "schedule": {
        "kind": "interval",
        "interval_seconds": 300
      }
    }
  ],
  "definition": {
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
  },
  "delivery": [
    { "type": "telegram" }
  ],
  "metadata": {
    "description": "Optional",
    "repeat_policy": { "mode": "cooldown" }
  }
}
```

## Top-level fields

## `version`

`version` is the schema version for the outer signal shape.

Current example:

```json
{ "version": "1" }
```

## `name`

`name` is the human-readable signal name.

Example:

```json
{ "name": "Large supplier position" }
```

## `triggers`

`triggers` defines how the signal wakes up.

It is an array so one signal can wake up in more than one way.

For now, cap `triggers` at **3 entries max**.

### Relative schedule

```json
{
  "type": "schedule",
  "schedule": {
    "kind": "interval",
    "interval_seconds": 300
  }
}
```

### Absolute schedule

```json
{
  "type": "schedule",
  "schedule": {
    "kind": "cron",
    "expression": "0 8 * * *"
  }
}
```

Absolute schedule expressions should be interpreted in UTC by default.

### External trigger

```json
{
  "type": "external"
}
```

Use this when your own authenticated caller should wake the signal.

### Signal-to-signal trigger

```json
{
  "type": "iruka_signal",
  "id": "upstream-signal-id"
}
```

Use this when another Iruka signal should wake this signal.

## `definition`

`definition` is the query that Iruka evaluates.

At the top level, you only need to know that this field contains the monitoring logic.

```json
{
  "definition": {
    "scope": { "chains": [1], "protocol": "morpho" },
    "window": { "duration": "1h" },
    "logic": "AND",
    "conditions": []
  }
}
```

Read **The `definition` Object** next for the internal structure.

## `delivery`

`delivery` defines where notifications go.

Current public delivery shape:

```json
{
  "delivery": [
    { "type": "telegram" }
  ]
}
```

Telegram is the only public delivery target documented here today.

## `metadata`

`metadata` holds non-core product/runtime fields.

Current metadata fields:

```json
{
  "metadata": {
    "description": "Optional",
    "repeat_policy": {
      "mode": "cooldown"
    }
  }
}
```

Supported repeat policies:

- `cooldown`
- `post_first_alert_snooze`
- `until_resolved`

## Reading order

If you are learning Iruka step by step:

1. **Create a Signal** — top-level signal fields
2. **The `definition` Object** — what `definition` contains
3. **Writing Signals** — condition-by-condition examples
4. **API Reference** — routes and request/response behavior
