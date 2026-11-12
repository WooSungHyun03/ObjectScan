# Work plan — three tracks, fourteen days

A owns UI, B GPU, C data/platform. Shared contracts are integrated before features. All tasks follow implement → tests → fix → integration; blocked model work does not block independent UI/platform work.

| Task      | Track / days     | Acceptance                                                                                              | State                                                                                                                                                           |
| --------- | ---------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AUD-01    | B/C day 1        | Pinned source audit, GPU inventory, explicit output/dependency risks                                    | Source audit complete; model smoke pending                                                                                                                      |
| ENG-01    | C day 1          | Monorepo, strict checks, CI, security instructions, shared contracts                                    | Implemented; remote platform and worker CI pass at 634e1c5                                                                                                      |
| UI-01     | A days 1–2       | New graphite/mint design, reference-matched landing, two-mode wizard, viewer; 360px/desktop screenshots | New UI implemented; desktop/360px E2E pass; visual QA continuing                                                                                                |
| DB-01     | C days 1–2       | Local Supabase schema/RLS/storage, two-user and atomic claim SQL tests                                  | 11 migrations applied; RLS/concurrency/finance tests pass locally                                                                                               |
| AUTH-01   | A/C days 3–4     | Email signup/login/confirmation/reset/logout and server identity tests                                  | Signup/email confirmation/reset/login/logout browser flow passes locally                                                                                        |
| FILE-01   | A/C days 3–5     | Private upload, bounded decode, reorder/exclude and ownership tests                                     | Signed upload/decoding/owner and expired-upload cleanup pass; verified-data retention pending                                                                   |
| GPU-01    | B days 1–3       | Three isolated environments and real smoke reports, no false validation flags                           | SAM2 CUDA and Pixal single FP16/OAL21 outputs pass; GW meshing recovery in progress                                                                             |
| MASK-01   | A/B days 4–6     | SAM2 selection, reviewed masks, crop/intrinsics alignment and turntable warning                         | Hosted browser/queue/CUDA/private mask/review pass;21-view propagation pass; all-view review pending                                                            |
| QUEUE-01  | B/C days 5–7     | Outbound worker, one global GPU lease, heartbeat/cancel/OOM/process kill/recovery tests                 | Atomic slot/lease/cancel/timeout/child kill pass; actual Pixal OOM classified; FP16 retry passed                                                                |
| PIX-01    | B days 5–7       | Real 1/4-view Pixal3D textured GLB within 16GB                                                          | Single opt-in NAF FP16 passed; upstream FP32 OOM; four-view NAF512/FP16 diagnostic artifact + private viewer pass; actual captured/SAM2 multi-view path pending |
| OAL-01    | B days 8–10      | Real 21+ masked 2DGS + TSDF + UV bake GLB                                                               | Actual21 full30k UV GLB/semantic/viewer pass; fragmented geometry fails visual quality                                                                          |
| SCENE-01  | B days 11–12     | Full scene GW + refinement + UV GLB, no masks                                                           | Actual32 training/extraction/UV GLB/private viewer pass; fragmented geometry fails visual quality                                                               |
| PAY-01    | C days 9–11      | Toss sandbox confirm/webhook/idempotent ledger/amount denial tests                                      | Settlement/refund/repurchase tests pass; user requested payments remain disabled                                                                                |
| MARKET-01 | A/C days 9–11    | Consent publish/moderation/purchase entitlements/fee/payout-request ledger                              | Entitlement/fee/payout DB tests pass; full purchase E2E pending                                                                                                 |
| QA-01     | A/B/C days 12–14 | E2E, security, responsive comparison, worker/GPU reports, release gates                                 | 44 Node/DB +25 Python +3 production-build browser +2 OAL artifact checks pass; real SAM2 GPU browser passed before this slice                                   |
| DEPLOY-01 | C days 12–14     | GitHub Actions + independent Vercel preview + Supabase migration/runbook                                | Dedicated ObjectScan Supabase created, 11 hosted migrations applied; Preview login/upload/private download/RLS/mobile checks pass; SMTP and GitHub App pending  |

## Design plan / UI-01

Historical v2 design (superseded by mascot v3): graphite #0D1317, panels #151C21 / #1B2529, hairlines #304047, restrained mint #A9F5CD, foreground #F6F7F4, secondary #9BABAE. Use Geist for Latin / available Korean sans fallback, strong editorial headings and readable normal-weight body text. Landing uses left-aligned message and a large image-to-textured/wireframe object visual. Mode selection is a primary navigation decision. Workspace is an actual upload/configure/viewer layout, not the reference image flattened into a page. Scene bypasses masking, object exposes selection and masks. No invented revenue, benchmark or subscription prices from the illustration.

## Tracking and latest integration loop (2026-11-10)

