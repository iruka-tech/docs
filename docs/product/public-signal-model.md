# What You Can Build

This page explains Iruka from an integrator's point of view.

The goal is simple: understand what Iruka can evaluate today, what kinds of alerts it is good at, and where the boundaries are.

## Core idea

Iruka evaluates saved **signals**.

A signal is a rule that says:

- what to watch
- how the signal should wake up
- over what time window
- which conditions must be met
- where alerts should be delivered

Iruka then evaluates that rule and emits notifications when it matches.

## The five condition types

Iruka supports five condition types in the public API today.

### 1. Threshold

Use this when you want to compare one value against a fixed threshold.

Examples:

- a Morpho position has more than 1 ETH worth of supply shares
- a vault balance is below a minimum threshold
- more than 100 matching events happened in the last hour

A threshold condition can use:

- `source` — the preferred unified numeric-block shape
- `metric` — compatibility sugar for an alias Iruka already understands
- `state_ref` — compatibility sugar for an explicit state source

### 2. Change

Use this when you care about movement over time rather than the current point-in-time value.

Examples:

- a position decreased by 10% over 1 hour
- a balance increased by a fixed absolute amount over 1 day

Change conditions work with the same inputs:

- `source`
- `metric`
- `state_ref`

### 3. Group

Use this when the same rule should be checked across many tracked targets, and you care about how many of them match.

In the public API today, `group` supports two target shapes:

- legacy `addresses`
- `tracked: { field, values }` for event-style grouping over non-address identifiers

Examples:

- at least 3 of 5 wallets received a token in the last 30 minutes
- 2 of 4 tracked addresses now hold less than a minimum position size
- at least 2 of 3 oracle IDs crossed an event threshold

### 4. Aggregate

Use this when you want one combined value across a scoped set rather than one result per entity.

That scoped set depends on the metric:

- for position metrics, aggregation is typically across `scope.addresses`
- for market metrics, aggregation can be across `scope.markets`
- for event metrics, aggregation runs across the matching event set

Supported aggregations:

- `sum`
- `avg`
- `min`
- `max`
- `count`

Examples:

- total exposure across many addresses exceeds a threshold
- average value across a set of positions drops below a target
- a combined value across tracked markets crosses a threshold

### 5. Raw events

Use this when the cleanest model is to scan decoded events over a rolling window.

Examples:

- count ERC-20 transfers
- sum decoded event values
- monitor swaps for supported AMM protocols
- watch a custom ABI event signature through `contract_event`

This is the right choice when your integration is event-driven and you care more about event activity than protocol-specific abstractions.

## What Iruka can monitor well

Iruka is a strong fit when you need:

- protocol-aware monitoring for supported metrics
- explicit state checks over current or historical windows
- decoded raw-event monitoring
- alerting across many addresses
- multi-chain alerting with one backend
- webhook-first automation with optional Telegram delivery

## Delivery options

A signal must define one delivery path.

## Trigger modes

A signal can be driven by either:

- **Scheduled polling** — Iruka wakes the signal on its normal schedule
- **External input** — your own authenticated caller wakes the signal through `POST /api/v1/signals/:id/trigger`

Use external input when you already have an upstream event source and want Iruka to handle evaluation, repeat policy, history, and delivery after that event happens.

### Custom webhook

Use `webhook_url` when your application wants to receive alerts directly.

This is the best choice for:

- backend automation
- Slack, Discord, or internal notifier fan-out on your side
- workflow engines
- custom incident systems

### Managed Telegram delivery

Use:

```json
{ "delivery": { "provider": "telegram" } }
```

Iruka will resolve the internal delivery target and send alerts through the Telegram adapter.

This is the best choice for:

- direct human alerting
- team or operator notifications
- using Telegram-specific actions such as `Why` and snooze

## Repeat behavior

Iruka supports three repeat policies:

- `cooldown`
- `post_first_alert_snooze`
- `until_resolved`

Use these to control how often a matching signal should notify again.

## Supported raw-event presets

Iruka supports these raw-event kinds in the public API:

- `erc20_transfer`
- `erc20_approval`
- `erc721_transfer`
- `erc721_approval`
- `erc721_approval_for_all`
- `erc4626_deposit`
- `erc4626_withdraw`
- `swap`
- `contract_event`

## Current boundaries

Iruka is expressive, but it is not an arbitrary onchain programming language.

Important current limits:

- no arbitrary ABI-call DSL using raw function selectors and calldata
- no general-purpose math expression language authored by end users
- no public topic-level log query language as the primary API shape
- `group` supports either legacy `addresses` or generic `tracked: { field, values }`
- generic tracked groups are currently limited to event-style inner sources
- aggregate conditions accept `source` (with `metric` still supported as compatibility sugar)
- `raw-events` is a top-level condition type; it is not exposed as a nested condition inside `group`

Those limits are deliberate: Iruka aims to stay composable and predictable for integrators.

## How to choose the right condition type

Use this rule of thumb:

- choose **threshold** if you care about the current value
- choose **change** if you care about movement over time
- choose **group** if the same test should be applied across many tracked targets
- choose **aggregate** if you need one combined number across a scoped set
- choose **raw-events** if the source of truth is event activity

## What to read next

- Read **Writing Signals** for exact payload shape and examples
- Read **API Reference** for endpoint details
- Read **Telegram Delivery** if you want managed operator alerts
