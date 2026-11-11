# ObjectScan product requirements

A Korean-first photo-to-mesh workspace with independent identity, private projects, object/scene reconstruction, GLB inspection, per-upload-count pricing and an asset marketplace. V3 source: OBJECTSCAN_CODEX_MASCOT_REDESIGN_HARNESS.md and design/DESIGN_SPEC.md. The old reference is archived. Photo originals are private. A visible demo is labeled and attributed separately from generated results.

Object workflow: create → upload 1–200 images → select reference object → SAM2 segmentation → inspect/review/exclude masks → camera alignment/preflight → server quote → test checkout → queued reconstruction → textured GLB inspection/download → optional rights-consented listing.

Scene workflow: create → upload overlapping scene photos → COLMAP alignment → server quote → test checkout → Gaussian Wrapping, mesh extraction and UV bake → scene GLB inspection/download. No object selection or SAM2 stage. At least twenty usable calibrated images are required by the current conservative generation gate.

One uploaded image counts once in a 20-image pricing band even if later excluded. Object/scene pricing is separate and configured by an operator; illustrative prices from the design are not production policy. Turntable captures remain blocked until pose/mask consistency is verified.

No runtime feature is complete merely because its UI exists. Paid generation requires actual GPU model validation, capability heartbeat, valid current-revision masks/cameras, configured price and verified payment. Production charging and marketplace financial launch require provider, refund, abuse/moderation and payout operations review.

## V3 school release

Korean mascot-led acquisition → /create → separate object/scene upload routes → private projects. Customers see production tasks and actionable errors; source/model attribution lives separately at /legal/opensource. School mode disables all commerce server-side. Actual reconstruction qualification remains a separate release gate.

After a valid GLB exists, /projects/[id]/edit opens a separate editor: orbit/zoom, transform gizmo and numeric input, axes, separate-part visibility/removal, center/normalize, undo/redo, bounded simplification, texture-preserving GLB export and private version save/reopen. Original artifacts remain immutable. /demo/edit is an explicitly labeled local example/import experience without cloud saving.

P0 is object/part editing, not face selection, sculpting, cutting or remeshing. Maximum embedded GLB is64MiB with bounded geometry/images; compressed, animated, skinned and externally referenced assets return actionable unsupported-input errors. Display-only LOD retains the full edited export. No browser upload runs a reconstruction model.
