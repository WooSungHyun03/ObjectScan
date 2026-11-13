# OS-04 team fixture report

- Commit: `ba6a78b`
- Command: `npx playwright test --config playwright.team.config.ts --grep OS-04 --reporter=line`
- Exit code: 0
- Data: **MOCK** (fixture shell, no keys / DB / GPU / PG)
- TEAM gate: **TEAM_PASS**
- SERVICE gate: **SERVICE_PENDING**. Real DB/RLS/GPU/PG/deploy verification is Owner-only and not claimed here. Nothing is deployed.

## Log (redacted)

```
Running 6 tests using 1 worker

[1/6] [360] › tests/team/os-04.spec.ts:13:1 › OS-04 order shows purchase-time terms; legacy order is not backfilled
[2/6] [360] › tests/team/os-04.spec.ts:32:1 › OS-04 billing lookup error shows only the error and a retry
[3/6] [768] › tests/team/os-04.spec.ts:13:1 › OS-04 order shows purchase-time terms; legacy order is not backfilled
[4/6] [768] › tests/team/os-04.spec.ts:32:1 › OS-04 billing lookup error shows only the error and a retry
[5/6] [1440] › tests/team/os-04.spec.ts:13:1 › OS-04 order shows purchase-time terms; legacy order is not backfilled
[6/6] [1440] › tests/team/os-04.spec.ts:32:1 › OS-04 billing lookup error shows only the error and a retry
  6 passed (6.0s)
```
