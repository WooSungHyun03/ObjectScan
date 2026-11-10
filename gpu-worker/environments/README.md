# Isolated CUDA environments

Do not install the model families into the base worker environment. Upstream source/checkpoints live outside this repository; exact source revisions are in `../models.lock.json`. Build extensions with the matching environment's CUDA toolkit, not `/usr/bin/nvcc`. The development host has CUDA 12.0 globally, which is incompatible with the Pixal build compiler configuration.

| Environment        | Python | Torch / CUDA  | Compiler                                | Observed state                                                                               |
| ------------------ | ------ | ------------- | --------------------------------------- | -------------------------------------------------------------------------------------------- |
| objectscan-sam2    | 3.11   | 2.5.1 / cu124 | Optional postprocess extension disabled | Single-image CUDA + browser/queue/mask review passed                                         |
| objectscan-pixal3d | 3.10   | 2.6.0 / cu124 | CUDA 12.4 + GCC 12                      | NATTEN/CuMesh/FlexGEMM/o_voxel/nvdiffrast installed; imports pass; inference pending         |
| objectscan-oal     | 3.10   | 2.5.1 / cu118 | CUDA 11.8 + GCC 11                      | diff-surfel/simple-knn compiled; Torch/Open3D/extension imports pass; reconstruction pending |
| objectscan-gw      | 3.9    | 2.3.1 / cu121 | CUDA 12.1 + GCC 12                      | Torch/requirements installed; native extension build pending                                 |

Use `CUDA_HOME=<env>`, `CUDACXX=<env>/bin/nvcc`, `CUDAHOSTCXX=/usr/bin/g++-12`, `CC=/usr/bin/gcc-12`, `CXX=/usr/bin/g++-12`, `<env>/bin` first in PATH, `TORCH_CUDA_ARCH_LIST=8.9`, `MAX_JOBS=2` (or 4 when enough RAM). Substitute GCC 11 for Object-Aware Loss. An explicit CUDACXX is necessary: CUDA_HOME alone did not prevent CMake selecting the system compiler. Use `--no-build-isolation` after installing matching Torch and build tools.

Pixal3D uses SDPA attention and FlexGEMM sparse convolution. Pin MoGe v2 from the manifest: current unpinned MoGe v3 conflicts with the upstream Trimesh version and does not match its v2 imports. Install CuMesh, FlexGEMM and TRELLIS.2/o-voxel from their recursive pinned checkouts separately; pip's duplicate direct CuMesh dependency otherwise conflicts. Initialize o_voxel's Eigen submodule before compiling. Install nvdiffrast 0.4.0 and the upstream `utils3d` 0.0.2 wheel; the unrelated PyPI utils3d 1.3 package lacks the required API. Pinned Pixal single-view weights have downloaded; additional DINO/NAF/MoGe downloads can occur at first inference. Multi-view weights and real 4-view execution remain separate gates.

SAM2 uses `SAM2_BUILD_CUDA=0` for the optional mask postprocessing extension; the model itself runs on CUDA. Keep checkpoint checksum validation. This option does not prove multi-view propagation quality.

Gaussian Wrapping's upstream install.py ignores subprocess failures and modifies the active environment. Run requirements and each required extension explicitly with fail-fast supervision. Triangulation additionally needs CGAL/GMP/CMake; texture refinement needs its actual rasterizer/nvdiffrast dependencies. Do not report a family installed or GPU-validated because one wheel compiled. Preserve private build logs in ignored artifacts and record each failed dependency in the model audit.

None of these environment observations enables generation. Require real outputs, measured memory/time, valid UV/baseColor texture, visual inspection and the corresponding release gates first.
