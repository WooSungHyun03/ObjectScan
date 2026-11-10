# Operations runbook

## Local development

Node 22+: `npx --yes npm@11 ci`. `npm run db:start` starts this project's isolated local Supabase. `supabase migration up --local` applies incremental migrations. Copy .env.example to apps/web/.env.local and configure local public URL/key plus server-only service role and worker secret; never commit values. Set REAL_GPU_VALIDATED=false, ENABLED_MODELS empty, PAYMENTS_MODE=disabled initially. `npm run dev` serves port 3000. `npm run doctor` prints inventory without secret values.

Automated DB tests read ignored .env.test.local with TEST_DATABASE_URL, TEST_SUPABASE_URL, TEST_SUPABASE_KEY, TEST_SERVICE_KEY. They refuse non-loopback databases and clean only their disposable UUID fixtures. Never point tests at production. Run `npm test`, `npm run test:e2e`, `npm run typecheck`, `npm run lint`, `npm run build`. Python: `python3 -m venv gpu-worker/.venv`, install `-e './gpu-worker[test,bake]'`, then `.venv/bin/python -m pytest gpu-worker/tests`.

## Hosted configuration

Vercel project objectscan is linked via ignored .vercel/project.json, root apps/web, source outside root enabled, Node22. GitHub App connection requires owner installation for automatic previews; authenticated manual CLI previews can deploy independently. Set NEXT_PUBLIC_APP_URL and Supabase URL/public key for each environment. Service role, worker token and Toss secret are server-only. Never copy localhost Supabase values into cloud. Configure Supabase Site URL, exact auth callback and reset redirect URLs, production SMTP and email confirmation/rate policies. Apply migrations using a controlled hosted DB connection; never reset a cloud database.

## GPU worker

Install base worker separately from pinned model environments. Use gpu-worker/.env.example and an administrator-owned adapters.json. An empty config is safe and advertises no models. Adapter arguments contain {work}; paths must be absolute and interpreter must belong to the model's isolated environment. Model adapter output contracts are documented in contracts/worker.md. Start `objectscan-worker` under a systemd service with restricted working directory, no inbound port, Restart=on-failure, KillMode=control-group, TimeoutStopSec=30 and a dedicated OS account. Keep originals/logs private and remove completed work according to retention policy after confirming stored artifacts.

The service template is `gpu-worker/deploy/objectscan-worker.service`. Provision the dedicated `objectscan` account, `/srv/objectscan/app`, `/var/lib/objectscan/jobs`, `/var/cache/objectscan` and `/etc/objectscan/worker.env` (0600) before installation. Adjust absolute adapter paths to the deployed environments. The template has not been installed on this development machine; syntax inspection reports the expected missing `/srv` executable until provisioned. It grants GPU device access and writable model caches but opens no listener. Use the same work root for all worker/smoke processes so the host lock is shared.

Run `gpu-worker/.venv/bin/python scripts/smoke-model.py --help` for the bounded hardware harness. Prepare an ignored private work directory with actual inputs and `manifest.json`; supply pinned source repo, isolated model interpreter and the worker's work root. The harness refuses an occupied host lock, supervises the entire subprocess group with a timeout, removes stale success reports, and requires measured GPU usage. A passing reduced-iteration smoke is not evidence of default-iteration reconstruction quality. Neither this harness nor the adapter enables production models automatically.

Before enabling generation, execute real smoke for Pixal3D single and calibrated MV, Object-Aware Loss21+, Gaussian Wrapping20+, and SAM2. Record exact commits, environment lock, input licenses, elapsed time, peak VRAM, geometry/UV/image validation and screenshots. Neither available CUDA nor a baked synthetic fixture is a model smoke. Set DB validated_models and server REAL_GPU_VALIDATED/ENABLED_MODELS only for passing models.

## Recovery

Cancel in UI. Worker observes heartbeat failure, kills the subprocess group and acknowledges stop. The slot remains occupied until acknowledgement. On a dead host/expired lease, inspect nvidia-smi and OS process tree, stop residual adapter descendants, then use operator recovery confirmation. Never clear a lease solely because it expired. Review logs locally; scrub signed URLs/tokens before sharing. OOM fails explicitly; do not substitute another model. Retry same revision up to three attempts after freeing resources.

## Finance and moderation

Configure two pricing tables and commission bps deliberately. Toss test keys only; use PG sandbox to test approval, duplicate confirmation and webhook redelivery. Production financial operations are disabled until refund and reconciliation tests pass. Test-sale balances are not withdrawable. Review rights and lightweight derivative before approval. Download URLs expire in 120 seconds; public market previews are intentionally downloadable derivatives, never full originals. No automatic seller transfer exists. Data deletion requests enter audit review; operators must reconcile purchased asset entitlements and retention before acting.

Billing accepts owner-scoped refund review requests; operators can perform full sandbox refunds. Completed/in-progress generation requires separate review and is blocked by the refund endpoint. The server re-queries the authenticated [Toss Payment API](https://docs.tosspayments.com/reference) and requires CANCELED, zero balance and DONE cancellations matching the entire stored amount. The service-only transaction reverses the sandbox ledger and revokes only that order's purchase entitlement; old webhook retries cannot revoke a repurchase. Tests simulate provider responses explicitly. Real hosted Toss cancellation remains unverified without test keys; live refunds and seller debt/transfer reconciliation are not enabled.

Cloud Supabase: the user selected a new ObjectScan-only project. Creation was rejected because the organization already has two active free projects (SceneScan/AISaaS). Neither existing project was changed. Resolve capacity or authorize a specific pause before retrying creation; do not reuse another project's database or reset hosted data.

## Abandoned uploads

An operator can run **만료된 업로드 정리** in the admin panel (POST `/api/admin/cleanup-uploads`). Each batch tombstones at most 25 pending/rejected reservations older than 25 hours, then deletes only exact owner/project/image original and normalized object keys. Verified inputs are excluded. [Supabase signed upload URLs](https://supabase.com/docs/reference/javascript/file-buckets-createsigneduploadurl) last two hours; the larger cutoff also exceeds its documented 24h resumable URL lifetime. A tombstoned row cannot finalize late. Deletion errors preserve the storage reservation and permit another claim after five minutes. Rejected uploads continue to reserve their transport maximum until deletion succeeds. The local integration test uses actual private Storage objects and verifies expired removal, fresh/verified preservation, idempotency, late-finalize denial and authenticated RPC rejection. This maintenance action is implemented; it has not been scheduled on hosted resources. Retention/deletion of verified originals, masks, trained checkpoints and purchased assets remains a separate operational gate.

### Dedicated hosted staging (2026-11-10)

User authorized pausing AISaaS; project `dvkfvommrhvlvuccxgeh` is INACTIVE and recoverable through Supabase. Do not delete it. SceneScan is untouched. ObjectScan `ctdzibelbwaujvngmxgg` (Seoul) has11 migrations; scoped Preview environment uses this project, while local tests keep loopback56321/56322. Vercel Deployment Protection remains enabled. Preview Auth allows only the ObjectScan deployment hostname pattern and requires email confirmation. Hosted test identities were created confirmed through the admin API, so SMTP delivery is still a release gate. Never run the destructive local test suite against hosted data. Production promotion remains blocked by model/rights/payment/SMTP/review gates.
