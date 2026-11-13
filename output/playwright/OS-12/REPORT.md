# OS-12 team fixture report

- Commit: `ae93a58` (uncommitted changes)
- Command: `npx playwright test --config playwright.team.config.ts --grep OS-12 --reporter=line`
- Exit code: 0
- Data: **MOCK** (fixture shell, no keys / DB / GPU / PG)
- TEAM gate: **TEAM_PASS**
- SERVICE gate: **SERVICE_PENDING**. Real DB/RLS/GPU/PG/deploy verification is Owner-only and not claimed here. Nothing is deployed.

## Log (redacted)

```
Running 9 tests using 1 worker

[1/9] [360] › tests/team/os-12.spec.ts:21:1 › OS-12 job fixture: failed state, keyboard retry reaches queue
[2/9] [360] › tests/team/os-12.spec.ts:40:1 › OS-12 order fixture: provider error hidden, same order re-confirms
[3/9] [360] › tests/team/os-12.spec.ts:57:1 › OS-12 unknown API route fails loudly instead of passing
[4/9] [768] › tests/team/os-12.spec.ts:21:1 › OS-12 job fixture: failed state, keyboard retry reaches queue
[5/9] [768] › tests/team/os-12.spec.ts:40:1 › OS-12 order fixture: provider error hidden, same order re-confirms
[6/9] [768] › tests/team/os-12.spec.ts:57:1 › OS-12 unknown API route fails loudly instead of passing
[7/9] [1440] › tests/team/os-12.spec.ts:21:1 › OS-12 job fixture: failed state, keyboard retry reaches queue
[8/9] [1440] › tests/team/os-12.spec.ts:40:1 › OS-12 order fixture: provider error hidden, same order re-confirms
[9/9] [1440] › tests/team/os-12.spec.ts:57:1 › OS-12 unknown API route fails loudly instead of passing
  9 passed (5.0s)
```
