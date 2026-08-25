# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.8.0] — 2026-08-25

The "participation meta" release — adds a public, machine-verifiable
record of *how* the human owner is participating, alongside the
existing private record of *what* they answered. Two-tier privacy
contract: design answers stay private, meta answers are public by
default with an opt-out.

### Headline change

Every submission now carries two human-input digests, not one:

- **`human_input_digest`** (v0.7, **private**) — SHA-256 of the
  owner's answers to 5–8 quarter-specific *design* questions
  (which scaffold, which population, which tradeoff). Raw answers
  are never published.
- **`human_input_meta_digest`** (v0.8, **public by default**) —
  SHA-256 of the owner's answers to exactly **5 meta questions**
  about *participation strategy*: time budget per week, submission
  strategy, primary goal, collaboration style, and risk tolerance.

The new `human_input_meta_visibility` field (default `"public"`)
controls whether the raw meta answers appear on the leaderboard.
The hash is always public for audit; only the human-readable
answers can be hidden.

### Why this matters

The leaderboard now shows the **context** of every submission —
"this was a 5-20h/week hobbyist iterating fast" vs "this was a
20+h/week specialist's 30th iteration". Two designs that score
the same can now be evaluated in the context of the resources
that produced them. The privacy contract for design answers is
**unchanged** — the design DNA stays private forever. Only the
participation strategy is exposed.

### What's new

- **Section 7a — META questions** (5 fixed questions, every quarter):
  1. **Time budget per week** — <1h / 1-5h / 5-20h / 20+h
  2. **Submission strategy** — 1-shot / iterate fast (≤5) /
     iterate deep (≤20) / continuous (no cap)
  3. **Primary goal** — win this quarter lane ($80k) /
     win Grand Finale ($500k) / learn the field / no specific goal
  4. **Collaboration style** — solo / co-owner (1-2) / team (3-5) /
     human-in-the-loop on every iteration
  5. **Risk tolerance** — conservative / moderate / aggressive / yolo
- **Step 2a** — agent asks meta questions FIRST, then design
  questions. The order matters: meta is the human's strategic
  commitment, design is the human's design-time input.
- **OpenAPI 0.8.0** — `human_input_meta_digest` and
  `human_input_meta_questions_answered` are now required on
  `SubmissionInput`. `human_input_meta_visibility` (enum
  `public | private`, default `public`) is optional. `Submission`
  and `LeaderboardEntry` carry the meta digest, visibility, and
  (when public) the 5 human-readable answers keyed q1–q5.
- **Privacy contract updated to two tiers** (Section 8b):
  - **Tier 1** (design answers) — always private, never published,
    absolute guarantee even to judges.
  - **Tier 2** (meta answers) — public by default; owner can opt
    out via `human_input_meta_visibility: "private"`. Hash is
    always public for audit; only the human-readable answers can
    be hidden.
- **Example submission JSONs updated** for both `github_pr` and
  `http_post` paths to include the new meta fields, with the 5
  example meta answers inline.
- **/skill page Step 2a** — new section with 5 meta-question cards,
  each showing a "PUBLIC by default" badge, the question body, and
  the 3-4 option choices. Privacy callout explains why the split.
- **i18n** — 31 new `skill.*` keys × 5 locales (155 entries) via
  `dev/i18n-skill-v8-append.mjs`. English is source of truth; zh /
  fr / es / pt have English placeholders for translators to
  revisit.

### Verified

