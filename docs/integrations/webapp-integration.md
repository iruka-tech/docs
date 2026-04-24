# Webapp Integration

This page is for teams building a frontend on top of Iruka.

The key idea is:

- Iruka owns signal evaluation, auth, and delivery behavior
- your web app owns the user experience

That keeps the backend consistent while letting you build your own product surface.

## Recommended architecture

Use this split:

- **Iruka API** — signals, API keys, history, and delivery integration
- **Your web app** — dashboards, forms, signal builders, account UX, and team workflows

Your product talks to Iruka through `https://api.hiruka.tech` with an API key generated from the Iruka console on `iruka.tech`.

## API access flow

Recommended sequence:

1. sign in on `iruka.tech`
2. open the Iruka console
3. generate an API key
4. call protected routes with `X-API-Key`

## Typical frontend responsibilities

A frontend on top of Iruka usually handles:

- listing signals
- creating and editing signal envelopes
- editing the `definition` object
- showing evaluation history
- showing notification history
- Telegram link UX
- previews or simulation workflows
- future external-trigger controls when your product later lets users connect upstream event sources

## Typical backend responsibilities inside Iruka

Iruka should remain the source of truth for:

- API key ownership
- signal ownership
- signal evaluation semantics
- trigger execution semantics
- repeat policy behavior
- Telegram delivery linkage and message dispatch

## When a thin BFF still helps

A thin BFF can still be useful for:

- request composition
- caching
- UI-specific response shaping
- billing or entitlement checks
- hiding private service-to-service calls

The important principle is that the BFF should not redefine the signal engine contract.

## Telegram integration from a web app

For a web app, prefer the Iruka-native Telegram endpoints:

- `GET /api/v1/me/integrations/telegram`
- `POST /api/v1/me/integrations/telegram/link`

This keeps Telegram account linking inside the same Iruka account model used for signals.

## Signal envelope in product UX

A frontend should treat a signal as two editable layers:

- outer envelope
- `definition`

Example outer envelope:

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
    "scope": { "chains": [1], "protocol": "morpho" },
    "window": { "duration": "1h" },
    "conditions": []
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

This gives you a cleaner builder split:

- envelope editor
- definition editor
- condition editor

## What to read next

- Read **API Reference** for route-level behavior
- Read **Definition** for the query part of the signal
- Read **Telegram Delivery** if you want first-party operator notifications
