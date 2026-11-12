# ObjectScan

Independent photo-to-textured-mesh web service built with Next.js, Supabase, Vercel and an outbound Python GPU worker. The earlier ChatGPT Sites architecture is superseded.

## V5 service launch revision

Authority: ObjectScan_Codex_Service_Launch_Revision_v5.md. Current production remains the prior v4 release; v5 progresses on feat/service-launch-v5 with a separate Preview. Actual status and release evidence: reports/RELEASE_EVIDENCE.md. Domain be-celeb.org is occupied by sw-system and is preserved until explicit approval. Test finance and scoped GPU qualification supersede the older school-only presentation below; no live payments or automatic payouts. See docs/RUNBOOK_V5.md.

[Current protected v5 Preview](https://objectscan-qz44npios-sunghyuns-projects-da008879.vercel.app) runs in Seoul. Actual single-photo reconstruction,39MB private textured GLB/viewer/download and two-account Toss TEST marketplace purchase/refund pass.60 Node/DB tests,26 Python tests,9 browser regressions and15 responsive/axe checks pass; exact source/CI is in the evidence report. Two additional confirmed accounts can claim one free trial each. Multiple-photo/scene generation, external SMTP delivery and live commercial release are not qualified.

## Run locally

Node22 and Docker required. Run `npx --yes npm@11 ci`, `npm run db:start`, `npx supabase migration up --local`. Save `npx supabase status -o json` to a private temporary file and run `node scripts/configure-local.mjs /absolute/path/to/status.json` to configure isolated local services without printing credentials. Then `npm run dev`.

`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e` verify the platform. Python worker installation and tests: `python3 -m venv gpu-worker/.venv`, `gpu-worker/.venv/bin/pip install -e './gpu-worker[test,bake]'`, `gpu-worker/.venv/bin/python -m pytest gpu-worker/tests`. Hardware SAM2 browser integration is separate: start the configured real worker, then `npx playwright test --config playwright.gpu.config.ts sam2.spec.ts` against local Supabase only.

Actual generated artifact checks require an explicit output: set `OBJECTSCAN_VALIDATE_GLB=/absolute/path/to/mesh.glb`, then run `npx vitest run --config vitest.gpu.config.ts` and `npx playwright test --config playwright.gpu.config.ts pixal-artifact.spec.ts`. The adjacent manifest, source images/masks, result and preview must belong to a real hardware run. Set `OBJECTSCAN_GPU_VIEWER_ONLY=1` to skip disposable local marketplace moderation for research outputs. These tests import the real offline artifact for viewer QA; they do not simulate paid generation or validate a model's production quality.

## Historical v2–v4 status

Private auth/projects/uploads, two reconstruction interfaces, GLB viewer, queue/lease boundaries, sandbox financial APIs, marketplace publication/moderation and manual payout-review bookkeeping are implemented. The dedicated hosted Supabase project and [protected Vercel Preview](https://objectscan-pz9pnbynu-sunghyuns-projects-da008879.vercel.app) pass real browser login/upload/private download/RLS and SAM2 queue/CUDA/mask-review checks. Hosted SMTP delivery is still unverified.

Pinned reconstruction adapters are implemented, with distinct hardware gates: Pixal single-image opt-in NAF FP16 generated a valid textured GLB; full1024 four-view conditioning exhausted16GB even with that precision change. OAL21 completed but its fragmented geometry failed visual quality. GW extraction/refinement passed with the upstream CUDA rasterizer option; bounded UV export is being validated. No reconstruction family is production enabled. Payments remain disabled at the user's request; provider-hosted payment/marketplace purchase integration remains unverified. A visible sample model is explicitly attributed and is not inference output.

See [architecture](docs/ARCHITECTURE.md), [model audit](docs/MODEL_AUDIT.md), [14-day plan](docs/TASKS.md), [validation evidence](docs/validation/PLATFORM.md), [runbook](docs/RUNBOOK.md) and [release gates](docs/RELEASE_CHECKLIST.md). Never commit environment values, original uploads or model weights.

## School deployment

This project is exclusively for noncommercial school education/research. Deploy with `NEXT_PUBLIC_PROJECT_PURPOSE=education`: payments, asset sales and payouts are disabled server-side. Actual SAM2 processing works through the hosted queue; reconstruction remains gated on input-workflow and visual quality. See [release scope](docs/validation/production-school.json), [GPU experiments](docs/validation/) and [runbook](docs/RUNBOOK.md). Hosted email delivery awaits user-provided SMTP.

Public school pre-release: [ObjectScan](https://objectscan-six.vercel.app). Working scope: authenticated projects, private upload, actual queued SAM2 masks/review and sample 3D viewer. Reconstruction and commerce are disabled; external signup email delivery still needs SMTP verification.

## V4 product design

Public school build: https://objectscan-six.vercel.app. UI source remains independent Next/Supabase/Vercel. Design authority: design-system/objectscan/MASTER.md and docs/design/IMPLEMENTATION_STATUS.md. Figma and MagicPath usage/evidence are recorded in docs/design/TOOL_USAGE.md. Regenerate reviewed semantic palette artifacts with node scripts/sync-design-system.mjs; --check is part of CI. /design-preview exists only in development; explicit Figma capture hashes load the development capture helper. No capture script runs in production.

## 팀 전달 및 운영

담당자별 티켓·공수·착수 순서·완료 조건·독립 Codex 프롬프트는 [단일 팀 전달 문서](docs/TEAM_HANDOFF.md)에 모았습니다. A는 OS-01, B는 OS-12부터 시작합니다. 실제 운영 작업과 검증·미완료 항목은 [Owner 실행 증거](docs/owner-ops/EVIDENCE_INDEX.md)를 확인하세요. 현재 통합 기준은 main입니다.

담당자에게는 자신의 문서 하나만 전달하세요: [A 전용](docs/delivery/MEMBER_A.md), [B 전용](docs/delivery/MEMBER_B.md), [Owner-local 전용](docs/delivery/OWNER_LOCAL.md). 각 문서에 바이브코딩 시작·재개 프롬프트와 해당 담당 티켓 전체를 포함했습니다.
