# OS-19 team fixture report

- Commit: `c40c69b`
- Command: `npx playwright test --config playwright.team.config.ts --grep OS-19 --reporter=line`
- Exit code: 0
- Data: **MOCK** (fixture shell, no keys / DB / GPU / PG)
- TEAM gate: **TEAM_PASS**
- SERVICE gate: **SERVICE_PENDING**. Real DB/RLS/GPU/PG/deploy verification is Owner-only and not claimed here. Nothing is deployed.

## Log (redacted)

```
Running 9 tests using 1 worker

[1/9] [360] › tests/team/os-19.spec.ts:26:1 › OS-19 view presets move the camera to the matching file axis
[2/9] [360] › tests/team/os-19.spec.ts:44:1 › OS-19 fit brings an over-zoomed camera back to the whole model
[3/9] [360] › tests/team/os-19.spec.ts:64:1 › OS-19 load failure is explained and view tools stay disabled
[4/9] [768] › tests/team/os-19.spec.ts:26:1 › OS-19 view presets move the camera to the matching file axis
[5/9] [768] › tests/team/os-19.spec.ts:44:1 › OS-19 fit brings an over-zoomed camera back to the whole model
[6/9] [768] › tests/team/os-19.spec.ts:64:1 › OS-19 load failure is explained and view tools stay disabled
[7/9] [1440] › tests/team/os-19.spec.ts:26:1 › OS-19 view presets move the camera to the matching file axis
[8/9] [1440] › tests/team/os-19.spec.ts:44:1 › OS-19 fit brings an over-zoomed camera back to the whole model
[9/9] [1440] › tests/team/os-19.spec.ts:64:1 › OS-19 load failure is explained and view tools stay disabled
  9 passed (42.5s)
```
