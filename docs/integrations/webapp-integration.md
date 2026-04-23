# Webapp Integration

This page is for teams building a frontend on top of Iruka.

The key idea is:

- Iruka owns signal evaluation, auth, and delivery behavior
- your web app owns the user experience

That keeps the backend consistent while letting you build your own product surface.

## Recommended architecture

Use this split:

- **Iruka backend** — signals, auth, sessions, API keys, history, delivery integration
- **Your web app** — dashboards, forms, signal builders, account UX, team workflows

Your frontend can call Iruka:

- directly from the browser using SIWE-backed sessions
- through a thin backend-for-frontend if you need composition or extra policy checks

## Browser auth flow

Recommended sequence:

1. call `POST /api/v1/auth/siwe/nonce`
2. sign the SIWE message in the wallet
3. call `POST /api/v1/auth/siwe/verify`
4. let Iruka own the session cookie
5. call protected Iruka routes from the web app

## API-key flow

For server-side or machine integrations:

1. call `POST /api/v1/auth/register`
2. store the returned `api_key`
3. call protected routes with `X-API-Key`

## Typical frontend responsibilities

A frontend on top of Iruka usually handles:

- listing signals
- creating and editing signal envelopes
- editing the `definition` object
- showing evaluation history
- showing notification history
- Telegram link UX
- previews or simulation workflows
- external-trigger controls when your product lets users connect upstream event sources

## Typical backend responsibilities inside Iruka

Iruka should remain the source of truth for:

- signal ownership
- auth sessions
- API key ownership
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

- Read **Auth** for SIWE and API-key details
- Read **API Reference** for route-level behavior
- Read **The `definition` Layer** for the query part of the signal
- Read **Telegram Delivery** if you want first-party operator notifications
