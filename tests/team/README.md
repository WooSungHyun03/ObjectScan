# Team fixture shell (MOCK)

Renders real app components with no `.env`, keys, DB, GPU or PG. Not part of the Next build, routes or auth.

- Run one ticket: `npx playwright test --config playwright.team.config.ts --grep OS-<n>`
- Run plus evidence report: `node scripts/team-report.mjs OS-<n>` → `output/playwright/OS-<n>/REPORT.md`
- Browse fixtures: `npx vite --config tests/team/vite.config.ts` → http://127.0.0.1:4317/
- Add a fixture: add an entry in `fixture/fixtures.tsx` (routes are `"METHOD path"` under `/api/`, unknown routes return 404), then add a `tests/team/os-<n>.spec.ts` whose test titles start with `OS-<n>`.

A pass here is TEAM_PASS only. Real-service verification (SERVICE) is Owner-only.
