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


def test_protected_worker_credentials_never_follow_storage_download(
    monkeypatch, tmp_path
):
    import contextlib
    import httpx
    from objectscan_worker.main import Worker

    config = tmp_path / "adapters.json"
    config.write_text("{}")
    for key, value in {
        "OBJECTSCAN_API_URL": "https://objectscan.example",
        "OBJECTSCAN_STORAGE_ORIGIN": "https://storage.example",
        "OBJECTSCAN_WORK_ROOT": str(tmp_path),
        "OBJECTSCAN_ADAPTER_CONFIG": str(config),
        "OBJECTSCAN_WORKER_TOKEN": "test-worker-token",
        "OBJECTSCAN_VERCEL_BYPASS_SECRET": "test-preview-token",
    }.items():
        monkeypatch.setenv(key, value)
    worker = Worker()
    assert worker.client.headers["x-vercel-protection-bypass"] == "test-preview-token"

    @contextlib.contextmanager
    def storage_stream(method, url, **kwargs):
        assert method == "GET"
        assert "headers" not in kwargs
        assert kwargs["follow_redirects"] is False
        yield httpx.Response(
            200, content=b"private image", request=httpx.Request(method, url)
        )

    monkeypatch.setattr(httpx, "stream", storage_stream)
    try:
        worker.download(
            "https://storage.example/storage/v1/object/sign/input/a.jpg",
            tmp_path / "input.jpg",
        )
        assert (tmp_path / "input.jpg").read_bytes() == b"private image"
    finally:
        worker.client.close()
    monkeypatch.setenv("OBJECTSCAN_API_URL", "http://127.0.0.1:3000")
    with pytest.raises(ValueError, match="HTTPS_REQUIRED_FOR_DEPLOYMENT_AUTH"):
        Worker()


def test_headless_gw_context_uses_upstream_option_without_changing_other_inputs(
    tmp_path,
):
    from objectscan_worker.gw_stage_runner import use_cuda_context
    from objectscan_worker.reconstruct_adapter import plan

    class Rasterizer:
        def __init__(self, cameras=None, raster_settings=None, use_opengl=True):
            self.settings = (cameras, raster_settings, use_opengl)

    use_cuda_context(Rasterizer)
    camera, settings = object(), object()
    assert Rasterizer(camera, settings).settings == (camera, settings, False)
    with pytest.raises(ValueError, match="RASTERIZER_CONFIGURATION_CONFLICT"):
        Rasterizer(use_opengl=True)
    regular = plan("gaussian_wrapping", tmp_path, tmp_path, "python")
    headless = plan(
        "gaussian_wrapping", tmp_path, tmp_path, "python", gw_cuda_rasterizer=True
    )
    assert headless[0] == regular[0]
    for i in (1, 2):
        assert headless[i][headless[i].index("--") + 1 :] == regular[i][2:]
        assert headless[i][headless[i].index("--stage") + 1] == Path(regular[i][1]).name


def test_lazy_cuda_build_uses_family_host_compiler(monkeypatch, tmp_path):
    from objectscan_worker.reconstruct_adapter import model_environment

    monkeypatch.setattr("shutil.which", lambda path: path)
    for model, version in (
        ("object_aware_loss", "11"),
        ("gaussian_wrapping", "12"),
        ("pixal3d", "12"),
    ):
        env = model_environment(model, tmp_path, {"PATH": "/bin", "CXX": "g++-13"})
        assert env["CC"] == f"/usr/bin/gcc-{version}"
        assert env["CXX"] == env["CUDAHOSTCXX"] == f"/usr/bin/g++-{version}"
        assert env["CUDACXX"] == str(tmp_path / "bin/nvcc")
    monkeypatch.setattr("shutil.which", lambda path: None)
    with pytest.raises(ValueError, match="MODEL_HOST_COMPILER_MISSING"):
        model_environment("gaussian_wrapping", tmp_path, {})


