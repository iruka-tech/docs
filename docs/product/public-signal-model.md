# Signal

This page explains what a signal is and what the top-level signal object contains.

## What a signal is

A signal is a saved monitoring rule.

A signal has five top-level parts:

- `version`
- `name`
- `triggers`
- `definition`
- `delivery`
- `metadata`

## Top-level shape

```json
{
  "version": "1",
  "name": "Large USDC holder",
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
      "addresses": ["0x1111111111111111111111111111111111111111"]
    },
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
  },
  "delivery": [
    { "type": "webhook", "url": "https://antonmyown.dev/webhook/iruka" }
  ],
  "metadata": {
    "description": "Optional",
    "repeat_policy": { "mode": "cooldown" }
  }
}
```

## Top-level fields

### `version`

`version` is the schema version for the outer signal shape.

```json
{ "version": "1" }
```

### `name`

`name` is the human-readable signal name.

```json
{ "name": "Large supplier position" }
```

### `triggers`

`triggers` defines how the signal wakes up.

It is an array so one signal can have more than one wake-up path.

For now, keep `triggers` to **3 entries max**.

#### Schedule trigger

Use a schedule when Iruka should wake the signal on its own.

Relative schedule:

```json
{
  "type": "schedule",
  "schedule": {
    "kind": "interval",
    "interval_seconds": 300
  }
}
```

Absolute schedule:

```json
{
  "type": "schedule",
  "schedule": {
    "kind": "cron",
    "expression": "0 8 * * *"
  }
}
```

Cron expressions are interpreted in UTC.

#### External trigger

```json
{
  "type": "external"
}
```

This trigger type exists for cases where your own authenticated system should wake the signal.

> [!NOTE]
> `external` is not live yet.
> The schema supports this shape, but the public external input flow is not enabled yet.

#### Signal-to-signal trigger

```json
{
  "type": "iruka_signal",
  "id": "upstream-signal-id"
}
```

Use this when another Iruka signal should wake this signal.

### `definition`

`definition` is the query that Iruka evaluates.

> [!NOTE]
> The current `definition` examples still include `scope` because that is what the backend expects today.
> Treat `scope` as legacy and likely to be deprecated later.

It contains:

- `scope`
- `window`
- `logic`
- `conditions`

Read **Definition** next for the details.

### `delivery`

`delivery` defines where notifications go.

Current public delivery shapes:

```json
{
  "delivery": [
    { "type": "telegram" }
  ]
}
```

```json
{
  "delivery": [
    { "type": "webhook", "url": "https://antonmyown.dev/webhook/iruka" }
  ]
}
```

```json
{
  "delivery": [
    { "type": "telegram" },
    { "type": "webhook", "url": "https://antonmyown.dev/webhook/iruka" }
  ]
}
```

Use Telegram when Iruka should reach a linked chat.
Use webhook when Iruka should POST the alert payload to your own system.
The field stays an array because one signal can fan out to both.

### `metadata`

`metadata` holds non-core product/runtime fields.

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

## What to read next

- Read **Definition** for what belongs inside `definition`
- Read **Examples** for concrete condition examples
- Read **API Reference** for routes and payloads
