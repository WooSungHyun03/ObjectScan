# OS-22 team fixture report

- Commit: `027295a`
- Command: `npx playwright test --config playwright.team.config.ts --grep OS-22 --reporter=line`
- Exit code: 0
- Data: **MOCK** (fixture shell, no keys / DB / GPU / PG)
- TEAM gate: **TEAM_PASS**
- SERVICE gate: **SERVICE_PENDING**. Real DB/RLS/GPU/PG/deploy verification is Owner-only and not claimed here. Nothing is deployed.

## Log (redacted)

```
Running 24 tests using 1 worker

[1/24] [360] › tests/team/os-22.spec.ts:72:3 › OS-22 1-auth-recovery (OS-02) runs with no keys, DB, GPU or PG
[2/24] [360] › tests/team/os-22.spec.ts:72:3 › OS-22 2-photo-prep (OS-07) runs with no keys, DB, GPU or PG
[3/24] [360] › tests/team/os-22.spec.ts:72:3 › OS-22 3-mask-recovery (OS-08) runs with no keys, DB, GPU or PG
[4/24] [360] › tests/team/os-22.spec.ts:72:3 › OS-22 4-job-failure (OS-12) runs with no keys, DB, GPU or PG
[5/24] [360] › tests/team/os-22.spec.ts:72:3 › OS-22 5-viewer (OS-19) runs with no keys, DB, GPU or PG
[6/24] [360] › tests/team/os-22.spec.ts:72:3 › OS-22 6-market (OS-18) runs with no keys, DB, GPU or PG
[7/24] [360] › tests/team/os-22.spec.ts:72:3 › OS-22 7-payment-return (OS-10) runs with no keys, DB, GPU or PG
[8/24] [360] › tests/team/os-22.spec.ts:72:3 › OS-22 8-orders-rights (OS-21) runs with no keys, DB, GPU or PG
[9/24] [768] › tests/team/os-22.spec.ts:72:3 › OS-22 1-auth-recovery (OS-02) runs with no keys, DB, GPU or PG
[10/24] [768] › tests/team/os-22.spec.ts:72:3 › OS-22 2-photo-prep (OS-07) runs with no keys, DB, GPU or PG
[11/24] [768] › tests/team/os-22.spec.ts:72:3 › OS-22 3-mask-recovery (OS-08) runs with no keys, DB, GPU or PG
[12/24] [768] › tests/team/os-22.spec.ts:72:3 › OS-22 4-job-failure (OS-12) runs with no keys, DB, GPU or PG
[13/24] [768] › tests/team/os-22.spec.ts:72:3 › OS-22 5-viewer (OS-19) runs with no keys, DB, GPU or PG
[14/24] [768] › tests/team/os-22.spec.ts:72:3 › OS-22 6-market (OS-18) runs with no keys, DB, GPU or PG
[15/24] [768] › tests/team/os-22.spec.ts:72:3 › OS-22 7-payment-return (OS-10) runs with no keys, DB, GPU or PG
[16/24] [768] › tests/team/os-22.spec.ts:72:3 › OS-22 8-orders-rights (OS-21) runs with no keys, DB, GPU or PG
[17/24] [1440] › tests/team/os-22.spec.ts:72:3 › OS-22 1-auth-recovery (OS-02) runs with no keys, DB, GPU or PG
[18/24] [1440] › tests/team/os-22.spec.ts:72:3 › OS-22 2-photo-prep (OS-07) runs with no keys, DB, GPU or PG
[19/24] [1440] › tests/team/os-22.spec.ts:72:3 › OS-22 3-mask-recovery (OS-08) runs with no keys, DB, GPU or PG
[20/24] [1440] › tests/team/os-22.spec.ts:72:3 › OS-22 4-job-failure (OS-12) runs with no keys, DB, GPU or PG
[21/24] [1440] › tests/team/os-22.spec.ts:72:3 › OS-22 5-viewer (OS-19) runs with no keys, DB, GPU or PG
[22/24] [1440] › tests/team/os-22.spec.ts:72:3 › OS-22 6-market (OS-18) runs with no keys, DB, GPU or PG
[23/24] [1440] › tests/team/os-22.spec.ts:72:3 › OS-22 7-payment-return (OS-10) runs with no keys, DB, GPU or PG
[24/24] [1440] › tests/team/os-22.spec.ts:72:3 › OS-22 8-orders-rights (OS-21) runs with no keys, DB, GPU or PG
  24 passed (37.8s)
```
