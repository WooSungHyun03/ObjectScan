# OS-18 team fixture report

- Commit: `58303d5`
- Command: `npx playwright test --config playwright.team.config.ts --grep OS-18 --reporter=line`
- Exit code: 0
- Data: **MOCK** (fixture shell, no keys / DB / GPU / PG)
- TEAM gate: **TEAM_PASS**
- SERVICE gate: **SERVICE_PENDING**. Real DB/RLS/GPU/PG/deploy verification is Owner-only and not claimed here. Nothing is deployed.

## Log (redacted)

```
Running 9 tests using 1 worker

[1/9] [360] › tests/team/os-18.spec.ts:18:1 › OS-18 license and price filters narrow the loaded list
[2/9] [360] › tests/team/os-18.spec.ts:35:1 › OS-18 back from a detail page restores query, category, sort and filters
[3/9] [360] › tests/team/os-18.spec.ts:54:1 › OS-18 list failure is distinct from loading/empty; retry keeps the inputs
[4/9] [768] › tests/team/os-18.spec.ts:18:1 › OS-18 license and price filters narrow the loaded list
[5/9] [768] › tests/team/os-18.spec.ts:35:1 › OS-18 back from a detail page restores query, category, sort and filters
[6/9] [768] › tests/team/os-18.spec.ts:54:1 › OS-18 list failure is distinct from loading/empty; retry keeps the inputs
[7/9] [1440] › tests/team/os-18.spec.ts:18:1 › OS-18 license and price filters narrow the loaded list
[8/9] [1440] › tests/team/os-18.spec.ts:35:1 › OS-18 back from a detail page restores query, category, sort and filters
[9/9] [1440] › tests/team/os-18.spec.ts:54:1 › OS-18 list failure is distinct from loading/empty; retry keeps the inputs
  9 passed (16.2s)
```
