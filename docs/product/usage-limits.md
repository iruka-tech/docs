# Usage Limits

Iruka meters active scheduled signals by **complexity units**. The goal is simple: users should understand how much monitoring capacity a signal consumes before they hit a limit.

A signal's complexity is not based on how long the JSON is. It is based on how often Iruka needs to evaluate it and how many conditions it evaluates each time.

## Complexity units

For an active signal with an interval schedule:

```text
complexity = ceil(3600 / interval_seconds) + number_of_conditions
```

Rules:

- `ceil(3600 / interval_seconds)` estimates hourly evaluation frequency.
- each top-level condition adds `+1`.
- inactive signals do not count toward the active usage limit.
- external-only signals do not count toward the active scheduled-signal limit.
- scheduled signals count while they are active.

Examples:

| Signal shape | Calculation | Complexity |
| --- | ---: | ---: |
| 60-minute interval, 1 condition | `ceil(3600 / 3600) + 1` | `2` |
| 15-minute interval, 2 conditions | `ceil(3600 / 900) + 2` | `6` |
| 10-minute interval, 1 condition | `ceil(3600 / 600) + 1` | `7` |
| 5-minute interval, 3 conditions | `ceil(3600 / 300) + 3` | `15` |

## The pmUSD reference signal

A useful real-world reference is the pmUSD stress monitor:

- checks every 10 minutes
- has 1 condition
- watches whether crvUSD exit liquidity in the largest pmUSD/crvUSD Curve pool falls below a threshold

Its complexity is:

```text
ceil(3600 / 600) + 1 = 7
```

So one pmUSD-style market-risk monitor costs **7 complexity units**.

## One-minute historical state example

Suppose a signal:

- checks every 1 minute
- has 2 top-level `change` conditions
- each condition compares the current value against historical state at `window_start`
- combines both conditions with `logic: "AND"`

Its complexity is:

```text
ceil(3600 / 60) + 2 = 62
```

So this signal costs **62 complexity units**. The archive reads are part of the `change` condition evaluation; the current formula counts this as 2 top-level conditions, not as a separate charge per historical read.

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
      "token": "0xA0b8...eb48",
      "account": "0x1111111111111111111111111111111111111111",
      "direction": "decrease",
      "by": { "percent": 20 }
    },
    {
      "type": "change",
      "source": { "kind": "alias", "name": "ERC20.Position.balance" },
      "chain_id": 1,
      "token": "0xA0b8...eb48",
      "account": "0x2222222222222222222222222222222222222222",
      "direction": "decrease",
      "by": { "percent": 20 }
    }
  ]
}
```

With a 500-unit Pro budget, a user could run about **8** of these high-frequency historical-state signals at once.

## Plan limits

Current production has a default active complexity limit of **25**. That is enough for a few lightweight monitors, but it is intentionally not enough for heavy professional monitoring.

The intended paid plan baseline is:

| Plan | Monthly price | Active complexity budget | Equivalent pmUSD monitors |
| --- | ---: | ---: | ---: |
| Free | $0 | 25 | about 3 |
| Pro | $10 | 500 | about 71 |

The Pro target is deliberately above **30×** the pmUSD reference signal:

```text
30 × 7 = 210
```

A 500-unit Pro budget gives room for at least 30 pmUSD-style monitors, or about 8 high-frequency 1-minute historical-state signals that cost 62 units each.

## How to reduce complexity

If you hit a usage limit, reduce the amount of scheduled work Iruka needs to run:

- use a longer interval when sub-minute reaction time is not needed
- combine related checks into fewer signals when they share the same delivery behavior
- deactivate stale or test signals
- use external triggers for event-driven workflows that do not need scheduled polling
- keep high-frequency checks focused on the smallest set of conditions that need fast response

## API behavior

Saved-signal responses include `complexity_score`, so a successful create or read tells you how expensive that signal is.

When create, update, or activation would exceed the active complexity budget, the API returns a structured `400` error with `code = "active_complexity_budget_exceeded"` and numeric budget fields.

See the API Reference for the exact response shape.

## Production rollout plan

This is the rollout path for turning the current internal limit into a user-facing plan system:

1. **Keep current enforcement in place.** Preserve the existing complexity formula and active scheduled-signal budget checks so there is no runtime behavior change during documentation rollout.
2. **Expose plan usage in the API.** Add an authenticated limits response that returns the user's plan, active complexity used, active complexity limit, minimum schedule interval, and a docs URL.
3. **Improve limit errors.** Keep the existing error fields, then add product-facing fields such as `plan`, `signal_complexity`, and `docs_url` so the app can explain what happened.
4. **Add plan assignment.** Map users to Free or Pro through a single backend plan resolver. Keep the existing internal override separate for team/admin testing.
5. **Wire billing after the product contract is stable.** Connect $10/month checkout and subscription status to the plan resolver only after the API and docs are stable.
6. **Update the app UI.** Show current usage before signal creation and link limit errors to this page.
7. **Monitor dogfood accounts.** Verify that Pro users can create at least 30 pmUSD-equivalent monitors without repurposing old signals.

The first backend PR should avoid billing tables, avoid changing the formula, and focus on making limits visible and understandable.
