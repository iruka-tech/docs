# Megabat Documentation

This site is the canonical documentation home for Megabat. Content is organized around canonical owners: when a topic appears in multiple places, one page owns the details and the others should link to it.

## Start Here

| Doc | Owns | Use it for |
| --- | --- | --- |
| [GETTING_STARTED.md](get-started/getting-started.md) | Local setup | Boot the stack locally, log in, mint an API key, and verify the app |
| [DEPLOYMENT.md](get-started/deployment.md) | Production setup | Docker and hosted deployment guidance |
| [PUBLIC_SIGNAL_MODEL.md](product/public-signal-model.md) | Public signal capabilities | First-principles explanation of what the signal API can and cannot express today |
| [DSL.md](product/dsl.md) | Signal definition language | Scope, windows, reference families, condition inputs, metrics, and canonical examples |
| [API.md](reference/api.md) | HTTP surface | Endpoints, request shapes, webhook payloads, and simulation routes |

## Security And Integration

| Doc | Owns | Use it for |
| --- | --- | --- |
| [AUTH.md](reference/auth.md) | Auth model | SIWE, sessions, API keys, register gate, webhook signature model |
| [TELEGRAM_DELIVERY.md](integrations/telegram-delivery.md) | Cross-service Telegram contract | `app_user_id`, webhook target, token-link flow, internal status routes |
| [WEBAPP_INTEGRATION.md](integrations/webapp-integration.md) | Backend integration contract | web app as megabat console, session flow, thin-BFF decisions |

## Internals

| Doc | Owns | Use it for |
| --- | --- | --- |
| [ARCHITECTURE.md](internals/architecture.md) | System design | Compiler/evaluator flow, indexing boundary vs RPC, and service responsibilities |
| [SOURCES.md](internals/sources.md) | Source-family model | Current providers, capability gating, and the future extension path for new sources |
| [INTERNAL_SIGNAL_ENGINE.md](internals/internal-signal-engine.md) | Signal engine internals | Refs, bindings, plans, AST compilation, and runtime evaluation flow |
| [DESIGN_DECISIONS.md](internals/design-decisions.md) | ADR-style reasoning | Why the current design looks the way it does |
| [ISSUE_NO_TIME_TRAVEL.md](internals/no-time-travel.md) | Specific data-source constraint | Why state reads use RPC while events use Envio |

## Planning And Status

| Doc | Owns | Use it for |
| --- | --- | --- |
| [ROADMAP.md](planning/roadmap.md) | Product direction | Near-term and later priorities |
| [../TODO.md](planning/implementation-status.md) | Implementation status | Concrete work items in the repo |

## Package-Specific

| Doc | Owns | Use it for |
| --- | --- | --- |
| [../packages/delivery/README.md](packages/delivery.md) | Delivery package details | Package-local commands and delivery-specific runtime notes |

## Ownership Rules

- Local setup belongs in [GETTING_STARTED.md](get-started/getting-started.md).
- Production setup belongs in [DEPLOYMENT.md](get-started/deployment.md).
- Public product capabilities belong in [PUBLIC_SIGNAL_MODEL.md](product/public-signal-model.md).
- DSL shape, reference families, and examples belong in [DSL.md](product/dsl.md).
- Source-family capability rules and extension design belong in [SOURCES.md](internals/sources.md).
- Endpoint details belong in [API.md](reference/api.md).
- Internal compiler/planner/binder/evaluator explanations belong in [INTERNAL_SIGNAL_ENGINE.md](internals/internal-signal-engine.md).
- Auth and delivery docs describe contracts and routing, not setup steps.

