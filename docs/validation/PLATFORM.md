# Platform verification — updated 2026-11-10

Story: a user signs into a private workspace, uploads an image, selects an object, requests a queued GPU mask and reviews the stored result. Object/scene workflows remain distinct; no reconstruction model is reported validated yet.

| Boundary                    | Evidence                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Browser → identity          | Playwright confirmed password login, protected dashboard, logout and subsequent login redirect               |
| Upload → API → Storage → DB | Real exact-key signed PUT, Sharp completion decode and project count=1 assertion                             |
| Object → SAM2 queue         | tests/gpu/sam2.spec.ts uses a licensed cropped sample and normalized box coordinates                         |
| Queue → CUDA → private mask | Actual RTX4080 SAM2.1 small inference, stored520×370 PNG, completed DB job                                   |
| Mask → browser review       | Signed mask URL fetched and decoded; human-review button persisted true                                      |
| User isolation              | PostgreSQL authenticated role sees own project only; admin-role update denied                                |
| Queue safety                | Two connections claim one slot; expired lease does not recycle it; wrong token/cancellation rejected         |
| Finance transaction         | Amount mismatch fails, duplicate confirmation inserts one payment/debit; payout reserve/reject is idempotent |
| Viewer                      | Real CC BY4.0 GLB loads in browser, controls operate; file validator decodes embedded geometry/UV/baseColor  |
| Worker termination          | pytest kills supervised parent/child on cancellation and timeout                                             |

Commands passed: npm run typecheck; npm test (43 tests); Python pytest (19 tests); Playwright platform (3 tests); Playwright GPU SAM2 (1 test). Production Next build passed after refund and semantic GLB validation changes; the three platform browser tests also passed against next start. ESLint currently has warnings for image policy and asynchronous-effect patterns; no errors. Dependency audit reports0 vulnerabilities after minimatch override and current Supabase/sharp.

Fixes found by the loop: internal proxy origin mismatch blocked legitimate uploads; fixed configured-origin checking. Viewer replaced a single material with an array without geometry groups; fixed material shape preservation. Analysis completed in DB but selection screen did not poll; attached job tracking to mask/pose steps. Test selectors corrected to match the actual scene heading and logout redirect.

Cloud preview reached READY at https://objectscan-jpb7y0p9v-sunghyuns-projects-da008879.vercel.app. Authenticated Vercel curl confirmed health configured=false, payments disabled, models empty. This is a frontend preview awaiting hosted Supabase keys, not a full cloud integration validation. Build failures fixed: production install omitted TypeScript dev dependencies; explicit include=dev and workspace declarations added. An unanchored ignore rule omitted app/lib/supabase; anchored to /supabase.

Outstanding: hosted identity/storage, real COLMAP inputs, three reconstruction model smokes, Toss sandbox roundtrip/refunds and marketplace purchase flow. Unit fixtures do not substitute for those checks.

2026-11-10 continuation: isolated email confirmation enabled and verified through real Mailpit messages and PKCE callbacks. Slot-before-job lock order is now covered by a concurrent heartbeat/completion DB test. New hosted Supabase project creation was rejected by the provider's two-free-project limit; no existing cloud project was changed.

Latest verified source: `634e1c50b5170f9e36d36d5359ef885a918f77e3`. Both remote runs passed, including clean Worker package installation: [PR CI](https://github.com/WooSungHyun03/ObjectScan/actions/runs/42735603418) and [push CI](https://github.com/WooSungHyun03/ObjectScan/actions/runs/42735594885). The browser tests cover email confirmation/recovery, real signed upload, object/scene separation, 360px navigation/billing, owner refund review requests and non-admin denial. Screenshots wait for actual GLTF decoding/render readiness. New malformed-GLB tests reject nonfinite coordinates, collapsed geometry/UV and negative offsets. Sandbox refund DB tests prove idempotency, ledger reversal, entitlement revocation and a safe repurchase; provider responses are explicitly mocked, not actual Toss charges.

Hosted continuation: user authorized pausing AISaaS to free capacity. AISaaS is INACTIVE; SceneScan remains unchanged. ObjectScan `ctdzibelbwaujvngmxgg` is ACTIVE_HEALTHY in Seoul with11 migrations applied. Preview [objectscan-pz9pnbynu](https://objectscan-pz9pnbynu-sunghyuns-projects-da008879.vercel.app) passes protected health configured=true, actual browser password login, signed upload/Sharp finalization/private image download, anonymous denial, second-user RLS denial, and360px independent scene flow. All disposable cloud users/rows/files were deleted after the test. These identities were admin-confirmed test accounts: hosted email delivery/SMTP remains unverified. Generation and payments remain disabled. Initial harness expected anonymous SELECT to return an empty array; hosted PostgreSQL correctly rejected it with permission denial instead, and the assertion now accepts either safe denial. No security protection was relaxed.

GPU outputs are separate evidence: SAM2 actual21-view propagation; Pixal single opt-in NAF FP16 (upstreamFP32 OOM) and OAL21 full30k UV/baseColor outputs pass semantic artifact checks. See individual JSON reports; four-view Pixal, scene final GLB and full paid browser generation remain unverified.
