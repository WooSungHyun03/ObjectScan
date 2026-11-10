import sys
import time
from pathlib import Path

import numpy as np
import pytest
from objectscan_worker.cameras import (
    adjusted_intrinsics,
    colmap_to_opengl_z_up,
    horizontal_fov,
    representative_views,
)
from objectscan_worker.contracts import checked_storage_url
from objectscan_worker.process import JobStopped, ProcessFailure, run_stage


def test_pose_conversion_preserves_camera_center_and_handedness():
    m = colmap_to_opengl_z_up([1, 0, 0, 0], [1, 2, 3])
    assert np.allclose(m[:3, 3], [-1, 3, -2])
    assert np.isclose(np.linalg.det(m[:3, :3]), 1)
    assert np.allclose(m[3], [0, 0, 0, 1])
    with pytest.raises(ValueError):
        colmap_to_opengl_z_up([0, 0, 0, 0], [0, 0, 0])


def test_crop_resize_intrinsics_and_fov():
    assert adjusted_intrinsics(100, 120, 50, 60, 0.5, 0.5, 10, 20) == (50, 60, 20, 20)
    assert np.isclose(horizontal_fov(200, 100), np.pi / 2)


def test_views_use_measured_positions():
    cameras = []
    for i, x in enumerate([0, 1, 2, 10]):
        pose = np.eye(4)
        pose[0, 3] = x
        cameras.append({"image_id": str(i), "c2w": pose.flatten().tolist()})
    assert representative_views(cameras, 2) == ["0", "3"]
    with pytest.raises(ValueError):
        representative_views(cameras, 3)


@pytest.mark.parametrize(
    "url",
    [
        "https://evil.test/storage/v1/object/x",
        "https://storage.test/admin",
        "http://storage.test/storage/v1/object/x",
        "https://user@storage.test/storage/v1/object/x",
    ],
)
def test_no_signed_url_ssrf(url):
    with pytest.raises(ValueError):
        checked_storage_url(url, "https://storage.test")


def test_subprocess_failure_is_fail_fast(tmp_path):
    with pytest.raises(ProcessFailure, match="WORKER_ERROR"):
        run_stage(
            [sys.executable, "-c", "raise SystemExit(4)"],
            tmp_path,
            tmp_path / "log",
            lambda: True,
        )


def test_cancellation_kills_parent_and_child_before_return(tmp_path):
    pidfile = tmp_path / "child"
    script = "import subprocess,time; p=subprocess.Popen(['sleep','60']);open('child','w').write(str(p.pid));time.sleep(60)"

    def tick():
        return not pidfile.exists()

    with pytest.raises(JobStopped):
        run_stage([sys.executable, "-c", script], tmp_path, tmp_path / "log", tick)
    pid = int(pidfile.read_text())
    status = Path(f"/proc/{pid}/status")
    # A reaped or zombie child cannot retain GPU memory or execute further work.
    assert not status.exists() or "State:\tZ" in status.read_text()


def test_timeout_terminates_process(tmp_path):
    start = time.monotonic()
    with pytest.raises(ProcessFailure, match="TIMEOUT"):
        run_stage(
            [sys.executable, "-c", "import time;time.sleep(60)"],
            tmp_path,
            tmp_path / "log",
            lambda: True,
            timeout=0.1,
        )
    assert time.monotonic() - start < 10


def test_uv_bake_exports_embedded_basecolor_and_uv(tmp_path):
    import json
    import struct

    import trimesh
    from objectscan_worker.bake import bake_vertex_colors

    mesh = trimesh.creation.icosphere(subdivisions=1)
    mesh.visual.vertex_colors = np.tile([180, 80, 40, 255], (len(mesh.vertices), 1))
    source = tmp_path / "mesh.ply"
    source.write_bytes(mesh.export(file_type="ply"))
    output = tmp_path / "mesh.glb"
    report = bake_vertex_colors(source, output, resolution=128)
    raw = output.read_bytes()
    length = struct.unpack_from("<I", raw, 12)[0]
    gltf = json.loads(raw[20 : 20 + length])
    assert report["triangles"] == len(mesh.faces)
    assert "TEXCOORD_0" in gltf["meshes"][0]["primitives"][0]["attributes"]
    assert (
        gltf["materials"][0]["pbrMetallicRoughness"]["baseColorTexture"]["index"] == 0
    )
    assert gltf["images"][0]["bufferView"] >= 0


