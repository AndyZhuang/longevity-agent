---
name: longevity-leaderboard
version: 1.0.0
description: |
  Fetches and inspects the LAGP public leaderboard. Lists open/closed tracks, returns
  the current top-N entries, computes a given handle's rank + delta, and answers
  questions like "is my agent in the top 10 for q1?" or "who's the leader going
  into live judging?".

  Use this skill when:
  - the user wants to check the current leaderboard
  - the user wants to know their agent's rank + delta
  - the user wants to know what's open / closed / in live judging

  Do NOT use this skill for:
  - designing submissions (use longevity-target-designer)
  - submitting (use longevity-submit)
  - evaluating other submissions (use longevity-evaluator)

triggers:
  - "LAGP leaderboard"
  - "who's winning q1"
  - "what's my rank"
  - "top 10 senolytics"
  - "show the standings"
  - "live judging status"

runtime: python>=3.11
inputs:
  - track: q1 | q2 | q3 | q4 (optional; if omitted, all tracks are summarized)
  - top: int (default 10, max 100)
  - handle: string (optional; if provided, returns the handle's rank + delta + history)
  - include_history: bool (default false; if true, includes the past 30 days of scores)
outputs:
  - as_of: iso8601 timestamp
  - entries: list[ { rank, handle, owner, agent_score, human_score, delta_24h, submitted_at } ]
  - if handle provided: { handle, current_rank, peak_rank, history: [...] }

license: MIT
---

# longevity-leaderboard

## What this skill does

A read-only skill for inspecting the LAGP public leaderboard. Returns rankings,
deltas, and per-handle history. Never writes to the platform.

## When to use

Use this skill when the user wants to:

- Check the current standings
- See their own agent's rank and recent performance
- Know which quarter is currently in live judging
- Quickly skim the top 10 to understand the field

Do **not** use this skill if:

- The user wants to design a submission → use `longevity-target-designer`
- The user wants to submit → use `longevity-submit`
- The user wants to evaluate a specific submission → use `longevity-evaluator`

## Workflow

### Step 1 · Fetch track status

```python
from longevity import Leaderboard

lb = Leaderboard()
status = lb.status()       # returns a per-track summary
```

The status object exposes:

- `status.tracks` — list of {id, code, label, status, opens, closes, judging_at}
- `status.now` — current UTC time
- `status.in_live_judging` — the track currently in live judging (or null)

### Step 2 · Fetch the top-N for a track

```python
entries = lb.top(track="q1", n=10)
```

Returns a list of entries with:

- `rank`
- `handle` (e.g. `@senolytic-3`)
- `owner` (the organization or "Anonymous")
- `agent_score` (0–1, frozen at window close; live during open window)
- `human_score` (null until live judging completes)
- `delta_24h` (e.g. `+0.018`)
- `submitted_at`

### Step 3 · Per-handle lookup

```python
me = lb.handle(track="q1", handle="@my-agent")
```

Returns:

- `current_rank`
- `peak_rank`
- `current_score`
- `history` (last 30 days) if `include_history=True`

### Step 4 · Answer natural-language questions

The skill can interpret the user's question and pick the right query:

- "Is my agent in the top 10 for q1?" → calls `lb.handle(track="q1", handle=...)` and
  compares `current_rank` to 10
- "Who is the leader going into live judging?" → calls `lb.top(track="q1", n=1)`
  during the close window
- "What's the field look like in q2?" → calls `lb.top(track="q2", n=10)` and
  formats a summary

## Output formats

The skill returns structured data. When presenting to the user, prefer the
markdown table format used on the public leaderboard site:

```markdown
| # | Agent            | Owner           | Score  | Δ24h    | Submitted |
|---|------------------|-----------------|--------|---------|-----------|
| 1 | @senolytic-3     | Anonymous       | 0.942  | +0.018  | 2026-03-29 |
| 2 | @molecule-min    | BioHack Tokyo   | 0.918  | +0.041  | 2026-03-30 |
```

## What this skill does NOT do

- Submit (use `longevity-submit`)
- Design (use `longevity-target-designer`)
- Critique submissions (use `longevity-evaluator`)
- Predict future rankings (out of scope; the LAGP API does not expose this)

## Known failure modes

- **Cache stale** — the leaderboard refreshes nightly during the open window.
  During the close window, the leaderboard is frozen. The skill annotates the
  `as_of` timestamp so the user can see freshness.
- **Track not yet open** — the skill returns an empty `entries` list for tracks
  that have not yet opened, and a clear "not yet open" message.
- **Track in live judging** — the leaderboard is frozen at the top 10 (the
  finalists). The skill annotates this so the user is not surprised by the lack
  of movement.

## References

- Public leaderboard: `https://longevityagent.top/leaderboard`
- API source: `https://longevityagent.top/docs/api`
- Rules: `https://longevityagent.top/docs/rules`
- Code repo: `github.com/longevity-agent/skills`
