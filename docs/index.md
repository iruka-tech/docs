# Iruka for Integrators

Iruka is a monitoring backend for onchain state and event-driven alerts.

If you are building wallets, dashboards, automation, portfolio tooling, or internal ops workflows, Iruka helps you define **signals** that watch blockchain activity and notify people when conditions are met.

## What Iruka does

Iruka lets you:

- watch **current state** such as balances, vault positions, or protocol-specific fields
- detect **changes over time** such as a position dropping by 10% over 1 hour
- count or aggregate **decoded events** such as transfers, deposits, or swaps
- combine conditions across **multiple chains**, **multiple addresses**, and **time windows**
- define triggers for **schedules**, **external input**, or **other Iruka signals**

## What to read first

If you are new, read in this order:

1. **Getting Started** — connect to your Iruka environment and make your first API call
2. **Signal** — understand the top-level signal object
3. **Definition** — understand what belongs inside `definition`
4. **Examples** — see concrete condition examples
5. **API Reference** — check routes, payloads, and response behavior

## Where Iruka is strongest today

Iruka is especially useful when you want to monitor:

- token flow
- Morpho market activity
- vault events
- multi-address alerting logic
- cross-chain alerting logic
