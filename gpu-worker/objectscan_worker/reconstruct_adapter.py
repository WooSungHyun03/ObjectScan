"""Pinned upstream stage orchestration. Actual inference, no alternative model fallback.
Run this in the base worker environment; --python selects the isolated model environment.
"""

import argparse
import hashlib
import json
import math
import os
import shutil
import struct
import subprocess
import threading
import time
from pathlib import Path

import numpy as np
from PIL import Image


def model_environment(model, prefix, parent):
    """Keep lazy Torch CUDA builds on the same compiler as native installation."""
    version = "11" if model == "object_aware_loss" else "12"
    cc, cxx = f"/usr/bin/gcc-{version}", f"/usr/bin/g++-{version}"
    if not shutil.which(cc) or not shutil.which(cxx):
        raise ValueError("MODEL_HOST_COMPILER_MISSING")
    env = parent.copy()
    env.update(
        CUDA_HOME=str(prefix),
        CUDACXX=str(prefix / "bin/nvcc"),
        CC=cc,
        CXX=cxx,
        CUDAHOSTCXX=cxx,
        PATH=str(prefix / "bin") + os.pathsep + env.get("PATH", ""),
        ATTN_BACKEND="sdpa",
        MAX_JOBS="4",
        PYTHONUNBUFFERED="1",
    )
    return env


def plan(
    model,
    work,
    repo,
    python,
    iterations=30000,
    max_gaussians=500000,
    gw_cuda_rasterizer=False,
):
    work, repo = Path(work), Path(repo)
    dataset = work / "dataset"
    output = work / "trained"
    if model == "object_aware_loss":
        return [
            [
                python,
                str(repo / "train.py"),
                "-s",
                str(dataset),
                "-m",
                str(output),
                "--iterations",
                str(iterations),
                "--save_iterations",
                str(iterations),
                "--resolution",
                "2",
            ],
            [
                python,
                str(repo / "render.py"),
                "-s",
                str(dataset),
                "-m",
                str(output),
                "--iteration",
                str(iterations),
                "--skip_test",
            ],
        ]
    if model == "gaussian_wrapping":
        shared = ["-s", str(dataset), "-m", str(output), "-r", "2"]
        stages = [
            [
                python,
                str(repo / "gaussian_wrapping/train.py"),
                *shared,
                "--rasterizer",
                "ours",
                "--iterations",
                str(iterations),
                "--data_device",
                "cpu",
                "--N_max_gaussians",
                str(max_gaussians),
                "--feature_dc_lr",
                "0.0013",
                "--feature_rest_lr",
                "0.00011",
                "--exposure_compensation",
            ],
            [
                python,
                str(repo / "gaussian_wrapping/pivot_based_mesh_extraction.py"),
                *shared,
                "--rasterizer",
                "ours",
                "--sdf_mode",
                "ours",
                "--dtype",
                "int32",
                "--isosurface_value",
                "0.0",
                "--n_binary_steps",
                "10",
                "--iteration",
                str(iterations),
                "--use_valid_mask",
                "--postprocess",
                "--filter_large_edges",
                "--data_device",
                "cpu",
            ],
            [
                python,
                str(repo / "gaussian_wrapping/texture_mesh.py"),
                *shared,
                "--rasterizer",
                "ours",
                "--mesh",
                str(output / "mesh_ours_2pivots_post.ply"),
                "--iteration",
                str(iterations),
            ],
        ]
        if gw_cuda_rasterizer:
            runner = str(Path(__file__).with_name("gw_stage_runner.py"))
            for i in (1, 2):
                stages[i] = [
                    python,
                    runner,
                    "--repo",
                    str(repo),
                    "--stage",
                    Path(stages[i][1]).name,
                    "--",
                    *stages[i][2:],
                ]
        return stages
    raise ValueError("MODEL_UNAVAILABLE")


def rgba(work, ref, destination):
    image = Image.open(work / "images" / (ref["image_id"] + ".jpg")).convert("RGBA")
    mask = Image.open(work / "masks" / (ref["image_id"] + ".png")).convert("L")
    if mask.size != image.size:
        raise ValueError("MASK_INVALID")
    image.putalpha(mask)
    image.save(destination)


def pixal_views(work, manifest):
    views = work / "views"
    views.mkdir(exist_ok=True)
    if manifest["input_image_count"] == 1:
        path = views / "input.png"
        rgba(work, manifest["images"][0], path)
        return path
    pose = manifest.get("pose_report")
    if (
        not pose
        or not pose.get("canonical_front_verified")
        or len(pose["selected_view_ids"]) not in (2, 4, 6, 8)
    ):
        raise ValueError("POSE_UNAVAILABLE")
    frames = []
    for i, image_id in enumerate(pose["selected_view_ids"]):
        camera = next(c for c in pose["cameras"] if c["image_id"] == image_id)
        if not math.isclose(camera["fx"], camera["fy"], rel_tol=0.001):
            raise ValueError("NON_SQUARE_CAMERA_PIXELS")
        ref = next(r for r in manifest["images"] if r["image_id"] == image_id)
        path = views / f"{i:03d}.png"
        rgba(work, ref, path)
        image = Image.open(path)
        w, h = image.size
        if (camera["width"], camera["height"]) != (w, h):
            raise ValueError("POSE_DIMENSION_MISMATCH")
        side = int(
            math.ceil(
                2 * max(camera["cx"], w - camera["cx"], camera["cy"], h - camera["cy"])
            )
        )
        left, top = round(side / 2 - camera["cx"]), round(side / 2 - camera["cy"])
        padded = Image.new("RGBA", (side, side))
        padded.paste(image, (left, top))
        padded.save(path)
        frames.append(
            {
                "file_path": path.name,
                "transform_matrix": np.array(camera["c2w"]).reshape(4, 4).tolist(),
                "camera_angle_x": 2 * math.atan(side / (2 * camera["fx"])),
            }
        )
    (views / "transforms.json").write_text(
        json.dumps({"camera_angle_x": frames[0]["camera_angle_x"], "frames": frames})
    )
    return views


