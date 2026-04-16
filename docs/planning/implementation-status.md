# megabat TODO

## Active Feature Tracks

### Notification UX Overhaul (2026-04-14)

Detailed tracker: [TODO.notification-ux.md](notification-ux.md)

- [x] 1. Fix delivery outcome semantics
  - [x] Delivery webhook returns explicit `delivery_status`
  - [x] Worker distinguishes `sent`, `no_user`, `rate_limited`, and `failed`
  - [x] Managed `rate_limited` outcomes stop retry loops but still advance cooldown
- [x] 2. Capture "why matched" explanations during live evaluation
- [x] 3. Persist explanations in signal history and notification payloads
- [x] 4. Add Telegram `Why` and snooze controls
- [x] 5. Add repeat-policy improvements (`until_resolved` / post-first-alert snooze)
- [x] Final docs + frontend handoff after steps 1-5 land

## Open Platform Backlog

- [ ] Integration test: real RPC + Envio
- [ ] Smart query batching by scope
- [ ] Monarch FE integration
- [ ] Prometheus metrics (evaluation times, success rates)
- [ ] Comprehensive integration tests

## Deferred

- [ ] x402 payments for API key issuance
  - [ ] Gate `/auth/register` behind x402 payment
  - [ ] Store payment receipt metadata for audit
  - [ ] Keep API key flow as the primary auth mechanism

## Completed Milestones

- [x] Hybrid Envio + RPC historical state integration
- [x] DSL hardening and compiler unification
- [x] Core signal CRUD, simulation, and worker infrastructure
- [x] Native browser auth, API keys, and Telegram integration routes
- [x] HyperSync raw-event support
- [x] Railway deployment readiness and logging/validation polish
