# ObjectScan v2 engineering instructions

Read OBJECTSCAN_CODEX_MASCOT_REDESIGN_HARNESS.md, CODEX_MASTER_PROMPT.md, design/DESIGN_SPEC.md and docs/TASKS.md before changes. The v3 mascot brief supersedes the archived mint reference. The independent Next.js/Supabase/Vercel stack supersedes all prior Sites code. No Sites/D1/R2/platform authentication dependencies are permitted.

## Scope and interfaces
- A: apps/web design, accessible UI, auth pages, dual reconstruction wizard, viewer.
- B: gpu-worker model adapters, isolated environments, outbound polling, artifact validation, process control.
- C: packages/shared, contracts, supabase migrations/RLS/queue, server APIs, payments/marketplace, CI.
- Preserve typed contracts across tracks. One GPU slot globally. No fabricated cameras, masks, payments, performance data or finished meshes.
- Inspect upstream pinned code before adapter commands; never modify vendor code to fit UI.

## Loop
Record task ID, acceptance and state in docs/TASKS.md. Implement a bounded slice, run its tests, fix actual failures, integrate, and record evidence. Mark blocked/untested precisely. Never mark a feature complete without its checks passing. REAL_GPU_VALIDATED=false until real model smoke reports prove otherwise; device discovery is not model validation.

## Security
Verify Supabase identity server-side and scope each operation. RLS is a second boundary. Original images, masks and artifacts stay private. Service role and worker keys are server-only. Do not use user metadata for admin authorization. Never accept client prices or paid states. Apply atomic idempotent settlement in PostgreSQL only after verified provider confirmation. Test-mode payment is separate from production. No automatic seller transfers.

## Git and review
Work on a feature branch; do not merge unreviewed application changes into main. Initial documentation bootstrap may initialize an empty main branch. Conventional commits, reviewable PRs and evidence. Never commit environment values, user uploads, trained weights, generated meshes or personal datasets. External model checkouts remain outside this repository and pinned by manifest.

## Checks
npm run typecheck; npm run lint; npm test; npm run build; npm run test:e2e. Python: gpu-worker/.venv/bin/python -m pytest gpu-worker/tests. Local Supabase migrations + SQL/RLS/atomic concurrency integration tests. Real GPU smoke remains separate from mocks. Use local isolated resources; never mutate another project's databases/containers/environments.

## V3 product and module boundaries
- A: mascot brand assets, Korean marketing/auth/workspace and responsive visual QA.
- B: packages/mesh-editor typed operations, GLB roundtrip/decimation, CPU-only processing; GPU model work remains isolated.
- C: private immutable asset versions, owner authorization/RLS, API validation, integration/CI.
- Customer text must not contain adapter/model identifiers, raw errors or filesystem paths. Keep required source attribution only on /legal/opensource; operator diagnostics may retain identifiers.
- Use actual alpha-transparent supplied mascot derivatives. Never use the baked checkerboard images or invent a new character. No signs/logos held by the character.
- Original assets are immutable. Edits are typed commands and new private versions. No arbitrary scripts, external glTF references, paid entitlement changes or fake GPU completion.
- Prior user decisions persist: exclusively noncommercial school service, payments/sales/payouts disabled. Redesign does not enable unqualified generation paths.
- Loop: discover → plan → implement → static/integration/browser verify → screenshot critique → fix → integrate. Existing public deployment stays unchanged until new UI/editor passes its gates.