def quality(path, peak, elapsed):
    import trimesh

    raw = path.read_bytes()
    length = struct.unpack_from("<I", raw, 12)[0]
    gltf = json.loads(raw[20 : 20 + length])
    triangles = vertices = uv = texture = 0
    for mesh in gltf["meshes"]:
        for primitive in mesh["primitives"]:
            attrs = primitive["attributes"]
            vertices += gltf["accessors"][attrs["POSITION"]]["count"]
            uv += gltf["accessors"][attrs["TEXCOORD_0"]]["count"]
            triangles += gltf["accessors"][primitive["indices"]]["count"] // 3
            mat = gltf["materials"][primitive["material"]]
            tex = gltf["textures"][
                mat["pbrMetallicRoughness"]["baseColorTexture"]["index"]
            ]
            source = tex.get(
                "source",
                tex.get("extensions", {}).get("EXT_texture_webp", {}).get("source"),
            )
            texture += gltf["bufferViews"][gltf["images"][source]["bufferView"]][
                "byteLength"
            ]
    if peak <= 0:
        raise ValueError("GPU_MEASUREMENT_REQUIRED")
    mesh = trimesh.load(path, force="mesh", process=False)
    return {
        "triangles": triangles,
        "vertices": vertices,
        "uv_count": uv,
        "texture_bytes": texture,
        "sha256": hashlib.sha256(raw).hexdigest(),
        "size_bytes": len(raw),
        "watertight": bool(mesh.is_watertight),
        "elapsed_seconds": elapsed,
        "gpu_peak_mib": peak,
        "real_gpu": True,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--work", type=Path, required=True)
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument("--python", required=True)
    parser.add_argument("--weights", type=Path)
    parser.add_argument("--pixal-naf-fp16", action="store_true")
    parser.add_argument("--gw-cuda-rasterizer", action="store_true")
    parser.add_argument("--iterations", type=int, default=30000)
    parser.add_argument(
        "--normal-field-gaussian-cap",
        "--max-gaussians",
        dest="max_gaussians",
        type=int,
        default=500000,
        help="Upstream normal-field densification cap only; regular Gaussian densification can exceed it",
    )
    args = parser.parse_args()
    work = args.work.resolve()
    manifest = json.loads((work / "manifest.json").read_text())
    model = manifest["model"]
    if args.pixal_naf_fp16 and model != "pixal3d":
        raise ValueError("PRECISION_PROFILE_MODEL_MISMATCH")
    if args.gw_cuda_rasterizer and model != "gaussian_wrapping":
        raise ValueError("RASTERIZER_PROFILE_MODEL_MISMATCH")
    lock = json.loads((Path(__file__).parent.parent / "models.lock.json").read_text())[
        model
    ]
    actual = subprocess.check_output(
        ["git", "rev-parse", "HEAD"], cwd=args.repo, text=True
    ).strip()
    if actual != lock["commit"]:
        raise ValueError("MODEL_COMMIT_MISMATCH")
    if manifest["kind"] != "generation":
        raise ValueError("GENERATION_REQUIRED")
    prefix = Path(args.python).resolve().parent.parent
    env = model_environment(model, prefix, os.environ)
    # GPU memory samples include this adapter's descendant CUDA processes, never unrelated desktop jobs.
    import psutil

    peak = [0.0]
    stop = threading.Event()

    def monitor():
        while not stop.is_set():
            try:
                pids = {
                    os.getpid(),
                    *(p.pid for p in psutil.Process().children(recursive=True)),
                }
                text = subprocess.check_output(
                    [
                        "nvidia-smi",
                        "--query-compute-apps=pid,used_gpu_memory",
                        "--format=csv,noheader,nounits",
                    ],
                    text=True,
                    timeout=5,
                )
                amount = sum(
                    float(row.split(",")[1])
                    for row in text.splitlines()
                    if int(row.split(",")[0]) in pids
                )
                peak[0] = max(peak[0], amount)
            except (OSError, ValueError, subprocess.SubprocessError, psutil.Error):
                pass
            stop.wait(0.5)

    thread = threading.Thread(target=monitor, daemon=True)
    thread.start()
    started = time.monotonic()

    def run(argv):
        subprocess.run(argv, cwd=args.repo, env=env, check=True)

    try:
        from .adapters import REGISTRY, Context

        context = Context(
            work,
            args.repo,
            args.python,
            manifest,
            run,
            args.iterations,
            args.max_gaussians,
        )
        context.weights = args.weights
        context.pixal_naf_fp16 = args.pixal_naf_fp16
        context.gw_cuda_rasterizer = args.gw_cuda_rasterizer
        adapter = REGISTRY[model](context)
        adapter.validate()
        adapter.prepare()
        adapter.execute()
        adapter.extract_mesh()
        adapter.texture_bake()
        report = adapter.validate_artifact(peak[0], time.monotonic() - started)
        adapter.cleanup()
        (work / "result.json").write_text(
            json.dumps(
                {
                    "quality": report,
                    "execution_profile": "naf_fp16"
                    if args.pixal_naf_fp16
                    else "gw_cuda_rasterizer"
                    if args.gw_cuda_rasterizer
                    else "upstream",
                }
            )
        )
    finally:
        stop.set()
        thread.join(timeout=6)


if __name__ == "__main__":
    main()
