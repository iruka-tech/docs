# External Triggers

> [!NOTE]
> This page describes a **target-schema trigger type**, not a live public integration flow.
> The signal schema already reserves `{"type":"external"}`.
> Public external input is **not enabled yet**.

## What this means today

You can design around `external` as part of the target signal model.

```json
{
  "type": "external"
}
```

That tells readers and integrators that Iruka intends to support a signal which is woken by an authenticated upstream system instead of a schedule.

## What is not live yet

The public docs do **not** currently promise:

- a live `POST /api/v1/signals/:id/trigger` flow
- a stable trigger payload contract
- production-ready external event ingestion

Until that ships, use scheduled signals in real integrations.

## Why keep it in the schema docs

Because it changes how the signal model is understood:

- `triggers` is an array because a signal can have more than one wake-up path
- not every trigger is a scheduler
- delivery stays separate from triggering

## What to read next

- Read **Signal** for the top-level signal shape
- Read **Definition** for the query structure
- Read **API Reference** for currently available routes