- [Frontend track #3](https://github.com/WooSungHyun03/ObjectScan/issues/3), [GPU track #2](https://github.com/WooSungHyun03/ObjectScan/issues/2), [Platform track #4](https://github.com/WooSungHyun03/ObjectScan/issues/4). Integration is reviewed in [draft PR #1](https://github.com/WooSungHyun03/ObjectScan/pull/1); main remains documentation-only.
- PAY-01: added sandbox full refunds, authenticated provider re-query, exact total/balance/cancellation validation, idempotent ledger reversal, revoked entitlement/re-purchase and operator review. Local DB + explicitly mocked-provider tests pass; real Toss sandbox still needs keys. Production finance remains disabled.
- QA-01: malformed/nonfinite GLB coordinates, zero-area geometry/UV and negative offsets now reject. Browser tests exercise 360px billing/refund request, owner checks and non-admin denial; screenshots now wait for actual decoded model readiness.
- ENG-01: first remote platform CI passed, but worker CI exposed setuptools namespace auto-discovery of environments/. Added explicit objectscan_worker package discovery; fresh editable installation and 15 Python tests pass locally. Remote worker and platform CI now pass at 634e1c5.
- GPU-01: added bounded hardware harness and systemd template. Template requires host provisioning and has not been installed as a service here. All reconstruction models remain disabled until actual output/VRAM/visual gates pass.

## Resume loop: hosted infrastructure and GPU outputs

- User explicitly authorized stopping/removing AISaaS for free capacity. Paused AISaaS (`dvkfvommrhvlvuccxgeh`) through the Management API; verified INACTIVE. SceneScan remains ACTIVE_HEALTHY. Created ObjectScan (`ctdzibelbwaujvngmxgg`) in Seoul and applied all 11 migrations. Only Preview receives its keys; production deployment remains gated.
- OAL-01: actual 21-view/30000-iteration run produced 1,123,630 triangles, valid UV/baseColor GLB (37,203,376 bytes). Hardware/semantic/private viewer checks pass; visual review found substantial holes/fragmented geometry, so quality and commercial rights remain gates.
- SCENE-01: full32-view training checkpoint saved. Lazy nvdiffrast CUDA compilation selected unsupported system GCC13; model runner now pins GCC12 (GCC11 for OAL) and fails early when missing. Recovery reuses the measured checkpoint; its timings must exclude training.
- FILE-01/MARKET-01: abandoned upload tombstones/cleanup and generated limited previews implemented. Zero-area TSDF faces are excluded before preview color interpolation; nonfinite barycentric weights reject rather than silently baking invalid colors.

- User decision: keep payments disabled. No Toss key provisioning or real provider checkout is required in this continuation; financial integration remains implemented/tested locally and unavailable to customers.

- SCENE-01 follow-up: upstream CUDA rasterizer recovery generated/refined8,745,864 source faces. Stopped the unbounded CPU unwrap before exceeding the128MiB GLB budget; added tested pre-bake simplification with an explicit1% nearest-source-vertex displacement bound. Real bounded output and its visual/size checks remain pending. Latest afea6d7 remote PR/push platform and Worker CI passed; subsequent headless/budget changes require a fresh CI run.

- MASK-01 hosted integration passed: protected Vercel browser→signed upload→hosted PostgreSQL queue→actual RTX4080 SAM2→private520×370 PNG→review approval. No3D completion/payment is simulated. Temporary worker stopped and disposable users/rows/files removed. A SAM2-only user service is being provisioned; generation models remain unadvertised.
- Real MV diagnostic still OOM in NAF texture conditioning even with FP16 (4GiB request,2.99GiB free). Native backtrace pushed the memory message beyond the previous8KiB classifier window; supervisor now scans only the current stage in bounded chunks, with long-backtrace/prior-stage regression tests passing. A lower NAF texture-feature-resolution diagnostic is separate and does not enable production.

## School deployment loop (2026-11-10)

- User clarifies exclusively noncommercial school use and requests public hosting. Public educational deployment is authorized; commercial-rights procurement is no longer a hosting gate. `NEXT_PUBLIC_PROJECT_PURPOSE=education` overrides payment settings and denies sales publication and payout mutations server-side. UI displays purpose, disabled commerce and model attribution. User will configure hosted SMTP directly; delivery remains unverified until confirmed.
- GPU results: four-view Pixal NAF512/FP16 diagnostic passes artifact/private viewer checks using official images/alpha/cameras, not a captured-input or SAM2 reconstruction workflow. Full32 GW outputs a102.7MB textured private GLB; semantic/private viewer pass, public derivative unavailable and visual scene quality fails. GW timings explicitly separate4472.6s training from180.5s successful post-training stages; training peak not recorded. Neither experiment enables a model family.
- Worker: SAM2-only user systemd service installed, enabled, active and lingering; durable Vercel project bypass plus independent worker token verified in actual hosted queue/browser flow. Model child processes now strip control-plane credentials.25 Python tests and44 Node/DB checks pass.

- DEPLOY-01 release check found `/docs` missing only in Vercel: the unanchored `docs` ignore excluded the Next route. Anchored all root-only deployment exclusions, expanded smoke to every public route and reject external SSO redirects, and corrected app/Auth origin to the actual registered production domain `objectscan-six.vercel.app`. Earlier staged docs check failed; that build is not reported fully verified.

- Public school pre-release at https://objectscan-six.vercel.app: registered production origin configured; Standard Protection retained on previews; all public routes/demo/mobile pass without deployment credentials. Actual public SAM2 processing/review and privacy boundaries pass after idle service restart. Final app source f2534dd passes [remote platform + worker CI](https://github.com/WooSungHyun03/ObjectScan/actions/runs/42821022739) and staged browser checks; promoted deployment dpl_8ENcphbDdiBsrLJjMGCK88EiCLfR. SMTP and reconstruction qualification remain open, commerce disabled.

## V3 mascot/user-UX/editor loop

Follow docs/IMPLEMENTATION_PLAN.md for task IDs/owners/dependencies/evidence. V3 assets/brand/copy/editor/version implementations pass local unit, DB and browser checks. Remote CI, hosted editor/SAM2, exact staged promotion and credential-free public checks pass; exact evidence is recorded in docs/EVIDENCE/V3_RELEASE.md. Existing generation and SMTP gates are unchanged by this redesign.

## V4 premium redesign

V4-RESEARCH/TOOLS/SYSTEM/FLOWS/QA/RELEASE are tracked with owner, priority, dependency, evidence and blocker in design/IMPLEMENTATION_STATUS.md. V4 visual authority supersedes V3 layout/palette; original privacy, queue, finance and reconstruction gates remain.

## V5 launch revision — latest2026-11-12

Historical task notes above remain as history; v5 supersedes prior payment-disable presentation for TEST mode.

| ID         | Acceptance                                                               | State / evidence                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| V5-AUDIT   | actual repo/tools/domain inventory                                       | PASS; AS_IS_AUDIT/DOMAIN_MIGRATION                                                                                                                   |
| V5-GPU     | single-photo upload→SAM2→credit→CUDA→textured GLB→viewer/download/reopen | PASS actual hosted;964287triangles,39MB,489.46s,12994MiB. Other input profiles blocked.                                                              |
| V5-CREDIT  | atomic debit/recovery/retry, exact qualification, bounded trial          | PASS local60-test suite; Preview2 additional one-credit trials after preserved fixtures                                                              |
| V5-TOSS    | actual SDK2 TEST approval/replay/refund                                  | PASS actual local topup/refund and hosted market approval/refund; Seoul region fixes provider IP denial                                              |
| V5-DESIGN  | service copy/assets/nav/credit/confirmation UI and responsive review     | PASS15 Preview route-width/axe audits,9 browser regressions; actual tools/fallback recorded                                                          |
| V5-MARKET  | two-account publish/approval/TEST buy/GLB/fee/refund                     | PASS actual hosted; fixture1000KRW/100fee, no withdrawable proceeds; listing removed/accounts quarantined after verification                         |
| V5-DOMAIN  | protected Preview first, preserve existing BE CELEB                      | PASS preservation; DNS replacement still requires approval                                                                                           |
| V5-RELEASE | static/build/CI, evidence, operations                                    | Local gates pass; source/deployment/CI exact results in reports/RELEASE_EVIDENCE.md. SMTP, multi-photo/scene quality and live commercial gates open. |

## Owner operations checkpoint — 2026-11-12

Current user explicitly authorizes main push and be-celeb.org replacement; historical V5 domain approval notes above are superseded. Domain transition itself remains unexecuted pending Cloudflare authentication and release gates.

| ID           | Acceptance                                                          | Current state                                                                                                                                                                    |
| ------------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OWNER-CTL    | verified user-scope unit; safe idle drain; only managed web stopped | Worker start/stop/restart and web start/stop verified; 32 Python tests pass including foreign-unit/PID refusal and credential suppression; public maintenance pending            |
| OWN-06       | immutable order rights/source snapshot                              | migration22 local tests pass and hosted additive apply/column reads/health200 verified; 60 Node/DB tests pass with snapshot assertions; API/UI and fresh actual purchase pending |
| HANDOFF-MAIN | one self-contained A/B/Owner handoff; tested integration on main    | docs/TEAM_HANDOFF.md:17 Team+10 Owner tickets, inline AC/tests/prompts; A7.5/B8,22.5% buffer. Push confirmation is remote SHA, not this table                                    |

Owner evidence: docs/owner-ops/EVIDENCE_INDEX.md. Full production launch remains incomplete; do not infer fresh SMTP/PG/GPU or DNS verification from this checkpoint.
