# Engineering decisions

- 2026-11-09: New repository implementation; no import of legacy Sites project. Independent Next.js 16 / React 19 / Supabase / Vercel; Node 22 pinned on hosting.
- Model commits pinned by MODEL_AUDIT; adapters isolated because upstream Python/CUDA/native extension requirements differ.
- PostgreSQL queue instead of a separate Redis dependency for a single 4080; explicit global slot and lease fencing, no TTL-only automatic recycling.
- Private exact-path signed storage instead of proxying large originals through Vercel.
- Human mask review and conservative generation gates prevent charging for unsupported captures/model readiness.
- Provider sandbox only; no invented HMAC validation of Toss notifications. Authenticated provider requery is authoritative.
- No invented pricing, benchmark, pose or model success. REAL_GPU_VALIDATED remains false.
- xatlas rasterization converts refined vertex colors to an embedded UV texture; source-detail limitations are explicit. Real per-model output inspection is still mandatory.
- Existing unrelated GPU/conda/Docker projects are never modified. Dedicated local DB ports and model environments are used.
