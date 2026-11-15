# OS-21 team fixture report

- Commit: `7913968` (uncommitted changes)
- Command: `npx playwright test --config playwright.team.config.ts --grep OS-21 --reporter=line`
- Exit code: 0
- Data: **MOCK** (fixture shell, no keys / DB / GPU / PG)
- TEAM gate: **TEAM_PASS**
- SERVICE gate: **SERVICE_PENDING**. Real DB/RLS/GPU/PG/deploy verification is Owner-only and not claimed here. Nothing is deployed.

## Log (redacted)

```
Running 12 tests using 1 worker

[1/12] [360] › tests/team/os-21.spec.ts:10:1 › OS-21 orders show Korean status, TEST marker, amount and the asset link
[2/12] [360] › tests/team/os-21.spec.ts:45:1 › OS-21 refunded asset download is denied without claiming access
[3/12] [360] › tests/team/os-21.spec.ts:57:1 › OS-21 billing 503 shows a safe error and recovers on retry
[4/12] [360] › tests/team/os-22.spec.ts:72:3 › OS-22 8-orders-rights (OS-21) runs with no keys, DB, GPU or PG
[5/12] [768] › tests/team/os-21.spec.ts:10:1 › OS-21 orders show Korean status, TEST marker, amount and the asset link
[6/12] [768] › tests/team/os-21.spec.ts:45:1 › OS-21 refunded asset download is denied without claiming access
[7/12] [768] › tests/team/os-21.spec.ts:57:1 › OS-21 billing 503 shows a safe error and recovers on retry
[8/12] [768] › tests/team/os-22.spec.ts:72:3 › OS-22 8-orders-rights (OS-21) runs with no keys, DB, GPU or PG
[9/12] [1440] › tests/team/os-21.spec.ts:10:1 › OS-21 orders show Korean status, TEST marker, amount and the asset link
[10/12] [1440] › tests/team/os-21.spec.ts:45:1 › OS-21 refunded asset download is denied without claiming access
[11/12] [1440] › tests/team/os-21.spec.ts:57:1 › OS-21 billing 503 shows a safe error and recovers on retry
[12/12] [1440] › tests/team/os-22.spec.ts:72:3 › OS-22 8-orders-rights (OS-21) runs with no keys, DB, GPU or PG
  12 passed (15.2s)
```