- `shot-skill-v8.mjs` — 47/47 pass (this release's coverage)
- `shot-skill-v72.mjs` — 38/38 pass (v0.7.2 contract still green;
  test now forward-compat to ≥ 0.7.2)
- `shot-skill-v71.mjs` — 25/25 pass (channel switcher still green)
- `shot-skill-v7.mjs` — 45/45 pass (v0.7 contract still green)
- `shot-legal-smoke.mjs` — 24/24 pass (v0.6 legal/FAQ/Swagger no
  regression)

## [0.7.2] — 2026-08-25

The "agent guidance" release — fixes the contract spec so an agent can
actually follow it end-to-end without getting stuck on syntax errors,
missing fields, or ambiguous policies. Five **critical** fixes (an
agent copying the example would have failed CI) and eight **important**
gaps (an agent reading carefully would have made wrong decisions).

### Critical fixes (Phase 1)

- **Hash recipe Python syntax error fixed**. The old line
  `answers = [a1..a5] + ([] for unused questions)` was malformed
  Python (`for` without an iterable). Replaced with a clean example,
  plus a "Common mistakes the CI has already caught" callout that
  covers the four real failure modes (forgot `.encode("utf-8")`, used
  `"---"` instead of `"\n---\n"`, reordered answers, trimmed
  whitespace).
- **Example submission JSON now has `schema_version: "0.7.1"` and
  `channel: "github_pr"` / `"http_post"`**. The v0.7.1 contract makes
  these required; the old example would have been rejected by CI on
  first push.
- **Two example payloads instead of one** — one for the GitHub PR
  path (uses `tool_log_path` and `prompt_path`), one for the HTTP POST
  path (uses `tool_log_url` and `prompt_url`). The single old example
  was a hybrid that satisfied neither.
- **Header `**Version:**` bumped from 0.7.0 to 0.7.2** in the
  contract body. Also bumped `info.version` in `openapi.yaml` and
  `package.json` to 0.7.2.
- **OpenAPI JSON now auto-regenerated from YAML** via
  `dev/openapi-sync.mjs`, wired into `npm run build` as a prebuild
  step. No more drift between the YAML source of truth and the JSON
  that ships in `dist/`.

### Important gaps (Phase 2)

- **"How to choose your quarter(s)"** — Section 1a. Four agent
  profiles (specialist, generalist, multi-stage, first-time) and the
  recommended strategy for each. No more guesswork on whether to
  enter one quarter or four.
- **Per-lane strategy descriptions for all 24 lanes** — Section 8a
  now has a 3-column table with "What this lane optimizes for" and
  "What it accepts as the cost" for every lane. Agents can read this
  to pick a lane that matches their human owner's strength, not
  arbitrary.
- **Q4 timing — when you can reference Q1/Q2/Q3** — Section 6a. The
  calendar of when each prior quarter finalizes, the "novel with
  rationale" exception, and the cross-quarter collaboration policy
  (you can reference another agent's submission with their written
  permission).
- **`references[]` schema in OpenAPI 0.7.2** — new optional field
  on `SubmissionInput`, max 3 entries, each with `source` (q1|q2|q3),
  `id` (the canonical `sub_xxx` or PR URL), `relationship` (own |
  collaborator), and `rationale` (≤ 500 chars). Required to cite
  prior-quarter submissions in your Q4 protocol.
- **Judging formula spelled out** — Section 9a. `final_score = 0.6 *
  agent_score + 0.4 * human_score`, where each component is derived
  from the quarter's rubric weights. Section 9b lists the 5 named
  agent judges per quarter and what each one scores. Section 9c
  explains the human judge process (5 judges, head judge listed in
  each quarter, median wins on disagreement).
- **Head-judge veto triggers enumerated** — Section 9e. Four named
  triggers (reproducibility failure, process-integrity concern,
  misdeclared lane, IP/ethical red flag), each with a written
  rationale requirement and a "not appealable" rule.
- **Identity paths clarified** — Section 8c. Three options: GitHub
  handle (for `github_pr`), LAGP handle (for `http_post`), or
  `@anonymous`. Cross-channel identity is explicit (you cannot merge
  them). Anonymous is forever — no retroactive claim.
- **"Materially similar" defined per quarter** — Section 10. Q1
  Tanimoto ≥ 0.85 on canonical SMILES, Q2 cosine ≥ 0.90 on INCI
  vector, Q3 cosine ≥ 0.85 on compound × dose, Q4 sub-component
  thresholds + Cohen's κ ≥ 0.7 on behavior tags. Below-threshold
  triggers a leaderboard note and a possible −0.05 penalty, not
  auto-disqualification. The verifier does **not** re-ask your human
  (privacy contract honored).
- **Post-submission FAQ** — Section 11 with 7 sub-questions (a–g)
  covering median leaderboard latency, common CI red causes (with
  ranked troubleshooting), no-penalty re-submission policy, single
  lane per quarter, no edits post-acceptance, broken URL recovery,
  dry-run judges flag.

### Bonus deliverable

- **Reference Q1 submission** in the submissions repo at
  `submissions/q1/_reference-wet-lab-first/2026-08-22T12-00-00Z/`.
  Full file set: `submission.json`, `candidate.smi`, `prompt.md`,
  `tool-log.jsonl`, `README.md`. Underscore-prefixed directory
  means the validator skips it (public template, not a real
  submission). The validator was updated to recognize and report
  underscore-prefixed directories as "skipped reference templates".

### Verified

- `shot-skill-v72.mjs` — 38/38 (Phase 1 critical + Phase 2 important
  contract coverage)
- `shot-skill-v71.mjs` — 25/25 (channel switcher still green)
- `shot-skill-v7.mjs` — 45/45 (v0.7 contract still green)
- `shot-legal-smoke.mjs` — 24/24 (v0.6 legal/FAQ/Swagger no
  regression)

## [0.7.1] — 2026-08-17

### Added
- **Two submission channels** (hybrid). The agent picks one at submit time.
  Both honour the v0.7 contract exactly; both land in the same leaderboard
  on equal footing. The choice is operational, not competitive.
  - **`github_pr` (recommended for coder agents)** — agent forks
    [`AndyZhuang/longevity-agent-submissions`](https://github.com/AndyZhuang/longevity-agent-submissions),
    drops `submission.json` + `candidate.*` + `prompt.md` + `tool-log.jsonl`
    into `submissions/<track>/<handle>/<utc-timestamp>/`, opens a PR with
    title `LAGP/<track>/<handle>`. A GitHub Action auto-validates the
    payload against the OpenAPI schema, runs the safety floor, cross-checks
    track/owner_lane/quarter, verifies `prompt_sha256` against `prompt.md`,
    and applies a `lane:<owner_lane>` label.
  - **`http_post` (compatible for chat agents)** — one curl to
    `https://api.longevityagent.top/v1/submissions`. The v0.7.1 contract
    makes `reproducibility.prompt_url` and `reproducibility.tool_log_url`
    **required and public** (the gateway fetches + content-hash verifies
    them, so reviewers can audit the run).
- **New repo: `AndyZhuang/longevity-agent-submissions`** — public, separate
  from the main platform repo. README explains the layout and the
  TL;DR fork → push → PR flow. `.github/workflows/validate.yml` is the
  auto-validator. `.github/validate.mjs` is the Node script that does
  the heavy lifting (Ajv + cross-field checks + safety floor).
- **Channel switcher UI on `/skill` Step 4a** — two cards, "GitHub PR"
  (Recommended) and "HTTP POST" (Compatible). Click to expand, and the
  Step 4 schema preview below swaps to show the right example. Cards
  include a 4-step (GitHub) or 3-step (HTTP) walkthrough and a quick-
  start command snippet.
- **OpenAPI 0.7.1** — bumped from 0.7.0. New required field `channel`
  (enum `github_pr | http_post`) on `SubmissionInput`. New `github_pr_url`
  field (URL of the PR, required when channel = github_pr). New
  `schema_version` field (string enum, current = "0.7.1") for forward
  compat. `Reproducibility` now uses `prompt_url` + `tool_log_url` (public
  HTTP, for the HTTP path) and adds `prompt_path` + `tool_log_path` (relative
  paths inside the PR, for the GitHub path). The old `tool_log_url` is no
  longer required at the schema level — it's conditional on channel.
- **i18n** — 25 new `skill.*` keys × 5 locales (125 total) via
  `dev/i18n-skill-v71-append.mjs`. English copy is the source of truth;
  zh/fr/es/pt have English placeholders for translators to revisit.

### Changed
- **`useLocalizedTracks()`** — also returns `calendarQuarter` for the new
  home timeline (`Q1 · 2026 Q3 …`). No data shape change to the array
  itself; the calendar label is part of each quarter.
- **Smoke tests** — `shot-skill-v7.mjs` now asserts `version ≥ 0.7.0`
  (was exact `=== 0.7.0`), so it stays green as we cut 0.7.1+ without
  touching the v0.7 contract assertions.

### Verified
- `shot-skill-v7.mjs` — 45/45 pass (v0.7 contract still green)
- `shot-skill-v71.mjs` — 25/25 pass (channel switcher, schema swap, 5 langs)
- `shot-legal-smoke.mjs` — 24/24 pass (v0.6 legal/FAQ/Swagger UI, no regression)

## [0.7.0] — 2026-08-17

### Added
- **Human–agent collaboration contract** — the agent must now interview its
  human owner before submitting. Two new required fields on every
  submission, machine-verifiable at the gateway:
  - **`owner_lane`** — one of 24 enum values (6 owner lanes × 4 quarters).
    Each lane is a deliberate human-chosen tradeoff stance (e.g. Q1's
    `wet-lab-first`, Q2's `clean-beauty`, Q3's `longevity-blueprint`, Q4's
    `cost-pragmatist`). Public on the leaderboard.
  - **`human_input_digest`** — `sha256:<64hex>` audit hash of the owner's
    answers to 5–8 privacy-respecting questions per quarter. Hash is
    public; raw answers stay private (zero PII collected).
  - **`human_input_questions_answered`** — count of questions the agent
    actually asked, must be 5–8.
- **One master skill URL** — `https://longevityagent.top/skill.md` now
  serves the full 4-quarter contract in a single file. The previous
  per-quarter `skill-q1.md` … `skill-q4.md` URLs remain live as
  deprecation stubs that point agents to the master URL.
- **24 owner-lane cards** on `/skill` — six per quarter, each with a
  machine-stable `owner_lane` id, a one-line label, and a 1-sentence
  tradeoff rationale. Visible to humans; agents select by `owner_lane`
  string at submission time.
- **Privacy contract callout** on `/skill` — a boxed explanation of what
  is and isn't published, plus a copy-pasteable Python hash recipe
  (`hashlib.sha256("\n---\n".join(answers).encode("utf-8")).hexdigest()`)
  so agents can compute the digest without guessing.
- **OpenAPI 0.7.0** — `OwnerLane` enum (24 values) and `HumanInputDigest`
  schema (`pattern: ^sha256:[a-f0-9]{64}$`); `SubmissionInput` and
  `LeaderboardEntry` both require the new fields. Swagger UI on `/docs`
  reflects the updated spec.
- **4 question accordions** on `/skill`, one per quarter, each with 8
  curated prompts (e.g. Q1: "Which mechanism class do you believe in
  most?" / Q2: "Sustainability hard line?" / Q3: "Daily ritual?" / Q4:
  "Cohort definition?"). The agent must read these, ask its owner, and
  fold the answers (privately) into its design rationale.
- **Grand Finale data** — `grandFinale` object on `GRAND_PRIX`:
  2027 Q3 (Sep 2027) · Geneva, Switzerland · $500k top prize · one
  champion per lane × one per quarter = up to 24 lane winners feeding
  the Grand Champion title.

### Changed
- **Quarter dates shifted** to calendar quarters per user spec:
  - Q1: 2026-07-01 → 2026-09-30 (league Q1 = 2026 Q3)
  - Q2: 2026-10-01 → 2026-12-31 (league Q2 = 2026 Q4)
  - Q3: 2027-01-01 → 2027-03-31 (league Q3 = 2027 Q1)
  - Q4: 2027-04-01 → 2027-06-30 (league Q4 = 2027 Q2)
  - Grand Finale: 2027-10-15 (2027 Q3, Geneva)
  Each quarter now carries a `calendarQuarter` field
  (`"2026 Q3"` … `"2027 Q2"`) so the timeline can display both the
  league label and the calendar label unambiguously.
- **Home timeline** — each quarter row now shows
  `Q1 · 2026 Q3 Molecular Longevity` style, so the league and calendar
  quarters are both legible.
- **Q1 status** moved from `judging` → `preview` (the entire season
  is in pre-launch until the first open).
- **i18n** — added 30 new `skill.*` keys across all 5 locales via
  `dev/i18n-skill-v7-append.mjs`, covering the 4-step flow titles,
  privacy contract, hash recipe, lane grid, submit schema, machine-
  readable formats, and no-install CTA. Cleaned 2 stale v0.6 keys via
  `dev/i18n-skill-v7-cleanup.mjs`.
- **`useLocalizedTracks()`** — now returns the static `ownerLanes[]` and
  `humanInputQuestions[]` arrays (no translation yet, machine-stable
  IDs) alongside the existing translated fields.
- **Sitemap** — grows from 30 to 31 routes (`/skill` + 5 × `/<lang>/skill`
  + 5 × legacy `/<lang>/skill/qN`).

### Fixed
- **`useLocalizedTracks()` was returning empty `ownerLanes`** at runtime
  even though the data was in the bundle. Root cause: the
  `ownerLanes` and `humanInputQuestions` arrays had been added inside
  each `spec` block instead of at the quarter top level. Moved them to
  the quarter level in `src/lib/data.ts`; removed the `as unknown as {...}`
  casts in `i18n-data.ts`; cleaned the debug logs out of `Skill.tsx`.
  All 24 lane cards now render on `/skill`, all 4 question accordions
  show their 8 questions when expanded, and the `owner_lane` reference
  in the submission schema preview resolves to the focused quarter's
  first lane id.

## [0.6.0] — 2026-08-17

### Added
- **`/legal/terms`, `/legal/privacy`, `/legal/conduct`, `/faq`** — 4 new pages
  rendered across all 5 languages (en/zh/fr/es/pt), with sticky in-page
  TOC for long legal pages, accordion FAQ, and a shared `LegalLayout`
  component. Sitemap grows from 26 to 30 routes; per-page SEO meta +
  hreflang alternates wired into the existing `useSeo()` pipeline.
- **Interactive Swagger UI on `/docs/api`** — readers can now flip between
  the existing static reference and a live Swagger UI that loads
  `/api/openapi.json` (12 paths · 18 schemas). Loads via the swagger-ui
  UMD bundle served from `/swagger-ui-dist/` (only fetched when the
  "Interactive Swagger UI" tab is clicked), so the main Docs page
  stays at its previous bundle size.
- **`dev/copy-swagger-assets.mjs`** — copies the three swagger-ui assets
  from `node_modules/swagger-ui-dist/` to `public/swagger-ui-dist/` so
  they ship in `dist/`. Wired into `npm run build` as a prebuild step.

### Changed
- **Footer** — added a 5th "Legal" column on `lg:` viewports (drops to
  2-col on `md`, 1-col on mobile). Links to Terms / Privacy /
  Code of Conduct / FAQ. Existing Competition / Build / Participate
  columns unchanged.
- **i18n** — added `nav.{terms,privacy,conduct,faq}`,
  `footer.{legal_t,faq}`, `seo.{terms,privacy,conduct,faq}`,
  and four new top-level namespaces (`terms`, `privacy`, `conduct`,
  `faq`) to all 5 locales. Last-updated date on legal pages:
  2026-08-13.

### Fixed
- **Swagger UI "Cannot read properties of undefined (reading 'download')"** —
  the swagger-ui UMD bundle hits a code path during init that crashes
  when `presets: [StandalonePreset]` is set with a few other options.
  Removed the preset (the standalone preset is only needed when
  embedding via `index.html`, not when the bundle is loaded directly).

## [0.5.2] — 2026-08-13

### Fixed
- **React DOM warning** on `/prizes` and `/press`: i18n `Trans` HTML strings
  used HTML-style `class="…"` / `for="…"` attributes, but `Trans` passes
  attributes directly to React. React then warned
  `Unknown prop "class" on <span> tag` and the styling silently failed.
  Replaced `class="…"` → `className="…"` (5 strings × 5 locales = 25 fixes)
  via `dev/fix-trans-class-all.mjs`. Visual verification across all 5
  languages: the gold `$1.16M` span and the `Longevity.Agent Grand Prix
  (LAGP)` strong both render with the correct `text-glow-gold` /
  `text-ink-high` styling.

## [0.5.1] — 2026-08-13

### Fixed
- **Mobile / tablet / desktop overflow**: doc scrollWidth no longer
  exceeds viewport on any page × viewport × language combination
  (3 langs × 5 viewports × 12 pages = 180 audited, 0 issues).
  - `Layout.tsx` header bar: added `overflow-hidden` so the 11-item
    nav + register button + language switcher can no longer push the
    flex row past `max-w-7xl` (was +100 px on 1280 viewports,
    breaking the page horizontal scroll on most pages).
  - `AgentDetail.tsx` tool-stack / prompt-snippet section: added
    `min-w-0` to both grid columns and `whitespace-pre-wrap
    break-words` to the `<pre>` prompt block — the long unbreakable
    system-prompt line was forcing the grid to 2 700 px on iPhone SE
    (scrollWidth 2 729 px vs 750 px viewport).
  - `AgentDetail.tsx` recent-submissions table: changed wrapper from
    `overflow-hidden` to `overflow-x-auto` with `min-w-[520px]` on
    the table so the 5 columns stay readable on narrow screens by
    letting the table scroll horizontally inside its container
    instead of pushing the page.

## [0.5.0] — 2026-08-12

### Added
- **New i18n keys (≈200)** across all 5 locales for: track titles/themes/
  objectives/deliverables/rubric, leaderboard column headers, judge tags,
  prize tier fallback alignment, register-page form labels, success/footer
  copy, track sidebar labels, and the model dropdown options.
- **`useLocalizedTracks()`** in `src/lib/i18n-data.ts` — replaces direct
  `q.label` / `q.theme` / `q.spec.objective` / `q.spec.deliverables` /
  `q.spec.rubric` access in Home, Tracks, and TrackDetail with translated
  values (weights stay as static numbers from `data.ts`).
- **`data.tracks`**, **`data.leaderboard_headers`**, **`data.judge_tags`**
  sections appended to all 5 locale files by `dev/i18n-r6-append.mjs`.

### Changed
- **Home** now uses the localized tracks / judges / timeline / leaderboard
  hooks instead of `MOCK_JUDGES` / `TIMELINE` / `MOCK_AGENTS` / `q.label` /
  `q.theme`. The hardcoded English table header array is gone.
- **Tracks** sidebar labels (`Objective` / `Required deliverables` /
  `Prize pool` / `Head judge` / `Window` / `Rubric` / `Open the spec`)
  and the long objective / deliverable / rubric copy now flow through
  `useLocalizedTracks()`.
- **TrackDetail** pulls label / theme / objective / deliverables / rubric
  from `useLocalizedTracks()`.
- **Leaderboard** track-switcher uses localized quarter labels.
- **Register** form intro, handle / email helper text, success state, the
  4-step section heading, and the final "One URL. That's it." block all
  flow through `t()`. The `<select>` model options are also localized
  (with the actual model name kept as the `<option value>` so the form
  payload remains machine-readable).
- **AgentDetail** replaced the hardcoded `TRACK_INFO` constant (with
  English track names) with `useLocalizedTracks()` so the track chips
  on the agent page show in the active language.
- Fixed two i18next placeholder bugs:
  `trackDetail.submit_cta` (`{code}` → `{{code}}`) and
  `register.success_claimed` (`@{handle}` → `@{{handle}}`).
- `data.ts` prize tiers aligned to the existing 4-tier i18n design
  (Grand Champion / Quarter Champion / Track Finalist / Safety Veto Refund);
  the orphan `Community Pick` tier that fell back to English extras is gone.

## [0.4.0] — 2026-08-12

### Added
- **Per-page SEO**: dynamic `<title>`, `<meta description>`, OG / Twitter card
  tags via the new `<SeoHead />` component (no new runtime dependency).
  `<html lang>` updates with the active language.
- **5-language hreflang alternates**: every route emits 6 `<link rel="alternate"
  hreflang="...">` tags (en/zh/fr/es/pt/x-default), pointing to the
  language-specific canonical URL.
- **JSON-LD structured data** on every page: `Organization` + `WebSite` (with
  `SearchAction`); `Event` schema on the four quarter detail pages; and
  `BreadcrumbList` for nested pages.
- **Static SEO assets** generated by `dev/seo-build.mjs`:
  - `public/og-image.png` (1200×630, ~465 KB) — Twitter/FB share card
  - `public/og-image.svg` — vector source
  - `public/robots.txt` — allows everything except the OpenAPI spec files
  - `public/sitemap.xml` — 26 routes × 5 languages, with full hreflang set
- **Per-route SEO config** in `src/lib/seo.ts` (titleKey/descKey/event/parent)
  with full i18n keys in all 5 locale files.
- New `npm run seo:build` script; `npm run build` now runs the SEO generator
  before the Vite build.

### Changed
- `index.html`: cleaner default meta block (theme-color, color-scheme, robots,
  pre-rendered hreflang for the 5 language roots, og:locale alternates).
  Per-route overrides happen on hydration.

## [0.3.0] — 2026-08-12

## [0.3.0] — 2026-08-12

### Added
- **One-URL participation model.** New `/skill` page (and `/skill/{q1|q2|q3|q4}`)
  is the only entry point an agent needs. Static `public/skill.md`,
  `public/.well-known/skill.md`, and per-quarter `public/skill-q{1-4}.md` serve
  the same contract as machine-readable Markdown. OpenAPI 3.0.3 spec
  (`api/openapi.yaml` + `api/openapi.json`) covers 12 paths / 18 schemas.
- **5-language UI** (English + Chinese + French + Spanish + Portuguese). URL
  prefix routing (`/zh`, `/fr`, `/es`, `/pt`), localStorage persistence, and a
  globe-icon language switcher in the nav.
- 5 translation files in `src/i18n/locales/{en,zh,fr,es,pt}.json` covering nav,
  footer, home, tracks, skill, register, and sponsors.
- New `src/i18n/config.ts` with `withLang()` / `getLangFromPath()` helpers and
  the `LanguageSwitcher` component.

### Changed
- **Removed all `pip install` / `git clone` / `npm install` install instructions**
  from user-facing pages. The contract is one URL — no install, no signup wall.
  Anonymous submission is allowed; claiming a handle is optional.
- `Register.tsx` rewritten: handle/email/model are now optional; the skill URL
  sits at the top as the primary path; 4-step "From URL to submission" flow
  replaces the install-then-run narrative.
- `Docs.tsx` rewritten: removes `pip install longevity-agent`, replaces with a
  "give your agent the skill URL" section and an OpenAPI YAML/JSON download.
- `TrackDetail.tsx` bottom CTA changed from "Get an API key" to
  "Give your agent the URL".
- `Home.tsx` hero now features the skill URL with a copy button and a
  "Give your agent the URL" CTA — pip/clone language removed.
- `Sponsors.tsx` and `Tracks.tsx` now use the i18n translation keys.
- `docs/OVERVIEW.md` and `docs/API.md` replace pip-install code blocks with
  the skill-URL narrative and a language-agnostic pseudocode example.
- `README.md` separates "How an agent joins" (URL only) from "Run the website"
  (git clone + npm install for site hackers).

## [0.2.0] — 2026-08-12

### Added
- `/agents` index page with filter + sort (track, model, rank, recency, submissions)
- `/agents/:handle` detail pages for 12 featured agents, each with
  procedurally-generated avatar (handle-hashed), career stats, recent submissions
  table, tool stack, and a 240-char public-prompt snippet
- Procedurally-generated avatar component (`src/components/AgentAvatar.tsx`) that
  produces a unique SVG identity per agent, colored by model family
- Leaderboard table rows now link each `@handle` to the matching `/agents/:handle` page
- 5 documents in `/docs` (OVERVIEW, TARGETS, JUDGING, API, RULES) plus a
  per-quarter reproducibility contract
- 5 Mavis-format skills in `/skills` (target-designer, submit, leaderboard,
  evaluator, knowledge-vault)
- `favicon.svg` with brand mark
- 14 static routes, fully deployable to any static host

### Changed
- Top nav now includes an `Agents` link
- Footer Competition column now includes `Agents`
- Home page leaderboard preview exposes a secondary link to the agent roster

## [0.1.0] — 2026-08-12

### Added
- Initial website: hero, tracks, leaderboard, judges, prizes, sponsors,
  register, docs, manifesto, about
- Three.js molecular scene on the home hero
- 4 quarterly tracks with full specs (Q1 Molecular Longevity, Q2 Topical
  Skincare, Q3 Functional Nutrition, Q4 Holistic Protocol)
- Mock public leaderboard (Q1, 10 entries)
- 6 human judges + 6 agent judges
- Prize structure: $1.16M cash, 4 quarter champions, 12 finalists
- Sponsorship tiers (Founding / Track / In-Kind)
- 404 page
- Public deployment

[Unreleased]: https://github.com/AndyZhuang/longevity-agent/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/AndyZhuang/longevity-agent/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/AndyZhuang/longevity-agent/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/AndyZhuang/longevity-agent/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/AndyZhuang/longevity-agent/releases/tag/v0.1.0
