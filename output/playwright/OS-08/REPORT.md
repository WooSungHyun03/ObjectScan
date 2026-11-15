# OS-08 team fixture report

- Commit: `3efd9cf`
- Command: `npx playwright test --config playwright.team.config.ts --grep OS-08 --reporter=line`
- Exit code: 0
- Data: **MOCK** (fixture shell, no keys / DB / GPU / PG)
- TEAM gate: **TEAM_PASS**
- SERVICE gate: **SERVICE_PENDING**. Real DB/RLS/GPU/PG/deploy verification is Owner-only and not claimed here. Nothing is deployed.

## Log (redacted)

```
Running 12 tests using 1 worker

[1/12] [360] › tests/team/os-08.spec.ts:27:1 › OS-08 mask request 503 returns to reselection without re-uploading
[2/12] [360] › tests/team/os-08.spec.ts:42:1 › OS-08 failed photo link, keyboard approval and exclusion keep focus and announce state
[3/12] [360] › tests/team/os-08.spec.ts:68:1 › OS-08 stale approval is not shown as done and asks for re-review
[4/12] [360] › tests/team/os-08.spec.ts:82:1 › OS-08 another user's project shows not-found without details
[5/12] [768] › tests/team/os-08.spec.ts:27:1 › OS-08 mask request 503 returns to reselection without re-uploading
[6/12] [768] › tests/team/os-08.spec.ts:42:1 › OS-08 failed photo link, keyboard approval and exclusion keep focus and announce state
[7/12] [768] › tests/team/os-08.spec.ts:68:1 › OS-08 stale approval is not shown as done and asks for re-review
[8/12] [768] › tests/team/os-08.spec.ts:82:1 › OS-08 another user's project shows not-found without details
[9/12] [1440] › tests/team/os-08.spec.ts:27:1 › OS-08 mask request 503 returns to reselection without re-uploading
[10/12] [1440] › tests/team/os-08.spec.ts:42:1 › OS-08 failed photo link, keyboard approval and exclusion keep focus and announce state
[11/12] [1440] › tests/team/os-08.spec.ts:68:1 › OS-08 stale approval is not shown as done and asks for re-review
[12/12] [1440] › tests/team/os-08.spec.ts:82:1 › OS-08 another user's project shows not-found without details
  12 passed (38.5s)
```
