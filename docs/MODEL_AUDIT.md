# Model source audit — 2026-11-09

Source checkouts inspected outside application at ../model-audit. These are code findings, not successful GPU benchmarks.

| Adapter           | Pinned upstream commit                   | Inspected entrypoints                                                                                   |
| ----------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| pixal3d           | f7cf38429b0bd264f1995f0f8743a88b1c728b94 | inference.py, inference_mv.py, pixal3d/pipelines, assets/mv_images/example/transforms.json              |
| object_aware_loss | 3221821b165865dc77b7636598e55675043b87f4 | train.py, render.py, scene, utils/camera_utils.py, utils/mesh_utils.py                                  |
| gaussian_wrapping | 11e3b6fb5ca6f0a54e2b5587a09693488f3655af | gaussian_wrapping/scripts/train_and_extract_gw_ours.py, train_and_extract_gw_radegs.py, texture_mesh.py |

## Pixal3D

https://github.com/TencentARC/Pixal3D/tree/f7cf38429b0bd264f1995f0f8743a88b1c728b94

Single-image inference with MoGe estimated intrinsics differs from MV inference with supplied calibrated cameras. MV uses separate pipeline_mv.json checkpoints, premultiplied RGBA, horizontal camera_angle_x radians and 4x4 camera-to-world in Z-up world/OpenGL camera (-Z forward/+Y up). First frame must be canonical front (0,-d,0). load_views restricts first N entries rather than selecting representative views. Preserve framing and calibrations; never reuse example 90-degree poses on arbitrary photos. `--low_vram` offloads stage models; default low-VRAM output resolution is 1024, standard 1536. `ATTN_BACKEND=sdpa` avoids flash-attn only; it does not remove all native dependencies. Calls o_voxel GLB PBR export. Base environment follows TRELLIS.2, with NATTEN/native sparse voxel stack and separately downloaded checkpoints. Needs an isolated environment. Neither 16GB success nor elapsed time has been measured here.

## Object-Aware Loss

https://github.com/WooSungHyun03/object-aware-loss/tree/3221821b165865dc77b7636598e55675043b87f4

Per-scene training, not pretrained image inference. Source images + mask matching by stem + COLMAP sparse/0. train.py forces require_masks=True; loss includes masked L1 and polarization of alpha/ObjectMark. Camera utils use nearest mask resizing and reject missing masks. Scene loader expects supported undistorted pinhole cameras. render.py extracts TSDF triangle PLY (fuse.ply/fuse_post.ply); PLY/vertex colors do not establish UV-textured GLB. Separate unwrap + photo projection/bake + GLB validation is mandatory. environment.yml specifies Python 3.10, torch 2.5.1, CUDA 11.8, Open3D .18 and CUDA submodules. No claim that target iteration count fits 16GB.

## Gaussian Wrapping

https://github.com/diego1401/GaussianWrapping/tree/11e3b6fb5ca6f0a54e2b5587a09693488f3655af

Full scene: RGB/COLMAP, no SAM2 removal. Official wrapper calls training, pivot mesh extraction and texture_mesh sequentially. Default ours training flags include --data_device cpu and --N_max_gaussians 6000000. -r 2 forwards source resolution; extractor hardcodes iteration 30000. User training flags are not all propagated to extraction. Both wrappers check training and extraction return codes, but final texture subprocess return code is ignored. Our adapter must call stages separately with fail-fast handling, verify actual output paths and match extraction iteration to training iteration.

texture_mesh.py optimizes `verts_colors` as torch parameters and exports a trimesh vertex-colored PLY with `_texture_refined_<iteration>` suffix. It does not unwrap UVs or produce a baseColor atlas. A file named texture_refined is not proof of UV GLB. Docs use Python 3.9 with CUDA 11.8/12.1 examples, custom rasterizers, meshing and separate texture renderer dependencies; isolate from other models. Six million Gaussians is not a safe 16GB cap without measurement. Low-resolution settings and a conservative tested cap are launch gates, never fake a different model fallback.

