# Signal Model

This page gives the big picture.

Read this first if you want the simplest mental model for how an Iruka signal is structured.

## Core idea

Iruka evaluates saved **signals**.

A signal is composed of:

- basic info like `version` and `name`
- rules for how it should be triggered
- a `definition` query that describes what to evaluate
- delivery settings
- metadata like description and repeat policy

## Signal shape at a glance

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

## Trigger modes

A signal can have one or more trigger entries.

For now, cap `triggers` at **3 entries max**.

### Schedule

Use `schedule` when Iruka should wake the signal on its own.

Relative schedule example:

```json
{
  "type": "schedule",
  "schedule": {
    "kind": "interval",
    "interval_seconds": 300
  }
}
```

Absolute schedule example:

```json
{
  "type": "schedule",
  "schedule": {
    "kind": "cron",
    "expression": "0 8 * * *"
  }
}
```

Absolute schedules should be interpreted in UTC by default.

### External

Use `external` when your own authenticated caller should wake the signal through `POST /api/v1/signals/:id/trigger`.

```json
{
  "type": "external"
}
```

### `iruka_signal`

Use `iruka_signal` when another Iruka signal should wake this signal.

```json
{
  "type": "iruka_signal",
  "id": "upstream-signal-id"
}
```

If a user already knows another signal id, they can add this trigger. When the linked signal fires, it should wake this signal too.

## Delivery

Delivery is separate from trigger semantics.

Current public delivery model:

```json
{
  "delivery": [
    { "type": "telegram" }
  ]
}
```

Telegram is the only public delivery target documented here today.

## Metadata

Current metadata fields:

- `description`
- `repeat_policy`

Example:

```json
{
  "metadata": {
    "description": "Optional",
    "repeat_policy": {
      "mode": "post_first_alert_snooze",
      "snooze_minutes": 1440
    }
  }
}
```

## `definition`

`definition` is the query part of the signal.

It contains:

- `scope`
- `window`
- `logic`
- `conditions`

Read **Create a Signal** next for the top-level fields in more detail.
Then read **The `definition` Object** for the internals of `definition`.
