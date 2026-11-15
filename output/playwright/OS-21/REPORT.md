# OS-21 team fixture report

- Commit: `d7d05c3`
- Command: `npx playwright test --config playwright.team.config.ts --grep OS-21 --reporter=line`
- Exit code: 0
- Data: **MOCK** (fixture shell, no keys / DB / GPU / PG)
- TEAM gate: **TEAM_PASS**
- SERVICE gate: **SERVICE_PENDING**. Real DB/RLS/GPU/PG/deploy verification is Owner-only and not claimed here. Nothing is deployed.

## Log (redacted)

```
Running 9 tests using 1 worker

[1/9] [360] › tests/team/os-21.spec.ts:20:1 › OS-21 orders show Korean status, TEST marker, amount and the asset link
[2/9] [360] › tests/team/os-21.spec.ts:47:1 › OS-21 refunded asset download is denied without claiming access
[3/9] [360] › tests/team/os-21.spec.ts:59:1 › OS-21 billing 503 shows a safe error and recovers on retry
[4/9] [768] › tests/team/os-21.spec.ts:20:1 › OS-21 orders show Korean status, TEST marker, amount and the asset link
[5/9] [768] › tests/team/os-21.spec.ts:47:1 › OS-21 refunded asset download is denied without claiming access
[6/9] [768] › tests/team/os-21.spec.ts:59:1 › OS-21 billing 503 shows a safe error and recovers on retry
[7/9] [1440] › tests/team/os-21.spec.ts:20:1 › OS-21 orders show Korean status, TEST marker, amount and the asset link
[8/9] [1440] › tests/team/os-21.spec.ts:47:1 › OS-21 refunded asset download is denied without claiming access
[9/9] [1440] › tests/team/os-21.spec.ts:59:1 › OS-21 billing 503 shows a safe error and recovers on retry
  9 passed (11.3s)
```
