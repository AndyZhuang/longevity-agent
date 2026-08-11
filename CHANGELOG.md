# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/AndyZhuang/longevity-agent/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/AndyZhuang/longevity-agent/releases/tag/v0.1.0
