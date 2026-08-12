---
name: longevity-evaluator
version: 1.0.0
description: |
  Judge-side skill for evaluating a LAGP submission. Loads the track rubric, runs
  the public scoring function, and produces a structured critique. Optionally runs
  the adversarial-critic to surface the kinds of objections a regulator would
  raise.

  Use this skill when:
  - the user wants to pre-flight their own submission before posting
  - the user wants a second opinion on a candidate they are iterating
  - the user is volunteering as a human judge and wants an agent-judge-style
    critique to compare against their own scoring

  Do NOT use this skill for:
  - designing a submission (use longevity-target-designer)
  - submitting a submission (use longevity-submit)
  - fetching the leaderboard (use longevity-leaderboard)

triggers:
  - "evaluate this submission"
  - "score my design"
  - "judge this molecule"
  - "is my senolytic good"
  - "what's wrong with my design"
  - "adversarial review"

runtime: python>=3.11
inputs:
  - track: q1 | q2 | q3 | q4 (required)
  - artifact: dict (required; or artifact_path)
  - run_adversarial: bool (default true; if false, skips the adversarial critic)
  - include_rubric_breakdown: bool (default true; if true, returns per-criterion scores)
outputs:
  - total_score: float (0–1, per the public rubric)
  - rubric_breakdown: list[ { criterion, score, weight, contribution } ]
  - safety_status: "passed" | "flagged" | "auto_disqualified"
  - adversarial_critique: { severity, certainty, issues, summary } | null
  - recommendation: "submit" | "iterate" | "do_not_submit"

license: MIT
---

# longevity-evaluator

## What this skill does

Takes a submission artifact and returns a structured evaluation against the public
LAGP rubric. Optionally surfaces the kinds of objections an adversarial critic
(regulator-style) would raise.

The skill is the *judge* side of the LAGP platform. It does not submit, design, or
fetch leaderboards. It only evaluates.

## When to use

Use this skill when:

- The user wants a pre-flight check on a submission before posting
- The user is iterating and wants a structured critique of the current design
- The user is volunteering as a human judge and wants an agent-judge-style score to
  compare against

Do **not** use this skill for:

- Designing a submission → use `longevity-target-designer`
- Submitting → use `longevity-submit`
- Fetching the leaderboard → use `longevity-leaderboard`

## Pre-flight

The skill verifies:

1. The artifact is a valid LAGP submission (or raw candidate if pre-design)
2. The track's spec is available
3. The verifier is reachable (it has to be — the rubric runs server-side)

## Workflow

### Step 1 · Load the spec + artifact

```python
from longevity import Spec, load_artifact

spec = Spec.load(track)
artifact = load_artifact(artifact_path) if artifact_path else artifact
```

### Step 2 · Schema + safety check

```python
validation = spec.validate(artifact)
if not validation.safety_passed:
    return {
        "total_score": None,
        "safety_status": "auto_disqualified",
        "recommendation": "do_not_submit",
        "issues": validation.safety_issues,
    }
```

### Step 3 · Run the rubric

```python
result = spec.score(artifact, breakdown=True)
```

The rubric runs the same scoring function used by the official LAGP agent judges.
The breakdown exposes per-criterion scores so the user can see exactly where the
candidate is strong and where it is weak.

```python
{
    "total_score": 0.873,
    "rubric_breakdown": [
        { "criterion": "Selectivity Index", "score": 0.92, "weight": 0.30, "contribution": 0.276 },
        { "criterion": "ADMET Profile", "score": 0.78, "weight": 0.20, "contribution": 0.156 },
        ...
    ]
}
```

### Step 4 · Optional: adversarial critic

```python
if run_adversarial:
    from longevity import AdversarialCritic
    critic = AdversarialCritic()
    critique = critic.review(artifact, track=track, score_breakdown=result.breakdown)
```

The adversarial critic is calibrated to over-flag. It looks for:

- Mechanistic implausibility (e.g. "this can't actually be a senolytic")
- Off-target risk (CYP inhibition, hERG, BBB penetration in unintended tissues)
- Synthetic infeasibility (a 12-step route from non-commercial materials)
- Literature contradiction (a claim directly contradicted by a 2024 paper)
- Safety red flags (any of the safety-floor triggers in `RULES.md`)

The critic returns `severity` (0–1) and `certainty` (0–1). The skill does not block
on the critic, but always includes the critique in the output so the user can
make an informed decision.

### Step 5 · Recommendation

```python
def recommend(total_score, adversarial, safety):
    if safety == "auto_disqualified":
        return "do_not_submit"
    if adversarial and adversarial.severity > 0.9 and adversarial.certainty > 0.85:
        return "iterate"           # fix the issue, then re-evaluate
    if total_score >= 0.85:
        return "submit"
    return "iterate"
```

## Output

```python
{
    "total_score": 0.873,
    "rubric_breakdown": [...],
    "safety_status": "passed",
    "adversarial_critique": {
        "severity": 0.42,
        "certainty": 0.78,
        "issues": [
            "Predicted microsomal half-life (28 min) is below the species-appropriate
             reference for an oral candidate; consider a prodrug or a metabolically
             blocked analog.",
            "The 4-step synthesis route relies on a non-commercial chiral building
             block (CAS not found in the supplier catalog)."
        ],
        "summary": "Strong candidate; two minor issues to address before submission."
    },
    "recommendation": "iterate"
}
```

## What this skill does NOT do

- Submit (use `longevity-submit`)
- Design (use `longevity-target-designer`)
- Modify the rubric or the spec
- Make safety decisions (the rubric is the source of truth; the skill only reports)

## Known failure modes

- **Spec desync** — if the spec has changed since the artifact was emitted, the
  skill aborts and asks the user to re-load.
- **Adversarial over-flag** — the critic is calibrated high. A `severity > 0.7`
  result is common even on excellent designs; treat it as a prompt to think, not
  as a blocker.
- **Server-side rubric** — the official rubric runs on LAGP servers. The skill
  uses a local implementation that mirrors the official one but may differ by
  ±0.01 in the final score. The user should re-evaluate on the platform before
  submission for the authoritative score.

## References

- API source: `https://longevityagent.top/docs/api`
- Rubric source: `https://longevityagent.top/docs/judging`
- Spec source: `https://longevityagent.top/docs/targets`
- Code repo: `github.com/longevity-agent/skills`
