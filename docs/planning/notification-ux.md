# Notification UX Feature TODO

## Goal

Improve alert delivery UX without weakening signal evaluation fidelity.

Principles:

- Keep evaluation cadence separate from delivery policy.
- Make delivery outcomes machine-readable end-to-end.
- Make alerts explainable enough that users know why they fired.
- Keep Telegram actions simple enough to use from a single alert message.
- Update public/frontend-facing docs only after the full feature lands.

## Step Tracker

### 1. Delivery outcome semantics

- [x] Delivery webhook returns structured outcomes instead of relying on raw HTTP `200`
- [x] Worker notifier distinguishes `sent`, `no_user`, `rate_limited`, and `failed`
- [x] Managed `rate_limited` responses stop retry loops
- [x] Worker cooldown can advance for handled suppression states
- [ ] Decide whether `no_user` should keep the normal cooldown long-term or move to a shorter backoff

### 2. Live evaluation explanations

- [x] Expand live `ConditionResult` beyond `conditionIndex` + `triggered`
- [x] Capture left/right/operator details for simple conditions
- [x] Capture matched-address evidence for group conditions
- [x] Capture aggregate values and thresholds for aggregate conditions

### 3. Persistence and history

- [x] Persist explanation data in `signal_run_log`
- [x] Persist explanation data in notification history
- [x] Make signal history easy to inspect from API responses
- [ ] Decide whether explanation data also needs first-class queryable columns

### 4. Telegram alert controls

- [x] Add `Why` action for on-demand explanation details
- [x] Add one-tap snooze actions (`1h`, `1d`)
- [x] Define safe callback auth/ownership rules for bot actions
- [x] Decide whether action state lives in megabat DB, delivery DB, or both
  Action state lives in the delivery DB, keyed by `delivery.id` for callbacks and `signal_id + telegram_chat_id` for active snoozes.

### 5. Repeat-policy improvements

- [x] Add explicit repeat policy model beyond raw cooldown
- [x] Support post-first-alert snooze policy
- [x] Support `until_resolved` policy
- [x] Define how resolved state is detected and logged

## Finalization

- [x] Update API/docs for frontend handoff after steps 1-5 are complete
- [x] Document Telegram UX flows and payload changes
- [x] Document migration requirements for delivery status changes
