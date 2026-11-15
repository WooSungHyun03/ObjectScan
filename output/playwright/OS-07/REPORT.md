# OS-07 team fixture report

- Commit: `76ef30f`
- Command: `npx playwright test --config playwright.team.config.ts --grep OS-07 --reporter=line`
- Exit code: 0
- Data: **MOCK** (fixture shell, no keys / DB / GPU / PG)
- TEAM gate: **TEAM_PASS**
- SERVICE gate: **SERVICE_PENDING**. Real DB/RLS/GPU/PG/deploy verification is Owner-only and not claimed here. Nothing is deployed.

## Log (redacted)

```
Running 6 tests using 1 worker

[1/6] [360] › tests/team/os-07.spec.ts:17:1 › OS-07 duplicate, blurry and unchecked photos get distinct advice and the user may still proceed
[2/6] [360] › tests/team/os-07.spec.ts:35:1 › OS-07 keyboard reorder and exclude match what is uploaded
[3/6] [768] › tests/team/os-07.spec.ts:17:1 › OS-07 duplicate, blurry and unchecked photos get distinct advice and the user may still proceed
[4/6] [768] › tests/team/os-07.spec.ts:35:1 › OS-07 keyboard reorder and exclude match what is uploaded
[5/6] [1440] › tests/team/os-07.spec.ts:17:1 › OS-07 duplicate, blurry and unchecked photos get distinct advice and the user may still proceed
[6/6] [1440] › tests/team/os-07.spec.ts:35:1 › OS-07 keyboard reorder and exclude match what is uploaded
  6 passed (6.9s)
```