def test_colmap_parser_preserves_measured_intrinsics_and_skips_observation_lines(
    tmp_path,
):
    from objectscan_worker.colmap_adapter import parse_cameras, parse_images

    cp = tmp_path / "cameras.txt"
    cp.write_text("# header\n1 PINHOLE 640 480 500 501 320 240\n")
    ip = tmp_path / "images.txt"
    ip.write_text(
        "# header\n1 1 0 0 0 1 2 3 1 9bc9a845-80f0-4d5e-951b-9127039ecf34.jpg\n\n"
    )
    rows = parse_images(ip, parse_cameras(cp))
    assert len(rows) == 1
    assert rows[0]["fy"] == 501
    assert np.allclose(np.array(rows[0]["c2w"]).reshape(4, 4)[:3, 3], [-1, 3, -2])
    cp.write_text("1 OPENCV 640 480 500 501 320 240 0 0 0 0\n")
    with pytest.raises(ValueError, match="UNDISTORTED_PINHOLE_REQUIRED"):
        parse_cameras(cp)


def test_canonical_similarity_preserves_measured_reprojection():
    from objectscan_worker.cameras import canonicalize

    rng = np.random.default_rng(0)
    points = rng.normal(size=(40, 3)) * 0.1
    r = np.array([[1, 0, 0], [0, 0, -1], [0, 1, 0]], float)
    pose = np.eye(4)
    pose[:3, :3] = r
    pose[:3, 3] = [0.1, -2, 0.2]
    cameras = [{"image_id": "reference", "c2w": pose.flatten().tolist()}]
    converted, transform = canonicalize(cameras, points, "reference")
    new = np.asarray(converted[0]["c2w"]).reshape(4, 4)
    q = np.asarray(transform["rotation"])
    center = np.asarray(transform["center"])
    scaled = (points - center) @ q.T * transform["scale"]
    old_local = (points - pose[:3, 3]) @ pose[:3, :3]
    new_local = (scaled - new[:3, 3]) @ new[:3, :3]
    assert np.allclose(
        old_local[:, :2] / old_local[:, 2, None],
        new_local[:, :2] / new_local[:, 2, None],
    )
    assert np.allclose(new[[0, 2], 3], 0)
    assert new[1, 3] < 0
    with pytest.raises(ValueError):
        canonicalize(cameras, points[:2], "reference")


def test_native_stage_plan_is_fail_fast_and_iteration_consistent(tmp_path):
    from objectscan_worker.reconstruct_adapter import plan

    stages = plan(
        "gaussian_wrapping",
        tmp_path,
        Path("/pinned/repo"),
        "/isolated/python",
        iterations=7000,
        max_gaussians=123456,
    )
    assert len(stages) == 3
    assert stages[0][stages[0].index("--N_max_gaussians") + 1] == "123456"
    assert stages[1][stages[1].index("--iteration") + 1] == "7000"
    assert stages[2][stages[2].index("--iteration") + 1] == "7000"
    assert all(isinstance(a, str) for stage in stages for a in stage)
    with pytest.raises(ValueError, match="MODEL_UNAVAILABLE"):
        plan("unapproved", tmp_path, tmp_path, "python")


def test_pixal_rgba_keeps_framing_and_rejects_misaligned_mask(tmp_path):
    from objectscan_worker.reconstruct_adapter import pixal_views
    from PIL import Image

    (tmp_path / "images").mkdir()
    (tmp_path / "masks").mkdir()
    Image.new("RGB", (80, 60), "red").save(tmp_path / "images/a.jpg")
    Image.new("L", (80, 60), 255).save(tmp_path / "masks/a.png")
    result = pixal_views(
        tmp_path, {"input_image_count": 1, "images": [{"image_id": "a"}]}
    )
    assert Image.open(result).size == (80, 60)
    assert Image.open(result).mode == "RGBA"
    Image.new("L", (40, 30), 255).save(tmp_path / "masks/a.png")
    with pytest.raises(ValueError, match="MASK_INVALID"):
        pixal_views(tmp_path, {"input_image_count": 1, "images": [{"image_id": "a"}]})
