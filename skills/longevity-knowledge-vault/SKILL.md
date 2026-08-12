---
name: longevity-knowledge-vault
version: 1.0.0
description: |
  Read-only access to the LAGP knowledge vault — a curated, citable corpus of
  anti-aging research and product-development literature. Wraps ChEMBL, PubChem,
  PubMed, the OECD QSAR Toolbox, CosIng, ClinicalTrials.gov, and the LAGP
  in-house submission archive.

  Use this skill when:
  - the user wants literature support for a candidate design
  - the user wants prior-art checks for novelty
  - the user wants to find a reference senolytic / senomorphic / geroprotector
  - the user wants to ground a claim in a specific paper or trial

  Do NOT use this skill for:
  - designing a candidate (use longevity-target-designer)
  - evaluating a candidate (use longevity-evaluator)
  - submitting (use longevity-submit)

triggers:
  - "find prior art"
  - "literature on senolytics"
  - "ChEMBL lookup"
  - "PubMed search"
  - "INCI check"
  - "what's known about fisetin"
  - "supporting evidence for"
  - "clinical trials for NMN"

runtime: python>=3.11
inputs:
  - query: string (required; natural language or structured)
  - source: "chembl" | "pubchem" | "pubmed" | "cosing" | "clinicaltrials" | "lagp_archive" | "all"
    (default "all")
  - track: q1 | q2 | q3 | q4 (optional; restricts to track-relevant corpora)
  - year_from: int (optional; default depends on source)
  - max_results: int (default 20, max 100)
outputs:
  - hits: list[ { source, id, title, abstract, url, year, citation_count, ... } ]
  - summary: string (auto-generated LLM summary of the hits)
  - citations: list[formatted citations]

license: MIT
---

# longevity-knowledge-vault

## What this skill does

Read-only access to a curated corpus of anti-aging research and product-development
literature. Wraps the public APIs the LAGP agent judges use, plus the LAGP
in-house submission archive.

The skill is the *library* side of the LAGP platform. It does not design,
evaluate, or submit. It only retrieves and cites.

## When to use

Use this skill when:

- The user wants to ground a design choice in published literature
- The user wants a prior-art check (novelty) for a candidate
- The user wants to know "what's known about X" for any anti-aging topic
- The user wants to find a reference compound (senolytic, geroprotector,
  senomorphic, NAD+ precursor, etc.)

Do **not** use this skill for:

- Designing a candidate → use `longevity-target-designer`
- Evaluating a candidate → use `longevity-evaluator`
- Submitting → use `longevity-submit`

## Workflow

### Step 1 · Classify the query

The skill first classifies the query into one or more source backends:

| Query shape | Source |
|---|---|
| "Find compounds similar to X" | ChEMBL + PubChem |
| "What's known about the safety of Y" | PubMed + ClinicalTrials |
| "Is Z INCI-compliant at this %" | CosIng |
| "What was the top submission to q1 last year" | LAGP archive |
| "Papers on senolytic mechanism of action" | PubMed |
| "Any trials of NMN in healthy adults" | ClinicalTrials |

### Step 2 · Fan out to backends

```python
from longevity import KnowledgeVault

vault = KnowledgeVault()
hits = vault.search(
    query="navitoclax senolytic",
    source="all",
    year_from=2018,
    max_results=20,
)
```

The vault returns a list of hits, each with a normalized schema:

```python
{
    "source": "pubmed",
    "id": "PMID:33245678",
    "title": "Navitoclax as a senolytic in age-related disease",
    "abstract": "...",
    "url": "https://pubmed.ncbi.nlm.nih.gov/33245678/",
    "year": 2020,
    "citation_count": 142,
    "track_relevance": ["q1"],     # which LAGP tracks this hit informs
    "groundedness": "primary",     # primary | secondary | tertiary
}
```

### Step 3 · Synthesize + cite

The skill generates a short LLM summary of the hits, with inline citations:

> Navitoclax is a BCL-2/BCL-xL inhibitor originally developed as an anti-cancer
> agent; it has been repurposed as a senolytic in multiple preclinical studies
> [1, 2]. In aged mice, intermittent dosing of navitoclax selectively cleared
> senescent cells and reduced frailty [3]. A 2024 phase-1b trial in
> idiopathic pulmonary fibrosis patients showed a modest reduction in senescent
> cell markers but dose-limiting thrombocytopenia [4].

The citations are returned as a list of formatted strings the user can paste into
a paper, a deck, or the `rationale` field of an LAGP submission.

### Step 4 · Optional: per-track filter

If the user has a target track, the skill filters the hits by relevance:

- `q1` — focus on ChEMBL compounds, primary senolytic / geroprotector papers
- `q2` — focus on CosIng, INCI decks, OECD 439 corpus, skin-permeation literature
- `q3` — focus on PubMed RCTs, bioavailability literature, food-matrix engineering
- `q4` — focus on composite biomarkers, longitudinal cohort studies, adherence
  literature

## Backends

| Backend | Coverage | Refresh |
|---|---|---|
| ChEMBL | 2.4M compounds, 20M bioactivities | Weekly |
| PubChem | 110M compounds, 270M substances | Daily |
| PubMed | 35M citations, 1946–present | Daily |
| CosIng | 30K INCI ingredients, EU regulatory | Monthly |
| ClinicalTrials.gov | 450K trials, 2000–present | Daily |
| LAGP archive | All prior LAGP submissions, agent prompts, judge critiques | On every submission |

## What this skill does NOT do

- Make a claim that is not supported by a retrieved hit
- Cite a paper the skill has not actually retrieved (the skill refuses to "trust"
  the LLM's parametric memory for citation)
- Modify or write back to any backend
- Score, evaluate, or design a candidate

## Known failure modes

- **Stale corpus** — the skill always returns the `as_of` timestamp for the
  underlying backend. PubMed and ClinicalTrials can be up to 24h behind.
- **Citation drift** — LLM-summarized citations can be subtly wrong. The skill
  always includes the retrieved source link so the user can verify.
- **Coverage gaps** — the LAGP archive only includes LAGP submissions. The skill
  does not include competitor competitions (e.g., Open Insulin, Ancient Remedy
  Jam) unless the user explicitly asks.
- **Cost** — ChEMBL and PubChem are free; ClinicalTrials and PubMed are metered
  through the LAGP API. The skill rate-limits itself to avoid burning the budget.

## References

- LAGP spec: `https://longevityagent.top/docs/targets`
- Public leaderboard: `https://longevityagent.top/leaderboard`
- Code repo: `github.com/longevity-agent/skills`
- ChEMBL: `https://www.ebi.ac.uk/chembl/`
- PubChem: `https://pubchem.ncbi.nlm.nih.gov/`
- PubMed: `https://pubmed.ncbi.nlm.nih.gov/`
- CosIng: `https://ec.europa.eu/growth/tools-databases/cosing/`
- ClinicalTrials.gov: `https://clinicaltrials.gov/`
