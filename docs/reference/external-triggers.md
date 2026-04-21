# External Triggers

External triggers let your own system wake an Iruka signal immediately.

This is the right model when an upstream event already happened somewhere else and you want Iruka to handle the normal signal evaluation, repeat policy, history, and notification flow.

## How it works

```text
external event happens
  -> your system POSTs /api/v1/signals/:id/trigger
  -> Iruka queues the signal immediately
  -> worker evaluates the signal
  -> Iruka sends the normal notification payload
```

Your caller can be:

- your own indexer
- a webhook consumer
- a backend job
- a bot
- a test script

## When to use it

Use external triggers when:

- you already know exactly when something interesting happened
- polling would be wasteful or slow
- you want Iruka delivery and repeat-policy behavior on top of your own event source
- you want to attach event payload context to the outgoing notification

Use scheduled signals when Iruka should keep checking state on its own over time.

## Create an input-triggered signal

Create the signal through `POST /api/v1/signals` and set:

```json
{
  "name": "External event alert",
  "webhook_url": "https://example.com/iruka-alerts",
  "definition": {
    "trigger": { "type": "input" },
    "scope": { "chains": [1], "markets": ["0xMarket"] },
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

The signal still uses the normal condition engine. The only difference is how it wakes up.

## Fire the signal

```http
POST /api/v1/signals/:id/trigger
X-API-Key: iruka_...
Content-Type: application/json

{
  "idempotency_key": "chain1:0xTx:7",
  "payload": {
    "chain_id": 1,
    "transaction_hash": "0x...",
    "log_index": 7,
    "event": "Transfer",
    "from": "0x...",
    "to": "0x...",
    "value": "1000000"
  }
}
```

## Request fields

### `idempotency_key`

Optional.

If provided, Iruka uses it as the queue job id while that job exists. This helps avoid duplicate trigger submissions for the same upstream event.

### `payload`

Optional arbitrary JSON.

Iruka includes it in the outgoing notification as `trigger_input.payload`, so your downstream consumer can see the upstream event context.

## Notification shape

Example notification fields added by an external trigger:

```json
{
  "trigger_input": {
    "source": "input",
    "triggered_at": "2026-04-21T00:00:00.000Z",
    "idempotency_key": "chain1:0xTx:7",
    "payload": {
      "chain_id": 1,
      "transaction_hash": "0x...",
      "log_index": 7
    }
  }
}
```

## Operational notes

- external triggers still require normal API authentication
- the worker process must be running because the API queues a job and the worker delivers it
- scheduled signals are unaffected
- this feature is typically paired with your own premium or entitlement checks before exposing it to end users

## What to read next

- Read **Writing Signals** for the full signal payload shape
- Read **API Reference** for route behavior
- Read **Webapp Integration** if your frontend needs to create or fire these signals