## Observed host, not model validation

nvidia-smi sees NVIDIA GeForce RTX 4080, 16,376 MiB total, driver 580.173.02; about 2,256 MiB was already allocated at inspection. System Python has no torch. Existing unrelated conda environments and services will not be modified. Model environments/checkpoints/CUDA extension readiness must be inspected separately before smoke. REAL_GPU_VALIDATED=false for all three until model-specific reports pass geometry/UV/baseColor validation and visual review. No VRAM/time estimates are invented.

## 2026-11-10 installation findings

SAM2.1 small passed real RTX4080 inference and browser/queue/private-mask/review integration; see validation/sam2-single.json. Pixal3D torch2.6/cu124 and NATTEN0.21.0 built in a dedicated environment. System nvcc12.0 was incorrectly selected by CMake despite CUDA_HOME; explicitly selecting CUDACXX for the isolated12.4 compiler and GCC12 fixed the build. Native CuMesh/FlexGEMM compilation succeeded; o-voxel requires initializing TRELLIS.2's pinned Eigen submodule. Installing both a local CuMesh checkout and o-voxel's unpinned direct Git dependency in one pip resolution conflicts, so dependencies are pinned and installed separately.

Upstream Pixal3D's unpinned MoGe URL now resolves v3, which requires trimesh>=4.11 and conflicts with Pixal3D's4.10.1 pin. We selected the immutable MoGe v2 commit07444410f1e33f402353b99d6ccd26bd31e469e8 matching the importedv2 API. No vendor code was changed. The model weight repository contains42.88GiB including MV; pinned single-view weights finished downloading. Object-Aware Loss torch2.5.1/cu118, Open3D.18 and its pinned surfel/simple-knn native extensions installed in a separate environment. Gaussian Wrapping's separate Python3.9/Torch2.3.1+cu121 requirements are installed, with native extensions still building. None of these installation results constitutes a successful reconstruction model smoke.

The Pixal single-image adapter is being exercised with the same licensed shoe image and actual SAM2 mask used by the mask smoke. CPU weight loading is I/O intensive on this host; no mesh, execution-time or VRAM success is recorded until the entire adapter and GLB/visual checks finish. See gpu-worker/environments/README.md for compiler and dependency findings.

## Commercial-use evidence

