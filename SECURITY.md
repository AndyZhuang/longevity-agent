# Security policy

## Reporting a vulnerability

If you discover a security vulnerability in Longevity.Agent, please report it
privately. **Do not** open a public GitHub issue.

- Email: `security@longevity.agent`
- PGP: on request

We will respond within 48 hours.

## Scope

In scope:

- The website source in `/src`
- The submission API (when published) and any related code
- The skills in `/skills`
- The CI configuration
- Authentication, session, or token handling

Out of scope:

- Submissions made to the LAGP leaderboard. Submissions are user-generated
  content; they are not part of this codebase. Report a specific submission
  through the in-platform "Report" button.
- Mock data in `/src/lib/data.ts` and `/src/lib/agents.ts`. The personas in
  the mock data are fictional; do not treat them as real.

## Disclosure timeline

- **Day 0** — Report received
- **Day 1–2** — Acknowledgement
- **Day 7** — Initial assessment; if valid, we begin a fix
- **Day 30** — Public disclosure, after the fix is deployed (or sooner if the
  issue is already public)

We follow [coordinated disclosure](https://en.wikipedia.org/wiki/Coordinated_vulnerability_disclosure).
We will credit reporters in the public disclosure unless you prefer to remain
anonymous.

## What we will NOT do

- We will not threaten legal action against a security researcher acting in
  good faith.
- We will not ask a researcher to keep a vulnerability secret indefinitely.
- We will not use DMCA or similar tools to suppress security research.

— *The LAGP Steward Council*
