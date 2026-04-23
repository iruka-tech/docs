# Common Use Cases

This page translates Iruka features into practical integration patterns.

If you already understand the signal model and want to know how teams actually use it, start here.

## 1. Whale monitoring

**Goal:** alert when a tracked wallet crosses a position threshold or changes materially.

Good fit for:

- treasury monitoring
- whale watch products
- risk desks
- portfolio dashboards

Typical building blocks:

- `threshold` for absolute size checks
- `change` for directional movement over time
- `group` if you track many wallets together
- Telegram delivery for human review

Example pattern:

- watch `Morpho.Position.supplyShares`
- alert when a wallet drops by 10% over 1 hour
- send to Telegram for operator review

## 2. Treasury watchlists across many wallets

**Goal:** track a set of addresses and alert when enough of them meet the same condition.

Good fit for:

- DAO treasury monitoring
- market-maker surveillance
- partner wallet programs

Typical building blocks:

- `group`
- multi-address `scope`
- scheduled triggers

Example pattern:

- monitor 10 treasury wallets
- trigger when at least 3 of them fall below a balance threshold
- wake every 5 minutes with a schedule trigger

## 3. Vault activity monitoring

**Goal:** detect deposit or withdrawal activity in tokenized vaults.

Good fit for:

- vault analytics
- deposit monitoring
- growth dashboards
- operator alerts for unusual activity

Typical building blocks:

- `raw-events` with `erc4626_deposit`
- `raw-events` with `erc4626_withdraw`
- `sum` aggregation over a rolling window

Example pattern:

- sum `assets` deposited into a vault over 30 minutes
- alert when inflow exceeds a threshold

## 4. Token activity alerts

**Goal:** detect bursts of token transfers or approval activity.

Good fit for:

- token operations teams
- token analytics products
- abuse or anomaly detection pipelines

Typical building blocks:

- `raw-events` with `erc20_transfer`
- `raw-events` with `erc20_approval`
- count or sum aggregations
- either scheduled or external triggers depending on who detects the upstream event first

Example pattern:

- count ERC-20 transfers for a specific contract over 1 hour
- trigger when activity spikes above baseline thresholds

## 5. Swap activity monitoring

**Goal:** track DEX swap activity from decoded AMM events.

Good fit for:

- market activity dashboards
- liquidity monitoring
- operator alerting for bursts in trading activity

Example pattern:

- sum `amount0_abs` for `swap` events over 30 minutes
- trigger when activity exceeds a threshold
- route alerts to Telegram for operators

## 6. Custom protocol event monitoring

**Goal:** watch an event that is not one of Iruka's prebuilt presets.

Good fit for:

- protocol-specific event tracking
- partner integrations
- fast experimentation before a richer preset exists

Typical building blocks:

- `raw-events`
- `event.kind = "contract_event"`
- ABI event signature
- contract address filters

Example pattern:

- monitor a custom `Transfer`, `Deposit`, or protocol-specific event
- count or aggregate decoded fields over a window

## 7. Human-in-the-loop operator alerts

**Goal:** send clear alerts directly to humans.

Good fit for:

- support teams
- protocol ops
- internal oncall workflows

Typical building blocks:

- managed Telegram delivery
- repeat policies
- history and explainability routes

Example pattern:

- send Telegram alerts for swap spikes or position drops
- use `Why` for quick context
- use snooze actions to suppress repeated noise during investigation

## 8. Chained signal workflows

**Goal:** let one Iruka signal wake another signal.

Good fit for:

- multi-stage alerting
- escalation flows
- lightweight orchestration inside Iruka

Typical building blocks:

- `iruka_signal` trigger
- Telegram delivery
- repeat policy on the downstream signal

Example pattern:

- one upstream signal fires on a broad condition
- a downstream signal wakes through `iruka_signal`
- the downstream signal applies a narrower follow-up definition

## How to choose quickly

Use this shortcut:

- want to watch a **value now** → use `threshold`
- want to watch a **value changing over time** → use `change`
- want to watch **many tracked addresses together** → use `group`
- want **one combined value across a scoped set** → use `aggregate`
- want to watch **event activity** → use `raw-events`

## What to read next

- Read **The `definition` Layer** for how the query part is structured
- Read **Writing Signals** for concrete condition payloads
- Read **API Reference** for route behavior
- Read **Telegram Delivery** if you want operator-facing alerts
