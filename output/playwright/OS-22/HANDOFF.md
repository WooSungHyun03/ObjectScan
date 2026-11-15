# OS-22 Team B → Owner handoff (MOCK)

Everything below is **MOCK** evidence from the key-free fixture shell (`tests/team`, no `.env`, keys, DB, GPU or PG).
TEAM_PASS means the UI and local contract were verified. It never means the real service works or anything was deployed.
SERVICE gate for every ticket: **SERVICE_PENDING** (Owner-only).

- Integration command: `npx playwright test --config playwright.team.config.ts --grep OS-22` (8 user tasks × 360/768/1440). Exit code and log are in `REPORT.md`.
- Full Team regression: `npx playwright test --config playwright.team.config.ts`: 111/111 passed, exit 0, on 2026-11-16 (branch `ticket/os-22`, built on `584e0d3` plus the OS-22 changes).
- Key-free unit tests: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` plus the Team helper tests (`mask-recovery`, `photo-diagnostics`, `order-status`, `order-terms`, `market-filters`, `view-presets`, `safe-next`): 41/41 passed. `npm run typecheck` exit 0. `npm run lint` exit 0 (8 existing warnings).
- Each OS-22 task checks: the fixture's main state, that the first Tab lands on a visible control, axe (wcag2a/2aa/21aa), no horizontal overflow, a screenshot, and that no http(s) request leaves 127.0.0.1.

## The 8 user tasks

| # | User task (audit axis) | Fixture | Ticket | TEAM | Owner / real service |
|---|---|---|---|---|---|
| 1 | Sign-up, mail wait and password recovery | `forgot-link-expired` | OS-02 | TEAM_PASS | OWNER_PENDING OWN-01 (SMTP, redirect allow-list, resend limits) |
| 2 | Photo preparation: order, exclude, sharpness/duplicate advice | `draft-diagnostics` | OS-07 | TEAM_PASS | OWNER_PENDING OWN-04 (`diagnostics` in upload-complete; `contracts/upload-diagnostics.md`) |
| 3 | Target/mask review, failure and returning to reselection | `mask-analysis-503` | OS-08 | TEAM_PASS | none (existing API) |
| 4 | Job status, failure and retry | `job-failed-retry` | OS-12 | TEAM_PASS | SERVICE_PENDING (real worker) |
| 5 | Result viewer presets and fit | `viewer-model` | OS-19 | TEAM_PASS | none |
| 6 | Marketplace search, filters and URL state | `market-list` | OS-18 | TEAM_PASS | none |
| 7 | TEST payment return: lost or duplicate response | `payment-response-lost` | OS-10 | TEAM_PASS | OWNER_PENDING OWN-03 (Toss TEST auth, webhook, ledger) |
| 8 | Orders, refund state and asset rights | `billing-orders` | OS-21 (+OS-04 terms) | TEAM_PASS | OWNER_PENDING OWN-06 (`license_snapshot` in billing API; `contracts/billing-order-terms.md`) |

## NOT_RUN / not covered

- 3D editor (select → transform → undo → save version → download): **NOT_RUN** here. There is no Team fixture for it; the real-browser evidence is the Owner's `tests/e2e/editor.spec.ts`.
- `npm test` (includes DB integration), `npm run build`, `npm run test:e2e`, Supabase migrations/RLS, real GPU, real Toss TEST, SMTP and deployment: **NOT_RUN** (Owner-only).
- Team tickets from Member A (OS-01, OS-03, OS-06, OS-09, OS-11, OS-17, OS-20): **not present** on origin/main as of 2026-11-16, so they are not in this run. OS-22's AC lists them as prerequisites; re-run `--grep OS-22` after they land and add their fixtures to the task table.
- OS-07 and OS-08 change the wizard before OS-01 (by the user's decision on 2026-11-15). Expect a merge conflict in `reconstruction-wizard.tsx` when OS-01 lands, and re-run OS-07, OS-08 and OS-10 after it.

## Known real app bugs found (not fixed, design tokens in `globals.css`)

Contrast below 4.5:1, named per spec through `checkPage(..., { contrastExclude | contrastOnly })` in `tests/team/check.ts`:
`.job-tracker` text (3.07–4.48), `.project-info p` (4.12), `.workspace-notice` (4.49), wizard muted text: step nav, footer counter, preview summary, upload hints, `.upload-guidance`, `.inline-empty small` (3.2–4.46).
Also still raw: payout status and ledger kind in billing.

## Open decisions for the Owner

1. OS-07 blurry rule is a relative placeholder (under half the median sharpness of 3+ photos). Confirm it or give a threshold.
2. Review of each Team ticket by the other team member has not happened. The doc requires it for Team completion.
