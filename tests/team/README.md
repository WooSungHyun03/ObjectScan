# Team fixture shell (MOCK)

Renders real app components with no `.env`, keys, DB, GPU or PG. Not part of the Next build, routes or auth.

- Run one ticket: `npx playwright test --config playwright.team.config.ts --grep OS-<n>`
- Run plus evidence report: `node scripts/team-report.mjs OS-<n>` → `output/playwright/OS-<n>/REPORT.md`
- Browse fixtures: `npx vite --config tests/team/vite.config.ts` → http://127.0.0.1:4317/
- Add a fixture: add an entry in `fixture/fixtures.tsx` (routes are `"METHOD path"` under `/api/`, unknown routes return 404), then add a `tests/team/os-<n>.spec.ts` whose test titles start with `OS-<n>`. Use `check.ts` (`shooter`, `checkPage`) for screenshots, overflow and axe; name known app contrast bugs via `contrastExclude`/`contrastOnly` instead of skipping axe.
- Integration run (OS-22): `--grep OS-22` runs the 8 user tasks; the full suite is the command without `--grep`. Owner handoff: `output/playwright/OS-22/HANDOFF.md`.

A pass here is TEAM_PASS only. Real-service verification (SERVICE) is Owner-only.
