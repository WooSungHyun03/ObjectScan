# ObjectScan

Independent photo-to-textured-mesh web service built with Next.js, Supabase, Vercel and an outbound Python GPU worker. The earlier ChatGPT Sites architecture is superseded.

## Run locally

Node22 and Docker required. Run `npx --yes npm@11 ci`, `npm run db:start`, `npx supabase migration up --local`. Save `npx supabase status -o json` to a private temporary file and run `node scripts/configure-local.mjs /absolute/path/to/status.json` to configure isolated local services without printing credentials. Then `npm run dev`.

`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e` verify the platform. Python worker installation and tests: `python3 -m venv gpu-worker/.venv`, `gpu-worker/.venv/bin/pip install -e './gpu-worker[test,bake]'`, `gpu-worker/.venv/bin/python -m pytest gpu-worker/tests`. Hardware SAM2 browser integration is separate: start the configured real worker, then `npx playwright test --config playwright.gpu.config.ts sam2.spec.ts` against local Supabase only.

Actual generated artifact checks require an explicit output: set `OBJECTSCAN_VALIDATE_GLB=/absolute/path/to/mesh.glb`, then run `npx vitest run --config vitest.gpu.config.ts` and `npx playwright test --config playwright.gpu.config.ts pixal-artifact.spec.ts`. The adjacent manifest, source images/masks, result and preview must belong to a real hardware run. Set `OBJECTSCAN_GPU_VIEWER_ONLY=1` to skip disposable local marketplace moderation for research outputs. These tests import the real offline artifact for viewer QA; they do not simulate paid generation or validate a model's production quality.

## Status

Private auth/projects/uploads, two reconstruction interfaces, GLB viewer, queue/lease boundaries, sandbox financial APIs, marketplace publication/moderation and manual payout-review bookkeeping are implemented. The dedicated hosted Supabase project and [protected Vercel Preview](https://objectscan-pz9pnbynu-sunghyuns-projects-da008879.vercel.app) pass real browser login/upload/private download/RLS and SAM2 queue/CUDA/mask-review checks. Hosted SMTP delivery is still unverified.

Pinned reconstruction adapters are implemented, with distinct hardware gates: Pixal single-image opt-in NAF FP16 generated a valid textured GLB; full1024 four-view conditioning exhausted16GB even with that precision change. OAL21 completed but its fragmented geometry failed visual quality. GW extraction/refinement passed with the upstream CUDA rasterizer option; bounded UV export is being validated. No reconstruction family is production enabled. Payments remain disabled at the user's request; provider-hosted payment/marketplace purchase integration remains unverified. A visible sample model is explicitly attributed and is not inference output.

See [architecture](docs/ARCHITECTURE.md), [model audit](docs/MODEL_AUDIT.md), [14-day plan](docs/TASKS.md), [validation evidence](docs/validation/PLATFORM.md), [runbook](docs/RUNBOOK.md) and [release gates](docs/RELEASE_CHECKLIST.md). Never commit environment values, original uploads or model weights.

## School deployment

This project is exclusively for noncommercial school education/research. Deploy with `NEXT_PUBLIC_PROJECT_PURPOSE=education`: payments, asset sales and payouts are disabled server-side. Actual SAM2 processing works through the hosted queue; reconstruction remains gated on input-workflow and visual quality. See [release scope](docs/validation/production-school.json), [GPU experiments](docs/validation/) and [runbook](docs/RUNBOOK.md). Hosted email delivery awaits user-provided SMTP.
