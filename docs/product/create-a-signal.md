# Create a Signal

This page explains the top-level signal fields.

Read this page after **Signal Model**.

This page is about the outer signal object: the fields you send when you create a signal.

If you want to understand what goes inside `definition`, read **The `definition` Object** next.

## Top-level fields

A signal request includes:

- `version`
- `name`
- `triggers`
- `definition`
- `delivery`
- `metadata`

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

1. **Signal Model** — simple big picture
2. **Create a Signal** — top-level signal fields
3. **The `definition` Object** — what `definition` contains
4. **Writing Signals** — condition-by-condition examples
5. **API Reference** — routes and request behavior
