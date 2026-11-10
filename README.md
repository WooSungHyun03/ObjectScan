# ObjectScan

Independent photo-to-textured-mesh web service built with Next.js, Supabase, Vercel and an outbound Python GPU worker. The earlier ChatGPT Sites architecture is superseded.

## Run locally

Node22 and Docker required. Run `npx --yes npm@11 ci`, `npm run db:start`, `npx supabase migration up --local`. Save `npx supabase status -o json` to a private temporary file and run `node scripts/configure-local.mjs /absolute/path/to/status.json` to configure isolated local services without printing credentials. Then `npm run dev`.

`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e` verify the platform. Python worker installation and tests: `python3 -m venv gpu-worker/.venv`, `gpu-worker/.venv/bin/pip install -e './gpu-worker[test,bake]'`, `gpu-worker/.venv/bin/python -m pytest gpu-worker/tests`. Hardware SAM2 browser integration is separate: start the configured real worker, then `npx playwright test --config playwright.gpu.config.ts` against local Supabase only.

## Status

Private auth/projects/uploads, two reconstruction interfaces, GLB viewer, queue/lease boundaries, sandbox financial APIs, marketplace publication/moderation and manual payout-review bookkeeping are implemented. Real SAM2 single-image CUDA and browser integration passed. Three reconstruction model adapters/GPU validation and provider-hosted payment/marketplace purchase integration remain in progress. Paid reconstruction and production payments default disabled. A visible sample model is explicitly attributed and is not inference output.

See [architecture](docs/ARCHITECTURE.md), [model audit](docs/MODEL_AUDIT.md), [14-day plan](docs/TASKS.md), [validation evidence](docs/validation/PLATFORM.md), [runbook](docs/RUNBOOK.md) and [release gates](docs/RELEASE_CHECKLIST.md). Never commit environment values, original uploads or model weights.
