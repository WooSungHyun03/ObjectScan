# ObjectScan product requirements

A Korean-first photo-to-mesh workspace with independent identity, private projects, object/scene reconstruction, GLB inspection, per-upload-count pricing and an asset marketplace. Reference: design/objectscan-ui-reference.png and DESIGN_SPEC.md. Photo originals are private. A visible demo is labeled and attributed separately from generated results.

Object workflow: create → upload 1–200 images → select reference object → SAM2 segmentation → inspect/review/exclude masks → camera alignment/preflight → server quote → test checkout → queued reconstruction → textured GLB inspection/download → optional rights-consented listing.

Scene workflow: create → upload overlapping scene photos → COLMAP alignment → server quote → test checkout → Gaussian Wrapping, mesh extraction and UV bake → scene GLB inspection/download. No object selection or SAM2 stage. At least twenty usable calibrated images are required by the current conservative generation gate.

One uploaded image counts once in a 20-image pricing band even if later excluded. Object/scene pricing is separate and configured by an operator; illustrative prices from the design are not production policy. Turntable captures remain blocked until pose/mask consistency is verified.

No runtime feature is complete merely because its UI exists. Paid generation requires actual GPU model validation, capability heartbeat, valid current-revision masks/cameras, configured price and verified payment. Production charging and marketplace financial launch require provider, refund, abuse/moderation and payout operations review.
