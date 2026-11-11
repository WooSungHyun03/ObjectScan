# V5 launch runbook

## Boundaries

V4 public production remains unchanged. V5 uses a manual Vercel Preview (project has no connected Git repository; Preview-only variables, never Production), test keys only, no live charge/payout. The dedicated ObjectScan Supabase project is shared with the prior release; additive schema migrations must pass local tests and dry-run against exact ref ctdzibelbwaujvngmxgg before applying. Never run generic destructive tests on hosted data. Hosted fixtures must use explicit IDs and clean only their resources.

## Qualification

Both environment REAL_GPU_VALIDATED/ENABLED_MODELS and DB validated_models/validated_profiles are required. A single-image profile is `{model:"pixal3d",min_images:1,max_images:1}`; it cannot authorize multi-view. Empty profiles fail closed. One GPU process, one atomic DB slot, fencing tokens, no TTL-only recycling. Actual end-to-end output and visual review precede activation. Full1024 multi-view, OAL and GW remain unqualified.

## Credits and test finance

Credit unit pricing lives in generation_credit_rates; packages in credit_packages. Both disabled/unconfigured by default. Do not publish fixture prices as official prices. A request either consumes a paid legacy order OR credit units, never both. Credit failure/cancel recovery is atomic; retries append new debit/recovery cycles. Trial grants require confirmed email, once per identity and a global operator-configured account cap; disabled by default.

Only test_ck/test_gck and test_sk/test_gsk pairs are supported. Current supplied keys are standard payment-window keys; SDK2 window is actually tested. Widget branch requires widget credentials and its own verification. Browser redirects never settle money: provider confirm/requery + atomic settlement are authoritative. Duplicate confirmations/webhooks cannot grant twice. Credit refund reserves units before provider cancellation. If a network failure leaves the provider state uncertain, keep the reservation and requery/retry the same order; never release solely on timeout. No automatic seller transfers; test sales remain virtual ledger entries.

## Worker recovery

Observe actual child processes/GPU use and the exact slot/job first. Stop the process group, preserve logs, and only then use existing admin reconcile with explicit GPU-stopped confirmation after lease expiry. This action is audited. Never delete an occupied slot to make a test pass. Local GPU and full DB integration tests must not run concurrently because the latter deliberately exercise the global slot. The v5 local run demonstrated a safe stop on API outage; local recovery evidence is in artifacts/launch-v5/local-recovery.json.

## Rollback

Keep the prior Vercel production alias/deployment. New migrations default to disabled gates and preserve prior order/marketplace settlement through dedicated wrapper functions. Roll back application by promoting its recorded prior artifact; do not drop financial history or down-migrate active ledgers. Disable new Preview variables/profiles/trial/package rates to close entry points. Domain changes require the separate DOMAIN_MIGRATION approval and exported zone snapshot.
