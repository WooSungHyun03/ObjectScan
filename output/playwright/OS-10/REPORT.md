# OS-10 team fixture report

- Commit: `ec4590c`
- Command: `npx playwright test --config playwright.team.config.ts --grep OS-10 --reporter=line`
- Exit code: 0
- Data: **MOCK** (fixture shell, no keys / DB / GPU / PG)
- TEAM gate: **TEAM_PASS**
- SERVICE gate: **SERVICE_PENDING**. Real DB/RLS/GPU/PG/deploy verification is Owner-only and not claimed here. Nothing is deployed.

## Log (redacted)

```
Running 15 tests using 1 worker

[1/15] [360] › tests/team/os-10.spec.ts:17:1 › OS-10 lost approval response: re-check reads the server state and completes once
[2/15] [360] › tests/team/os-10.spec.ts:44:3 › OS-10 payment-amount-mismatch: no completion, no entitlement, order history only
[3/15] [360] › tests/team/os-10.spec.ts:44:3 › OS-10 payment-expired: no completion, no entitlement, order history only
[4/15] [360] › tests/team/os-10.spec.ts:57:1 › OS-10 refunded order is never shown as a successful purchase
[5/15] [360] › tests/team/os-10.spec.ts:67:1 › OS-10 purchase button ignores a second click while the order request is in flight
[6/15] [768] › tests/team/os-10.spec.ts:17:1 › OS-10 lost approval response: re-check reads the server state and completes once
[7/15] [768] › tests/team/os-10.spec.ts:44:3 › OS-10 payment-amount-mismatch: no completion, no entitlement, order history only
[8/15] [768] › tests/team/os-10.spec.ts:44:3 › OS-10 payment-expired: no completion, no entitlement, order history only
[9/15] [768] › tests/team/os-10.spec.ts:57:1 › OS-10 refunded order is never shown as a successful purchase
[10/15] [768] › tests/team/os-10.spec.ts:67:1 › OS-10 purchase button ignores a second click while the order request is in flight
[11/15] [1440] › tests/team/os-10.spec.ts:17:1 › OS-10 lost approval response: re-check reads the server state and completes once
[12/15] [1440] › tests/team/os-10.spec.ts:44:3 › OS-10 payment-amount-mismatch: no completion, no entitlement, order history only
[13/15] [1440] › tests/team/os-10.spec.ts:44:3 › OS-10 payment-expired: no completion, no entitlement, order history only
[14/15] [1440] › tests/team/os-10.spec.ts:57:1 › OS-10 refunded order is never shown as a successful purchase
[15/15] [1440] › tests/team/os-10.spec.ts:67:1 › OS-10 purchase button ignores a second click while the order request is in flight
  15 passed (19.0s)
```
