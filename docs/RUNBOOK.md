# Operations runbook

## Local development

Node 22+: `npx --yes npm@11 ci`. `npm run db:start` starts this project's isolated local Supabase. `supabase migration up --local` applies incremental migrations. Copy .env.example to apps/web/.env.local and configure local public URL/key plus server-only service role and worker secret; never commit values. Set REAL_GPU_VALIDATED=false, ENABLED_MODELS empty, PAYMENTS_MODE=disabled initially. `npm run dev` serves port 3000. `npm run doctor` prints inventory without secret values.

Automated DB tests read ignored .env.test.local with TEST_DATABASE_URL, TEST_SUPABASE_URL, TEST_SUPABASE_KEY, TEST_SERVICE_KEY. They refuse non-loopback databases and clean only their disposable UUID fixtures. Never point tests at production. Run `npm test`, `npm run test:e2e`, `npm run typecheck`, `npm run lint`, `npm run build`. Python: `python3 -m venv gpu-worker/.venv`, install `-e './gpu-worker[test,bake]'`, then `.venv/bin/python -m pytest gpu-worker/tests`.

## Hosted configuration

Vercel project objectscan is linked via ignored .vercel/project.json, root apps/web, source outside root enabled, Node22. GitHub App connection requires owner installation for automatic previews; authenticated manual CLI previews can deploy independently. Set NEXT_PUBLIC_APP_URL and Supabase URL/public key for each environment. Service role, worker token and Toss secret are server-only. Never copy localhost Supabase values into cloud. Configure Supabase Site URL, exact auth callback and reset redirect URLs, production SMTP and email confirmation/rate policies. Apply migrations using a controlled hosted DB connection; never reset a cloud database.

## GPU worker

Install base worker separately from pinned model environments. Use gpu-worker/.env.example and an administrator-owned adapters.json. An empty config is safe and advertises no models. Adapter arguments contain {work}; paths must be absolute and interpreter must belong to the model's isolated environment. Model adapter output contracts are documented in contracts/worker.md. Start `objectscan-worker` under a systemd service with restricted working directory, no inbound port, Restart=on-failure, KillMode=control-group, TimeoutStopSec=30 and a dedicated OS account. Keep originals/logs private and remove completed work according to retention policy after confirming stored artifacts.

Before enabling generation, execute real smoke for Pixal3D single and calibrated MV, Object-Aware Loss21+, Gaussian Wrapping20+, and SAM2. Record exact commits, environment lock, input licenses, elapsed time, peak VRAM, geometry/UV/image validation and screenshots. Neither available CUDA nor a baked synthetic fixture is a model smoke. Set DB validated_models and server REAL_GPU_VALIDATED/ENABLED_MODELS only for passing models.

## Recovery

Cancel in UI. Worker observes heartbeat failure, kills the subprocess group and acknowledges stop. The slot remains occupied until acknowledgement. On a dead host/expired lease, inspect nvidia-smi and OS process tree, stop residual adapter descendants, then use operator recovery confirmation. Never clear a lease solely because it expired. Review logs locally; scrub signed URLs/tokens before sharing. OOM fails explicitly; do not substitute another model. Retry same revision up to three attempts after freeing resources.

## Finance and moderation

Configure two pricing tables and commission bps deliberately. Toss test keys only; use PG sandbox to test approval, duplicate confirmation and webhook redelivery. Production financial operations are disabled until refund and reconciliation tests pass. Test-sale balances are not withdrawable. Review rights and lightweight derivative before approval. Download URLs expire in 120 seconds; public market previews are intentionally downloadable derivatives, never full originals. No automatic seller transfer exists. Data deletion requests enter audit review; operators must reconcile purchased asset entitlements and retention before acting.
