# OS-02 team fixture report

- Commit: `b9cda25`
- Command: `npx playwright test --config playwright.team.config.ts --grep OS-02 --reporter=line`
- Exit code: 0
- Data: **MOCK** (fixture shell, no keys / DB / GPU / PG)
- TEAM gate: **TEAM_PASS**
- SERVICE gate: **SERVICE_PENDING**. Real DB/RLS/GPU/PG/deploy verification is Owner-only and not claimed here. Nothing is deployed.

## Log (redacted)

```
Running 12 tests using 1 worker

[1/12] [360] › tests/team/os-02.spec.ts:18:1 › OS-02 unconfirmed signup waits, blocks the workspace and rate-limits resend
[2/12] [360] › tests/team/os-02.spec.ts:46:1 › OS-02 expired reset link points to a new link and keeps the email
[3/12] [360] › tests/team/os-02.spec.ts:70:1 › OS-02 login ignores an external next URL and goes to the dashboard
[4/12] [360] › tests/team/os-02.spec.ts:79:1 › OS-02 login shows the callback's confirmation failure in Korean
[5/12] [768] › tests/team/os-02.spec.ts:18:1 › OS-02 unconfirmed signup waits, blocks the workspace and rate-limits resend
[6/12] [768] › tests/team/os-02.spec.ts:46:1 › OS-02 expired reset link points to a new link and keeps the email
[7/12] [768] › tests/team/os-02.spec.ts:70:1 › OS-02 login ignores an external next URL and goes to the dashboard
[8/12] [768] › tests/team/os-02.spec.ts:79:1 › OS-02 login shows the callback's confirmation failure in Korean
[9/12] [1440] › tests/team/os-02.spec.ts:18:1 › OS-02 unconfirmed signup waits, blocks the workspace and rate-limits resend
[10/12] [1440] › tests/team/os-02.spec.ts:46:1 › OS-02 expired reset link points to a new link and keeps the email
[11/12] [1440] › tests/team/os-02.spec.ts:70:1 › OS-02 login ignores an external next URL and goes to the dashboard
[12/12] [1440] › tests/team/os-02.spec.ts:79:1 › OS-02 login shows the callback's confirmation failure in Korean
  12 passed (7.8s)
```
