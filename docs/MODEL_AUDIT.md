# Model source audit — 2026-11-09

Source checkouts inspected outside application at ../model-audit. These are code findings, not successful GPU benchmarks.

| Adapter | Pinned upstream commit | Inspected entrypoints |
|---|---|---|
| pixal3d | f7cf38429b0bd264f1995f0f8743a88b1c728b94 | inference.py, inference_mv.py, pixal3d/pipelines, assets/mv_images/example/transforms.json |
| object_aware_loss | 3221821b165865dc77b7636598e55675043b87f4 | train.py, render.py, scene, utils/camera_utils.py, utils/mesh_utils.py |
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
