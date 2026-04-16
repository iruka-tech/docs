# Common Use Cases

This page translates Megabat features into practical integration patterns.

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

Example pattern:

- watch `Morpho.Position.supplyShares`
- alert when a wallet drops by 10% over 1 hour
- send to webhook for your alerting pipeline

## 2. Treasury watchlists across many wallets

**Goal:** track a set of addresses and alert when enough of them meet the same condition.

Good fit for:

- DAO treasury monitoring
- market-maker surveillance
- partner wallet programs

Typical building blocks:

- `group`
- multi-address `scope`
- webhook delivery

Example pattern:

- monitor 10 treasury wallets
- trigger when at least 3 of them fall below a balance threshold
- fan out the alert to Slack or PagerDuty from your webhook receiver

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

Example pattern:

- count ERC-20 transfers for a specific contract over 1 hour
- trigger when activity spikes above baseline thresholds

## 5. Swap activity monitoring

**Goal:** track DEX swap activity from decoded AMM events.

Good fit for:

- market activity dashboards
- liquidity monitoring
- operator alerting for bursts in trading activity

**Status today:** live through the public `raw-events` API.

Current scope:

- supported as `event.kind = "swap"`
- currently supports `uniswap_v2` and `uniswap_v3`
- exposes normalized fields such as `amount0_abs`, `amount1_abs`, and `swap_protocol`
- requires raw-events support to be enabled in the backend environment

Example pattern:

- sum `amount0_abs` for `swap` events over 30 minutes
- trigger when activity exceeds a threshold
- route alerts to Telegram for operators

## 6. Custom protocol event monitoring

**Goal:** watch an event that is not one of Megabat's prebuilt presets.

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

**Goal:** send clear alerts directly to humans, not just systems.

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

## How to choose quickly

Use this shortcut:

- want to watch a **value now** → use `threshold`
- want to watch a **value changing over time** → use `change`
- want to watch **many addresses together** → use `group`
- want **one combined value** → use `aggregate`
- want to watch **event activity** → use `raw-events`

## What to read next

- Read **Writing Signals** for concrete payloads
- Read **API Reference** for route behavior
- Read **Telegram Delivery** if you want operator-facing alerts