The pinned [Object-Aware Loss LICENSE.md](https://github.com/WooSungHyun03/object-aware-loss/blob/3221821b165865dc77b7636598e55675043b87f4/LICENSE.md) and [Gaussian Wrapping LICENSE.md](https://github.com/diego1401/GaussianWrapping/blob/11e3b6fb5ca6f0a54e2b5587a09693488f3655af/LICENSE.md) both contain the Gaussian-Splatting license. Section 3.1 limits use to noncommercial research/evaluation; section 4.3 prohibits other use without prior consent. This is a separate production launch blocker from GPU feasibility. Current runs are internal research/evaluation, and paid generation remains disabled. Resolve applicable commercial rights for the source and dependencies before enabling paid workflows; do not infer permission from public repository access. Pixal3D's source LICENSE is MIT, but its checkpoints and native/transitive dependencies still need their own license inventory. No license procurement or legal approval has been completed.

## Hardware feasibility findings (continued)

- Fresh CPU COLMAP on 32 resized South Building photographs registered all 32, mean reprojection error 0.304315px. No provided poses or masks were used. This verifies the scene SfM path, not GW reconstruction or Pixal canonicalization. Summary: validation/colmap-scene.json.
- The unchanged upstream Pixal single-view low_vram/1024 run reached real CUDA inference, then failed with GPU_OOM in the NAF 1024 texture-conditioning output allocation. Its diagnostic requested 4GiB with 3.42GiB free and 10.59GiB process use. No GLB was produced; see validation/pixal-upstream-oom.json.
- An opt-in experimental NAF FP16 wrapper preserves its output dtype and leaves upstream source, source images and camera estimation intact. A NAF-only checkpoint test with synthetic DINO features passed 1024 output and a small-fixture FP32 comparison (relative mean absolute difference 0.003455). This is a precision feasibility test, not a reconstruction success. Real whole-pipeline output/visual checks are pending; production and MV remain disabled. The runner checks the pinned NAF source/checkpoint, recorded HF cache revisions and runs offline.
- GW native compilation initially selected CUDA13.5 despite cuda-version12.1. Explicitly pinning cuda-nvcc/cudart-dev/nvrtc-dev/cccl to12.1 corrected the mismatch; ours/simple-knn/fused-ssim, RaDe-GS/SOF/nvdiffrast/warp and CGAL tetra compiled. Import preflight additionally required the Mini-Splatting rasterizer imported by loss_utils; it is building.

- Experimental Pixal NAF FP16 single-view completed: 996087 triangles, 762579 vertices/UVs, 40,363,404-byte GLB with embedded baseColor texture. Wall time413.815s, sampled process-tree GPU maximum12996MiB. Semantic validation and actual private Storage → owner Three.js viewer → hash-matched signed download passed; anonymous access denied. No paid-generation or MV readiness is claimed. See validation/pixal-single-fp16.json.
- Actual 21-photo SAM2 propagation passed dimension/foreground checks (sampled visual review only). Object-masked SfM registered21/21, mean reprojection error0.286419px; source poses were not supplied. GW all required native imports now pass and full30k training is running. OAL30k is queued on the same host lock.
- Important upstream limit finding: --N_max_gaussians caps only **normal-field densification**. Standard RaDe-GS densification can exceed it; the ongoing500k-NF-cap run reached over1.8million Gaussians. CLI help now states that scope. Do not treat the flag as a hard global memory cap or a validated16GB guarantee.

### OAL21 measured output and visual gate

Full30000 iterations, fresh21/21 masked SfM and actual SAM2 inputs produced UV GLB:1,123,630 triangles,37,203,376 bytes, sampled process GPU peak1,946MiB, wall2631.653s. Semantic validation, private Three viewer and hash-matched signed download pass. Visual inspection finds broken building surfaces/large holes; this is a technical pipeline success with failed production quality, not an approved model. Only first21 SouthBuilding views were used and all propagated masks were not human-approved. No production model gate is opened. Preview color interpolation now filters zero-area TSDF faces and rejects nonfinite weights.

GW full32-view training completed, but lazy nvdiffrast compilation picked unsupported GCC13; explicit family compiler selection fixes this. A subsequent OpenGL/CUDA interop304 failure is being diagnosed using upstream MeshRasterizer(use_opengl=False) in an isolated wrapper, without modifying vendor files. This recovery is experimental and has separate timing from the saved30k training checkpoint.

Dense GW output revealed8,745,864 refined faces before UV unwrap, exceeding the128MiB output budget. The adapter now derives at most1,000,000 faces before baking, transfers measured refined vertex colors and records the original count plus nearest-source-vertex distance/bounding-box ratio (must be≤1%). This approximation is explicit and preserves the source PLY/checkpoint. CPU tests cover the cap, texture transfer and the upstream CUDA rasterizer option; the real bounded GW GLB is still pending. The opt-in `--gw-cuda-rasterizer` changes only the source-supported `use_opengl=False` constructor option in supervised mesh/texture subprocesses and records a separate execution profile.

## Noncommercial school deployment decision (2026-11-10)

The user explicitly states this is a school project and will never be commercial, and authorizes public access on that basis. Public educational hosting is no longer gated on commercial licensing. Payments, selling and payouts remain disabled by the education deployment policy. Original model/weight terms and attribution still apply; this is not a grant of rights or a commercial license. GPU quality and workflow verification are independent release gates.
