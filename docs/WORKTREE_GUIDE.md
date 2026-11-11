# Three-track collaboration

A owns brand/routes/components and visual QA. B owns packages/mesh-editor and GPU adapters. C owns contracts/API/SQL/security/CI. Plan over14 days is in IMPLEMENTATION_PLAN.md. These are ownership tracks, not a claim of three concurrent engineers or completed work.

Current branch feat/mascot-redesign starts from the deployed independent-platform branch. Keep main unmerged until review. For an actual three-person run, create branches/worktrees from the same integration commit: git worktree add ../objectscan-brand -b feat/brand, similarly feat/editor and feat/platform. Do not share uncommitted files or environment files between checkouts. Each track proposes contract changes first; C integrates migration order, A/B consume the reviewed typed contract. All actual GPU runs share the host lock, irrespective of checkout. A/B CPU editor tests require no GPU.
