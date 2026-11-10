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

Commands passed: npm run typecheck; npm test (33 tests); Python pytest (15 tests); Playwright platform (3 tests); Playwright GPU SAM2 (1 test). Production Next build passed after the payout UI changes. ESLint currently has warnings for image policy and asynchronous-effect patterns; no errors. Dependency audit reports0 vulnerabilities after minimatch override and current Supabase/sharp.

Fixes found by the loop: internal proxy origin mismatch blocked legitimate uploads; fixed configured-origin checking. Viewer replaced a single material with an array without geometry groups; fixed material shape preservation. Analysis completed in DB but selection screen did not poll; attached job tracking to mask/pose steps. Test selectors corrected to match the actual scene heading and logout redirect.

Cloud preview reached READY at https://objectscan-66knyqd59-sunghyuns-projects-da008879.vercel.app. Authenticated Vercel curl confirmed health configured=false, payments disabled, models empty. This is a frontend preview awaiting hosted Supabase keys, not a full cloud integration validation. Build failures fixed: production install omitted TypeScript dev dependencies; explicit include=dev and workspace declarations added. An unanchored ignore rule omitted app/lib/supabase; anchored to /supabase.

Outstanding: hosted identity/storage, real COLMAP inputs, three reconstruction model smokes, Toss sandbox roundtrip/refunds and marketplace purchase flow. Unit fixtures do not substitute for those checks.

2026-11-10 continuation: isolated email confirmation enabled and verified through real Mailpit messages and PKCE callbacks. Slot-before-job lock order is now covered by a concurrent heartbeat/completion DB test. New hosted Supabase project creation was rejected by the provider's two-free-project limit; no existing cloud project was changed.
