# Iruka for Integrators

Iruka is a monitoring backend for onchain state and event-driven alerts.

If you are building wallets, dashboards, automation, portfolio tooling, or internal ops workflows, Iruka helps you define **signals** that watch blockchain activity and notify people when conditions are met.

## What Iruka does

Iruka lets you:

- watch **current state** such as balances, vault positions, or protocol-specific fields
- detect **changes over time** such as a position dropping by 10% over 1 hour
- count or aggregate **decoded events** such as transfers, deposits, or swaps
- combine conditions across **multiple chains**, **multiple addresses**, and **time windows**
- wake signals through **schedules**, **external triggers**, or **other Iruka signals**
- deliver alerts through **managed Telegram delivery**

## What to read first

If you are new, read in this order:

1. **Getting Started** — how to connect to your Iruka environment, choose auth, and make your first API call
2. **What You Can Build** — the product model, supported condition types, and where Iruka fits well
3. **The `definition` Layer** — what belongs inside `definition`
4. **Writing Signals** — condition examples you can send today
5. **API Reference** — endpoints, payloads, and response behavior

## The product model in one sentence

A signal is a saved rule made of:

- a **versioned envelope** — version, name, triggers, delivery, metadata
- a **definition** — scope, window, logic, and conditions

## Where Iruka is strongest today

Iruka is especially useful when you want to monitor:

- protocol positions and market state
- token and vault activity
- decoded event activity over a rolling window
- multi-address or cross-chain alerting logic
- product workflows that need a clean alerting backend behind a web app
- flows that combine scheduled checks with event-driven wake-up

## Where to go next

- Read **Getting Started** if you want to make your first real integration call
- Read **What You Can Build** if you want to decide whether Iruka fits your use case
- Read **The `definition` Layer** if you want the clean split between envelope and query logic
- Read **Writing Signals** if you already know you want to integrate
