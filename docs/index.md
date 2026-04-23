# Iruka for Integrators

Iruka is a monitoring backend for onchain state and event-driven alerts.

If you are building wallets, dashboards, automation, portfolio tooling, or internal ops workflows, Iruka helps you define **signals** that watch blockchain activity and notify people when conditions are met.

## What Iruka does

Iruka lets you:

- watch **current state** such as balances, vault positions, or protocol-specific fields
- detect **changes over time** such as a position dropping by 10% over 1 hour
- count or aggregate **decoded events** such as transfers, deposits, or swaps
- combine conditions across **multiple chains**, **multiple addresses**, and **time windows**
- define target-schema triggers for **schedules**, **external input**, or **other Iruka signals**
- deliver alerts through **managed Telegram delivery**

> [!NOTE]
> The docs describe the **target signal schema**.
> Some schema shapes may appear before every execution path is publicly enabled.
> For example, the schema includes `external`, but public external input is not live yet.

## What to read first

If you are new, read in this order:

1. **Getting Started** — connect to your Iruka environment and make your first API call
2. **Signal** — understand the top-level signal object
3. **Definition** — understand what belongs inside `definition`
4. **Examples** — see concrete condition examples
5. **API Reference** — check routes, payloads, and response behavior

## The product model in one sentence

A signal is a saved rule made of:

- a versioned outer object: `version`, `name`, `triggers`, `definition`, `delivery`, `metadata`
- a `definition` query: `scope`, `window`, `logic`, `conditions`

## Where Iruka is strongest today

Iruka is especially useful when you want to monitor:

- protocol positions and market state
- token and vault activity
- decoded event activity over a rolling window
- multi-address or cross-chain alerting logic
- product workflows that need a clean alerting backend behind a web app

## Where to go next

- Read **Getting Started** if you want to make your first real integration call
- Read **Signal** if you want the top-level signal shape
- Read **Definition** if you want the clean split between envelope and query logic
- Read **Examples** if you want concrete conditions you can send today
