# Work plan — three tracks, fourteen days

A owns UI, B GPU, C data/platform. Shared contracts are integrated before features. All tasks follow implement → tests → fix → integration; blocked model work does not block independent UI/platform work.

| Task      | Track / days     | Acceptance                                                                                              | State                                                                    |
| --------- | ---------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| AUD-01    | B/C day 1        | Pinned source audit, GPU inventory, explicit output/dependency risks                                    | Source audit complete; model smoke pending                               |
| ENG-01    | C day 1          | Monorepo, strict checks, CI, security instructions, shared contracts                                    | Implemented; local checks pass; remote CI pending push                   |
| UI-01     | A days 1–2       | New graphite/mint design, reference-matched landing, two-mode wizard, viewer; 360px/desktop screenshots | New UI implemented; desktop/375px E2E pass; visual QA continuing         |
| DB-01     | C days 1–2       | Local Supabase schema/RLS/storage, two-user and atomic claim SQL tests                                  | 9 migrations applied; RLS/concurrency/finance tests pass locally         |
| AUTH-01   | A/C days 3–4     | Email signup/login/confirmation/reset/logout and server identity tests                                  | Signup/email confirmation/reset/login/logout browser flow passes locally |
| FILE-01   | A/C days 3–5     | Private upload, bounded decode, reorder/exclude and ownership tests                                     | Real signed upload/decoding/owner checks pass; retention work pending    |
| GPU-01    | B days 1–3       | Three isolated environments and real smoke reports, no false validation flags                           | SAM2 CUDA passed; Pixal/OAL environments preparing; GW pending           |
| MASK-01   | A/B days 4–6     | SAM2 selection, reviewed masks, crop/intrinsics alignment and turntable warning                         | Single-image real browser/worker/review pass; multi-view pending         |
| QUEUE-01  | B/C days 5–7     | Outbound worker, one global GPU lease, heartbeat/cancel/OOM/process kill/recovery tests                 | Atomic slot/lease/cancel/timeout/child kill pass; hardware OOM pending   |
| PIX-01    | B days 5–7       | Real 1/4-view Pixal3D textured GLB within 16GB                                                          | Pending                                                                  |
| OAL-01    | B days 8–10      | Real 21+ masked 2DGS + TSDF + UV bake GLB                                                               | Pending                                                                  |
| SCENE-01  | B days 11–12     | Full scene GW + refinement + UV GLB, no masks                                                           | Pending                                                                  |
| PAY-01    | C days 9–11      | Toss sandbox confirm/webhook/idempotent ledger/amount denial tests                                      | Settlement/amount/idempotency tests pass; hosted Toss test pending keys  |
| MARKET-01 | A/C days 9–11    | Consent publish/moderation/purchase entitlements/fee/payout-request ledger                              | Entitlement/fee/payout DB tests pass; full purchase E2E pending          |
| QA-01     | A/B/C days 12–14 | E2E, security, responsive comparison, worker/GPU reports, release gates                                 | 33 Node/DB +15 Python +3 browser +1 real SAM2 GPU browser pass           |
| DEPLOY-01 | C days 12–14     | GitHub Actions + independent Vercel preview + Supabase migration/runbook                                | Independent Vercel preview READY; hosted Supabase/GitHub App pending     |

## Design plan / UI-01

The supplied reference is authoritative: graphite #0D1317, panels #151C21 / #1B2529, hairlines #304047, restrained mint #A9F5CD, foreground #F6F7F4, secondary #9BABAE. Use Geist for Latin / available Korean sans fallback, strong editorial headings and readable normal-weight body text. Landing uses left-aligned message and a large image-to-textured/wireframe object visual. Mode selection is a primary navigation decision. Workspace is an actual upload/configure/viewer layout, not the reference image flattened into a page. Scene bypasses masking, object exposes selection and masks. No invented revenue, benchmark or subscription prices from the illustration.
