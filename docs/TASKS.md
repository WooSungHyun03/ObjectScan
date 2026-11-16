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

## Owner domain cutover — 2026-11-12

OWN-05 routing: be-celeb.org moved from sw-system to objectscan; www308 to apex; HTTPS200/title/browser verified. DNS/mail/data unchanged. Existing Production served; fresh main deployment and actual auth/PG/GPU flow remain separate gates. Evidence: docs/owner-ops/DOMAIN_MIGRATION.md. Earlier Cloudflare-login blocking assumption is corrected: existing DNS already reaches Vercel.

## Per-person vibe-coding handoff — 2026-11-12

DOC-HANDOFF: docs/delivery/MEMBER_A.md (7 tickets/7.5d), MEMBER_B.md (10/8d), OWNER_LOCAL.md (10/original10d). Each includes kickoff/resume prompts, full assigned ticket scope/AC/tests, dependencies, evidence and stop conditions. Owner document marks completed routing/migration/worker work to prevent duplicate execution. Documentation only; no application changes. Structural validation and Markdown formatting checked before main push.

## Team B — OS-12 fixture shell — 2026-11-13

OS-12 (TEAM_PASS, SERVICE_PENDING): key-free Vite shell `tests/team/vite.config.ts` renders real `JobTracker`/`PaymentResult` with next/* adapters and a fetch-level fixture API; `npx playwright test --config playwright.team.config.ts --grep OS-12` 9/9 at 360/768/1440 with axe and keyboard; `node scripts/team-report.mjs OS-12` writes `output/playwright/OS-12/REPORT.md`. MOCK only. Found real a11y bug: `.job-tracker` text contrast 3.07–4.48:1 in globals.css (excluded with a `shortcut:` in the spec until the owner fixes it).

## Team B — OS-02 auth recovery UI — 2026-11-13

OS-02 (TEAM_PASS, OWNER_PENDING OWN-01): unconfirmed signup/login enters a waiting state (no workspace navigation) with a 60s deadline-based resend via `auth.resend`; callback failure for `/reset-password` now redirects to `/forgot-password?error=link_expired`, and login shows `?error=confirmation_failed`; reset with a missing/expired session shows a new-link action; forgot email is remembered on this device and cleared after a successful reset; `safeNext` helper replaces the duplicated next-path check (unit test). MOCK auth adapter only (`tests/team/adapters/supabase-client.ts`). Owner: real SMTP delivery, Supabase redirect allow-list and server-side resend limits remain OWN-01.

## Team B — OS-04 purchase-time terms UI — 2026-11-13

OS-04 (TEAM_PASS, OWNER_PENDING OWN-06): billing orders show "주문 시점 이용 조건" for marketplace orders via `orderTermsView` (recorded snapshot → title/license/version/hash/time; missing/invalid → "기록 확인 중", never the current listing license); billing load failure shows only the error and "다시 불러오기". The billing API does not yet return `license_snapshot`; whitelist contract in `contracts/billing-order-terms.md`. MOCK only.

## Team B — OS-19 viewer presets — 2026-11-13

OS-19 (TEAM_PASS, no Owner dependency): ModelViewer adds a "보기 방향" group (앞/뒤/왼쪽/오른쪽 + 화면 맞춤) using drei `useBounds` (moveTo/lookAt/fit) inside the existing Bounds, no new renderer, no geometry change. Directions follow the file's +Z axis with the display yaw (`features/viewer/view-presets.ts`, unit test cross-checked with three.js); visible note says it is the file axis, not a detected front. Tools and screenshot are disabled until the model is loaded and stay disabled on load failure. Canvas `data-camera` exposes direction|distance for tests. MOCK fixture uses the public demo GLB.

## Team B — OS-18 market filters and URL state — 2026-11-13

OS-18 (TEAM_PASS, no Owner dependency): marketplace adds license and price-band filters over the already-loaded list (`features/marketplace/filters.ts`, unit test; "불러온 N개 중 M개" note), keeps q/category/sort/license/price in the URL via `history.replaceState` so Back from a detail restores them, validates URL values against allow-lists, and separates a load error (alert + "다시 불러오기", inputs kept) from loading and empty states; "조건 초기화" keeps the search text. Selects got explicit aria-labels. Found real a11y bug: `.project-info p` card text 4.12:1 (excluded with a `shortcut:` in the spec). No format filter (GLB only). MOCK listings.

## Team B — OS-21 order status and asset link — 2026-11-15

OS-21 (TEAM_PASS, no Owner dependency): billing orders show Korean status via `features/billing/order-status.ts` (unknown/missing → "확인 중", never the raw value; unit test), a "테스트 결제" marker when `payments_mode` is test, a "내 에셋에서 파일 받기" link only for paid marketplace orders, a refund notice for refunded ones, and "상태 다시 확인" when any status is unrecognised. Asset download denial (`ASSET_NOT_FOUND`) now has customer copy that mentions refund without claiming access, plus a link to billing. No new endpoint; download stays server-authorized per request. `npx playwright test --config playwright.team.config.ts --grep OS-21` 9/9 at 360/768/1440 with axe and keyboard. MOCK only. Found real a11y bug: `.workspace-notice` text 4.49:1 (excluded with a `shortcut:` in the spec). Not done: payout status and ledger kind are still raw values (outside ticket scope). Blocked: OS-07/OS-08/OS-10 wait for Team A OS-01, which is not on origin/main as of this date.

## Team B — OS-10 payment return recovery UI — 2026-11-15

OS-10 (TEAM_PASS on files independent of OS-01, OWNER_PENDING OWN-03): `PaymentResult` now decides from the server confirm response only — `status: paid` → 완료 once, `refunded` → "환불된 주문" (no asset link, never shown as a purchase), anything else → still checking with retry; final error codes (`AMOUNT_MISMATCH`, `ORDER_EXPIRED`, `ORDER_STATE_INVALID`, `ORDER_NOT_FOUND`, `PAYMENT_NOT_VERIFIED`) get Korean copy, no retry button and only the order-history link; the retry button stays visible but locked while a request is in flight. `client-api.ts` attaches the server `code` to the thrown Error (one line, message unchanged). Found and fixed a real bug: two clicks in one task on `CheckoutButton` sent two `POST orders` with different idempotency keys (in-flight ref guard; same guard on confirm). Fixture API gained `network` (lost response) and `delay`. `npx playwright test --config playwright.team.config.ts --grep OS-10` 15/15 at 360/768/1440 with axe and keyboard. MOCK only: no Toss SDK call, webhook, ledger or real TEST payment was exercised. Not covered: `CheckoutPanel` (needs the provider client key, Owner-only). Team dependency: OS-01 is not on origin/main as of 2026-11-15; OS-10 touches none of its files, re-run after it lands. OS-07/OS-08 edit `reconstruction-wizard.tsx` shared with OS-01 and remain blocked.

## Team B — OS-07 photo order and diagnostics (independent part) — 2026-11-15

OS-07 (PARTIAL — not TEAM_PASS for the whole ticket; OWNER_PENDING OWN-04; blocked on OS-01 for the wizard): done without touching `reconstruction-wizard.tsx` — `DraftPhotos` (already mounted in the wizard) now lists the selected photos before upload with keyboard 위로/아래로/제외, focus following the moved photo and a live status, and uploads exactly the remaining order; optional `diagnostics` prop shows distinct duplicate / blurry / could-not-check advice that never blocks upload, with a static shooting guide when absent. Key-free Node helper `features/create/image-diagnostics.server.ts` returns `sharp.stats()` sharpness/entropy or `null` past 16 MB / 40M pixels / broken input (unit test with generated sharp vs blurred images). Contract for the server field: `contracts/upload-diagnostics.md`. `--grep OS-07` 6/6 at 360/768/1440 with axe and keyboard. MOCK only. Open: (1) blurry rule is a relative placeholder (under half the selection median, 3+ photos) — needs owner confirmation; (2) no real diagnostics reach the UI until OWN-04; (3) warnings on already-uploaded photo cards need the wizard and wait for OS-01; (4) no thumbnails in the draft list. OS-08 remains fully blocked on OS-01.

## Team B — OS-08 mask failure recovery and focus — 2026-11-15

OS-08 (TEAM_PASS, no Owner dependency; implemented before Team A OS-01 by the user's decision — OS-01 is not on origin/main, so its merge may conflict in `reconstruction-wizard.tsx` and OS-08 must be re-run after it lands): the mask step now shows a recovery notice when the mask request fails (e.g. worker 503) or the latest mask job failed, with "선택 다시 하기" that returns focus to the selection tools while photos and the saved selection stay (no re-upload); photos without a mask after a completed job are listed with "<사진> 기준으로 다시 선택" (`features/create/mask-recovery.ts`, unit test); any failed wizard action re-reads the project so a stale approval is never left shown as done (the server answers a stale-revision approval with 404 `MASK_NOT_FOUND`, now with Korean re-review copy; the ticket text says 409, the fixture follows the real server); approve/exclude/move buttons keep or move focus after their busy re-render (`data-focus`), approve has `aria-pressed` and a status message, mask cards get "크게 보기"; another user's project shows only "프로젝트를 찾을 수 없습니다." No gate, revision or API change. `--grep OS-08` 12/12 at 360/768/1440 with axe and keyboard. MOCK only. Found real a11y bug: the wizard's muted text (step nav, footer counter, preview summary, upload hints, `.upload-guidance`, `.inline-empty small`) is 3.2–4.46:1 in globals.css; contrast is asserted only on the regions OS-08 changed (`shortcut:` in the spec).

OS-07 status update (same date): its three ACs (distinct duplicate/blurry/unchecked advice with the user free to proceed; keyboard exclude/move matching the uploaded order; over-budget/broken image diagnosis stops and keeps the selection) are all covered by the MOCK spec and unit test, so OS-07 is TEAM_PASS, OWNER_PENDING OWN-04. Still open, not ACs: blurry rule is a relative placeholder awaiting owner confirmation; no thumbnails in the draft list; warnings on already-uploaded cards need OWN-04 data.

## Team B — OS-22 fixture integration regression and Owner handoff — 2026-11-16

OS-22 (TEAM_PASS for the Team B scope; prerequisites from Member A not present): no new harness. The per-spec copies of the screenshot/overflow/axe helper were merged into `tests/team/check.ts` (`shooter`, `checkPage` with named `contrastExclude`/`contrastOnly` for the known globals.css contrast bugs; OS-18/OS-21 now exclude their selectors from contrast only instead of from every rule). `tests/team/os-22.spec.ts` runs the existing fixtures as 8 user tasks (auth recovery, photo prep, mask recovery, job failure, viewer, market, payment return, orders/rights) at 360/768/1440, each with its main state, first-Tab focus, axe, overflow, screenshot and "no http(s) request leaves 127.0.0.1". `--grep OS-22` 24/24; full Team suite 111/111. Handoff with TEAM_PASS / OWNER_PENDING / SERVICE_PENDING per task and the NOT_RUN list: `output/playwright/OS-22/HANDOFF.md`. NOT_RUN: 3D editor (no Team fixture), `npm test` with DB, `npm run build`, `npm run test:e2e`, real GPU/PG/SMTP/deploy. Member A tickets (OS-01, OS-03, OS-06, OS-09, OS-11, OS-17, OS-20) are not on origin/main, so the integration is partial for the whole team.

## Team B — OS-21 follow-up: payout status and ledger kind labels — 2026-11-16

The billing page showed payout status and ledger kind as raw DB values (left open in the OS-21 entry). `features/billing/order-status.ts` now also maps `payout_requests.status` (requested/approved/rejected/paid) and `credit_ledger.kind` (generation_purchase/marketplace_purchase/sale/fee/refund) to Korean, with unknown values shown as "확인 중" (unit test). The `billing-orders` fixture gained payouts and ledger rows including unknown values; `--grep OS-21` covers them. Full Team suite 111/111, typecheck and lint exit 0. MOCK only.

## Team A implementation

| ID | Acceptance | State / evidence |
| --- | --- | --- |
| OS-01 | Display support, rejection reason, zero debit for blocked input, server rate for eligible input and preserve input on health retry | Local MOCK AC pass on `codex/os-01` from `fc20978`. Peer review and OS-12 browser integration pending. Next ready: OS-03. |
| OS-03 | Resume the same job after a transient read failure, guard generation submission, reconcile ambiguous submission and cancel outcomes | Local MOCK AC pass on `codex/os-03` over `4d3ccce`. Peer review and OS-12 browser integration pending. Next ready: OS-06. |
| OS-06 | Compare original and working versions in one canvas, preserve source after invalid GLB, download client metrics without private URLs | Local AC pass on `codex/os-06` over `57bd126`. Peer review and OS-12 browser integration pending. Next: OS-09 independent card scope. |
| OS-09 | Safe poster on market cards, confirm a viewer capture before publication, preserve existing publication | Card and publish regression pass in MOCK on `codex/os-09`. Viewer capture confirmation `BLOCKED` by OS-19. Poster storage/approval `OWNER_PENDING` (OWN-08). Next ready: OS-17. |
| OS-17 | Validate local GLB, offer private save and project publication, preserve edits on upload failure | Local and MOCK AC pass on `codex/os-17`. Private server registration `OWNER_PENDING` (OWN-09). Next ready: OS-20. |
| OS-20 | Reuse edit cursor for history, confirm part deletion, preserve dirty state through save failures | Local GLB and MOCK save AC pass on `codex/os-20`. Peer review and OS-12 integration pending. Next ready: OS-11. |
| OS-11 | Confirm named asset deletion, restore focus on cancel, explain rights holds and allow controlled retry | Local MOCK AC pass on `codex/os-11`. Purchase and retention behavior `OWNER_PENDING` (OWN-07). Next ready: review and Team A regression. |

OS-01 uses existing `GET /api/health`, project `qa` and `wallet` responses. The public health response advertises single-photo availability only. Project-specific support comes from the authenticated QA response after upload. The change can be reverted as one commit.

Key-free evidence is under local `output/playwright/OS-01/`. Vitest 36 passed, typecheck and lint exited 0 (7 existing warnings). The isolated local Next fixture and Edge Playwright suite passed 9 scenarios covering rejected scene and multi-photo inputs, a one-photo quote and keyboard health retry, with 360/768/1440 captures and axe checks on the changed panels. This suite uses mocked API responses. The shared OS-12 runner, full Owner suite and live integration were not run.

OS-03 key-free evidence is under local `output/playwright/OS-03/`. Vitest 38 passed, typecheck and lint exited 0 (7 existing warnings), and 13 Edge fixture checks passed including all 9 OS-01 regressions. 360/768/1440 captures and axe cover backoff, ambiguous submission and missing job. Existing job and project reads, idempotent generation POST, and cancel endpoint supply the server states. Pending submission keys stay in memory for the open wizard. Revert the OS-03 commit to roll back. Live integration and the shared OS-12 runner were not run.

OS-06 key-free evidence is under local `output/playwright/OS-06/`. Vitest 33 passed and typecheck/lint exited 0 (7 existing warnings). Edge passed 5 checks using actual GLB decoding, simplification, one canvas and file roundtrip. Saved-version API data was mocked. 360/768/1440 captures, keyboard comparison and scoped axe passed. The worker now keeps the prior valid source until the candidate passes validation. Revert the OS-06 commit to roll back.

OS-09 evidence is under local `output/playwright/OS-09/`. Vitest 29 passed, Edge 4 passed, and typecheck/lint exited 0 (7 existing warnings). A fixture poster loaded. External, unavailable and missing posters fell back at 360/768/1440. Existing publication sent the same listing review request. [OWN-08 handoff](delivery/TEAM_A_OWNER_CONTRACTS.md). Revert the OS-09 commit to roll back. Resume capture work after the OS-19 camera changes land.

OS-17 evidence is under local `output/playwright/OS-17/`. Vitest 35 passed, typecheck/lint exited 0, Edge passed the 3 final scenarios and an earlier combined run of 8 including OS-06. The actual GLB stays editable and downloadable through malformed or oversized inputs and simulated upload errors. Mock private registration opens the existing project publish form. Production local-file UI shows availability pending until the documented [OWN-09 adapter](delivery/TEAM_A_OWNER_CONTRACTS.md) is bound. Revert this ticket commit to roll back.

OS-20 evidence is under local `output/playwright/OS-20/`. Vitest 36 passed and typecheck/lint exited 0. The 768/1440 browser scenarios passed, and the 360 part deletion scenario passed after a contrast fix. Actual GLB exports match the history cursor, cancelled confirmation restores focus, and save/reopen failures retain dirty state and the same request key. Saved-version writes were mocked. Revert this ticket commit to roll back.

OS-11 evidence is under local `output/playwright/OS-11/`. Edge passed 4 key-free scenarios, with 360/768/1440 captures and axe for cancellation, purchase holds and retry. Account review and successful asset deletion used existing API shape fixtures. Combined Vitest 44 passed, and typecheck/lint exited 0. [OWN-07 handoff](delivery/TEAM_A_OWNER_CONTRACTS.md). Revert the OS-11 commit to roll back.

## Team A and Team B integration — 2026-11-16

Integration preserves the Team B billing and mask-recovery flows alongside Team A deletion, generation eligibility and polling. Shared client API errors carry both HTTP status and the existing application code. Team B OS-12 and OS-19 are available in the integrated tree. OS-09 still needs the viewer capture confirmation and the OWN-08 storage contract. Team A browser fixture migration into the shared runner and Owner service gates remain open.