def test_smoke_waits_boundedly_without_touching_another_job_result(tmp_path):
    import fcntl
    import json
    import subprocess

    work = tmp_path / "work"
    work.mkdir()
    (work / "manifest.json").write_text("{}")
    saved = work / "result.json"
    saved.write_text(json.dumps({"owned_by_another_process": True}))
    with (tmp_path / "worker.lock").open("a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        completed = subprocess.run(
            [
                sys.executable,
                str(Path(__file__).resolve().parents[2] / "scripts/smoke-model.py"),
                "--work",
                str(work),
                "--worker-root",
                str(tmp_path),
                "--repo",
                str(tmp_path),
                "--python",
                sys.executable,
                "--wait-seconds",
                "1",
            ],
            capture_output=True,
            text=True,
            timeout=10,
        )
    assert completed.returncode != 0
    assert "GPU_SLOT_BUSY" in completed.stderr
    assert json.loads(saved.read_text())["owned_by_another_process"] is True


def test_failure_classification_ignores_oom_from_prior_stage(tmp_path):
    log = tmp_path / "stage.log"
    log.write_text("previous job: CUDA out of memory\n")
    with pytest.raises(ProcessFailure) as failure:
        run_stage(
            [sys.executable, "-c", "raise RuntimeError('missing configuration')"],
            tmp_path,
            log,
            lambda: True,
            timeout=5,
        )
    assert failure.value.code == "WORKER_ERROR"


def test_oom_before_long_native_backtrace_is_classified(tmp_path):
    with pytest.raises(ProcessFailure) as failure:
        run_stage(
            [
                sys.executable,
                "-c",
                "import sys; print('CUDA out of memory'); print('native frame\\n' * 10000); sys.exit(1)",
            ],
            tmp_path,
            tmp_path / "stage.log",
            lambda: True,
            timeout=5,
        )
    assert failure.value.code == "GPU_OOM"


def test_native_model_child_does_not_inherit_control_plane_credentials(
    monkeypatch, tmp_path
):
    names = [
        "OBJECTSCAN_WORKER_TOKEN",
        "OBJECTSCAN_VERCEL_BYPASS_SECRET",
        "SUPABASE_SERVICE_ROLE_KEY",
        "VERCEL_OIDC_TOKEN",
        "TOSS_SECRET_KEY",
    ]
    for name in names:
        monkeypatch.setenv(name, "private-test-credential")
    monkeypatch.setenv("CUDA_HOME", "/test/cuda")
    run_stage(
        [
            sys.executable,
            "-c",
            f"import os; assert all(n not in os.environ for n in {names!r}); assert os.environ['CUDA_HOME']=='/test/cuda'",
        ],
        tmp_path,
        tmp_path / "child.log",
        lambda: True,
        timeout=5,
    )


def test_public_preview_is_small_distinct_and_preserves_measured_color(tmp_path):
    import trimesh
    from objectscan_worker.bake import bake_vertex_colors, make_preview

    mesh = trimesh.creation.icosphere(subdivisions=3)
    xyz = np.asarray(mesh.vertices)
    mesh.visual.vertex_colors = np.column_stack(
        [
            (xyz[:, 0] + 1) * 127,
            (xyz[:, 2] + 1) * 127,
            np.full(len(xyz), 90),
            np.full(len(xyz), 255),
        ]
    ).astype(np.uint8)
    mesh.faces = np.vstack([mesh.faces, [0, 0, 0]])
    source = tmp_path / "colored.ply"
    mesh.export(source)
    full = tmp_path / "full.glb"
    preview = tmp_path / "preview.glb"
    bake_vertex_colors(source, full, resolution=256)
    report = make_preview(full, preview, max_faces=100)
    result = trimesh.load(preview, force="mesh", process=False)
    assert 0 < len(result.faces) <= 100
    assert len(result.faces) <= len(mesh.faces) * 0.25
    assert result.visual.kind == "texture"
    assert np.isfinite(result.visual.uv).all()
    assert report["surface_distance_error_ratio"] <= 0.02
    assert full.read_bytes() != preview.read_bytes()
    pixels = np.asarray(result.visual.material.baseColorTexture)
    assert len(np.unique(pixels.reshape(-1, 3), axis=0)) > 10


