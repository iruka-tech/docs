# Usage Limits

Iruka meters active scheduled signals by **complexity units**. The goal is simple: users should understand how much monitoring capacity a signal consumes before they hit a limit.

A signal's complexity is based on how often Iruka evaluates it and how much upstream provider work each evaluation needs: current-state RPC reads, archive reads, and HyperSync/event queries.

## Complexity units

For an active signal with an interval schedule:

```text
complexity = ceil(3600 / interval_seconds) × work_units_per_evaluation
```

Rules:

- `ceil(3600 / interval_seconds)` estimates hourly evaluation frequency.
- `work_units_per_evaluation` estimates provider work per evaluation.
- a current state read costs 1 work unit.
- a `change` condition over state costs 2 work units because it reads current state and historical state at `window_start`.
- a raw event / HyperSync query costs 2 work units.
- expression sources add the work units of their inputs.
- group conditions multiply nested condition work by the static group size when it is known.
- inactive signals do not count toward the active usage limit.
- external-only signals do not count toward the active scheduled-signal limit.
- scheduled signals count while they are active.

Examples:

| Signal shape | Calculation | Complexity |
| --- | ---: | ---: |
| 60-minute interval, 1 current-state condition | `ceil(3600 / 3600) × 1` | `1` |
| 15-minute interval, 2 current-state conditions | `ceil(3600 / 900) × 2` | `8` |
| 10-minute interval, 1 current-state condition | `ceil(3600 / 600) × 1` | `6` |
| 10-minute interval, 1 raw-event condition | `ceil(3600 / 600) × 2` | `12` |
| 5-minute interval, 3 current-state conditions | `ceil(3600 / 300) × 3` | `36` |

## Example: liquidity threshold

Suppose a signal:

- checks every 10 minutes
- has 1 threshold condition
- reads current liquidity for a pool or token account

Its complexity is:

```text
ceil(3600 / 600) × 1 = 6
```

So one simple 10-minute liquidity threshold costs **6 complexity units**.

## Example: historical state change

Suppose a signal:

- checks every 1 minute
- has 2 top-level `change` conditions
- each condition compares the current value against historical state at `window_start`
- combines both conditions with `logic: "AND"`

Each `change` condition costs 2 work units: one current read and one archive/historical read. Two `change` conditions cost 4 work units per evaluation.

Its complexity is:

```text
ceil(3600 / 60) × (2 + 2) = 240
```

So this signal costs **240 complexity units**.

Example definition:

```json
{
  "window": { "duration": "1h" },
  "logic": "AND",
  "conditions": [
    {
      "type": "change",
      "source": { "kind": "alias", "name": "ERC20.Position.balance" },
      "chain_id": 1,
      "token": "0xTokenAddress",
      "account": "0x1111111111111111111111111111111111111111",
      "direction": "decrease",
      "by": { "percent": 20 }
    },
    {
      "type": "change",
      "source": { "kind": "alias", "name": "ERC20.Position.balance" },
      "chain_id": 1,
      "token": "0xTokenAddress",
      "account": "0x2222222222222222222222222222222222222222",
      "direction": "decrease",
      "by": { "percent": 20 }
    }
  ]
}
```

With a 500-unit Pro budget, a user could run about **2** of these high-frequency historical-state signals at once.

## Plan limits

Current production has a default active complexity limit of **25**. That is enough for a few lightweight monitors, but it is intentionally not enough for heavy professional monitoring.

The intended paid plan baseline is:

| Plan | Monthly price | Active complexity budget | Example capacity |
| --- | ---: | ---: | --- |
| Free | $0 | 25 | about 4 simple 10-minute threshold signals |
| Pro | $10 | 500 | about 83 simple 10-minute threshold signals, or about 2 high-frequency historical-state signals |

A 500-unit Pro budget gives room for many low-frequency checks, while still charging high-frequency archive/event work proportionally.

## How to reduce complexity

If you hit a usage limit, reduce the amount of scheduled work Iruka needs to run:

- use a longer interval when sub-minute reaction time is not needed
- reduce the number of state reads or archive comparisons per evaluation
- keep raw-event / HyperSync checks scoped tightly
- combine related checks into fewer signals when they share the same delivery behavior
- deactivate stale or test signals
- use external triggers for event-driven workflows that do not need scheduled polling
- keep high-frequency checks focused on the smallest set of conditions that need fast response

## API behavior

Saved-signal responses include `complexity_score`, so a successful create or read tells you how expensive that signal is.

Authenticated users can fetch their current limits:

```http
GET /api/v1/me/limits
```

The response includes:

- plan key and name
- active complexity used and limit
- minimum schedule interval
- formula version and docs URL

When create, update, or activation would exceed the active complexity budget, the API returns a structured `400` error with `code = "active_complexity_budget_exceeded"`, numeric budget fields, `plan`, `signal_complexity`, and `docs_url`.

See the API Reference for the exact response shape.

## Remaining rollout

Iruka now has provider-work complexity enforcement, a plan/limits response, and product-facing quota errors. Remaining work:

1. **Add plan assignment.** Map users to Free or Pro through a backend plan resolver. Keep internal/admin overrides separate from billing status.
2. **Wire billing after the product contract is stable.** Connect $10/month checkout and subscription status to the plan resolver.
3. **Update the app UI.** Show current usage before signal creation and link limit errors to this page.
4. **Monitor representative workloads.** Verify that Pro capacity fits real monitoring needs without making local incidents into public reference examples.
