"""Measured SfM only. Canonical MV is deliberately gated until alignment is verified."""

import argparse
import json
import shutil
import subprocess
from pathlib import Path

import numpy as np

from .cameras import canonicalize, colmap_to_opengl_z_up, representative_views


def parse_cameras(path: Path):
    cameras = {}
    for line in path.read_text().splitlines():
        if not line or line.startswith("#"):
            continue
        row = line.split()
        cid = int(row[0])
        model = row[1]
        w, h = map(int, row[2:4])
        params = list(map(float, row[4:]))
        if model == "PINHOLE":
            fx, fy, cx, cy = params
        elif model == "SIMPLE_PINHOLE":
            fx, cx, cy = params
            fy = fx
        else:
            raise ValueError("UNDISTORTED_PINHOLE_REQUIRED")
        cameras[cid] = {"width": w, "height": h, "fx": fx, "fy": fy, "cx": cx, "cy": cy}
    return cameras


def parse_images(path: Path, cameras):
    result = []
    lines = iter(path.read_text().splitlines())
    for line in lines:
        if not line or line.startswith("#"):
            continue
        row = line.split(maxsplit=9)
        if len(row) != 10:
            raise ValueError("POSE_UNAVAILABLE")
        pose = colmap_to_opengl_z_up(
            list(map(float, row[1:5])), list(map(float, row[5:8]))
        )
        result.append(
            {
                "image_id": Path(row[9]).stem,
                **cameras[int(row[8])],
                "c2w": pose.flatten().tolist(),
                "convention": "opengl_z_up",
            }
        )
        next(
            lines, None
        )  # every image header is followed by its points2D line, which can be blank
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--work", type=Path, required=True)
    parser.add_argument("--colmap", default="colmap")
    args = parser.parse_args()
    work = args.work
    manifest = json.loads((work / "manifest.json").read_text())
    if manifest["capture_mode"] != "camera_orbit" or len(manifest["images"]) < 2:
        raise ValueError("POSE_UNAVAILABLE")
    source = work / "images"
    database = work / "colmap.db"
    sparse = work / "sparse"
    sparse.mkdir(exist_ok=True)

    def run(command):
        subprocess.run([args.colmap, *map(str, command)], check=True)

    feature = [
        "feature_extractor",
        "--database_path",
        database,
        "--image_path",
        source,
        "--ImageReader.camera_model",
        "SIMPLE_PINHOLE",
        "--ImageReader.single_camera",
        "0",
        "--SiftExtraction.use_gpu",
        "0",
        "--SiftExtraction.num_threads",
        "4",
        "--SiftExtraction.max_image_size",
        "2000",
    ]
    if manifest["mode"] == "object":
        masks = work / "colmap_masks"
        masks.mkdir(exist_ok=True)
        for image in manifest["images"]:
            filename = image["image_id"]
            mask = work / "masks" / (filename + ".png")
            if not mask.exists():
                raise ValueError("MASK_REVIEW_REQUIRED")
            shutil.copy2(mask, masks / (filename + ".jpg.png"))
        feature += ["--ImageReader.mask_path", masks]
    run(feature)
    run(
        [
            "exhaustive_matcher",
            "--database_path",
            database,
            "--SiftMatching.use_gpu",
            "0",
            "--SiftMatching.num_threads",
            "4",
        ]
    )
    run(
        [
            "mapper",
            "--database_path",
            database,
            "--image_path",
            source,
            "--output_path",
            sparse,
            "--Mapper.num_threads",
            "4",
        ]
    )
    models = []
    for model in sorted(sparse.iterdir()):
        if not model.is_dir():
            continue
        text = work / ("model_text_" + model.name)
        text.mkdir(exist_ok=True)
        run(
            [
                "model_converter",
                "--input_path",
                model,
                "--output_path",
                text,
                "--output_type",
                "TXT",
            ]
        )
        rows = [
            line
            for line in (text / "images.txt").read_text().splitlines()
            if line and not line.startswith("#")
        ]
        models.append((len(rows) // 2, model))
    if not models:
        raise ValueError("POSE_UNAVAILABLE")
    _, best = max(models, key=lambda pair: pair[0])
    dataset = work / "dataset"
    run(
        [
            "image_undistorter",
            "--image_path",
            source,
            "--input_path",
            best,
            "--output_path",
            dataset,
            "--output_type",
            "COLMAP",
        ]
    )
    final = work / "undistorted_text"
    final.mkdir(exist_ok=True)
    run(
        [
            "model_converter",
            "--input_path",
            dataset / "sparse",
            "--output_path",
            final,
            "--output_type",
            "TXT",
        ]
    )
    cameras = parse_images(final / "images.txt", parse_cameras(final / "cameras.txt"))
    expected = {i["image_id"] for i in manifest["images"]}
    if any(c["image_id"] not in expected for c in cameras):
        raise ValueError("POSE_UNAVAILABLE")
    errors = []
    points = []
    for line in (final / "points3D.txt").read_text().splitlines():
        if line and not line.startswith("#"):
            row = line.split()
            errors.append(float(row[7]))
            x, y, z = map(float, row[1:4])
            points.append([x, -z, y])
    if not errors or not np.isfinite(errors).all():
        raise ValueError("POSE_UNAVAILABLE")
    # Exact undistorted normalized images change their coordinate system; export calibration and image paths together.
    report = {
        "registered": len(cameras),
        "candidate_count": len(expected),
        "selected_view_ids": [c["image_id"] for c in cameras],
        "cameras": cameras,
        "canonical_front_verified": False,
        "reprojection_error": float(np.mean(errors)),
        "provenance": "colmap",
    }
    if manifest["mode"] == "object" and manifest["input_image_count"] <= 20:
        # Never set canonical_front_verified merely because SfM succeeded. Canonicalization must be independently checked.
        cameras, similarity = canonicalize(
            cameras, np.asarray(points), manifest["target_image_id"]
        )
        report["cameras"] = cameras
        report["canonical_front_verified"] = True
        (work / "canonical_similarity.json").write_text(json.dumps(similarity))
        report["selected_view_ids"] = representative_views(
            cameras, max(n for n in (2, 4, 6, 8) if n <= len(cameras))
        )
    (work / "result.json").write_text(json.dumps({"pose": report}))


if __name__ == "__main__":
    main()