def test_dense_refined_mesh_is_bounded_before_uv_baking(tmp_path):
    import trimesh
    from objectscan_worker.bake import bake_vertex_colors

    mesh = trimesh.creation.icosphere(subdivisions=5)
    mesh.visual.vertex_colors = [120, 80, 30, 255]
    source, output = tmp_path / "dense.ply", tmp_path / "bounded.glb"
    mesh.export(source)
    report = bake_vertex_colors(source, output, resolution=128, max_faces=400)
    assert report["source_triangles"] == len(mesh.faces)
    assert report["simplified"] is True
    assert 0 < report["triangles"] <= 400
    assert report["nearest_source_vertex_distance_ratio"] <= 0.01
    result = trimesh.load(output, force="mesh", process=False)
    assert result.visual.kind == "texture"
    pixels = np.asarray(result.visual.material.baseColorTexture)
    assert np.any(np.all(np.abs(pixels.astype(float) - [120, 80, 30]) <= 1, axis=-1))
    coarse = trimesh.creation.icosphere(subdivisions=3)
    coarse.visual.vertex_colors = [120, 80, 30, 255]
    coarse.export(source)
    with pytest.raises(ValueError, match="MESH_SIMPLIFICATION_ERROR"):
        bake_vertex_colors(
            source, tmp_path / "rejected.glb", resolution=128, max_faces=400
        )


def test_triangle_tile_atlas_preserves_geometry_uv_and_independent_colors(tmp_path):
    import trimesh
    from objectscan_worker.bake import bake_mesh_colors

    vertices = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [2, 0, 0], [3, 0, 0], [2, 1, 0]]
    mesh = trimesh.Trimesh(
        vertices=vertices, faces=[[0, 1, 2], [3, 4, 5]], process=False
    )
    mesh.visual.vertex_colors = [[255, 0, 0, 255]] * 3 + [[0, 0, 255, 255]] * 3
    path = tmp_path / "tiles.glb"
    report = bake_mesh_colors(
        mesh, path, resolution=64, atlas_strategy="triangle_tiles"
    )
    actual = trimesh.load(path, force="mesh", process=False)
    assert report["atlas_strategy"] == "triangle_tiles"
    assert np.allclose(actual.vertices, mesh.vertices)
    uv = np.asarray(actual.visual.uv)
    assert np.isfinite(uv).all() and uv.min() >= 0 and uv.max() <= 1
    a = uv[actual.faces][:, 1] - uv[actual.faces][:, 0]
    b = uv[actual.faces][:, 2] - uv[actual.faces][:, 0]
    assert np.all(np.abs(a[:, 0] * b[:, 1] - a[:, 1] * b[:, 0]) > 0)
    sampled = actual.visual.to_color().vertex_colors
    assert np.array_equal(sampled[:, :3], np.asarray(mesh.visual.vertex_colors)[:, :3])
    with pytest.raises(ValueError, match="ATLAS_CAPACITY_EXCEEDED"):
        bake_mesh_colors(
            trimesh.creation.icosphere(subdivisions=3),
            tmp_path / "too-many.glb",
            resolution=64,
            atlas_strategy="triangle_tiles",
        )


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


def test_generation_submission_excludes_local_execution_metadata():
    from objectscan_worker.main import generation_result
    report = {"quality": {"real_gpu": True}, "execution_profile": "naf_fp16", "local_path": "/private/diagnostic"}
    assert generation_result(report, "owner/project/mesh.glb") == {"quality": {"real_gpu": True}, "artifact_path": "owner/project/mesh.glb"}
    assert generation_result(report, "mesh.glb", "preview.glb")["preview_path"] == "preview.glb"
