"""Explicit reconstruction lifecycle shared by three pinned model families."""

import json
import shutil
import subprocess
import sys
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

from PIL import Image

from .bake import bake_vertex_colors, make_preview
from .reconstruct_adapter import pixal_views, plan, quality


class ReconstructionAdapter(Protocol):
    def prepare(self) -> None: ...
    def validate(self) -> None: ...
    def execute(self) -> None: ...
    def extract_mesh(self) -> None: ...
    def texture_bake(self) -> None: ...
    def validate_artifact(self, peak: float, elapsed: float) -> dict: ...
    def cleanup(self) -> None: ...


@dataclass
class Context:
    work: Path
    repo: Path
    python: str
    manifest: dict
    run: Callable[[list[str]], None]
    iterations: int = 30000
    max_gaussians: int = 500000
    weights: Path | None = None
    pixal_naf_fp16: bool = False
    gw_cuda_rasterizer: bool = False

    def progress(self, state: str, progress: int, message: str):
        # Append each transition so a fast stage cannot overwrite an unobserved transition.
        with (self.work / "stage-events.jsonl").open("a") as f:
            f.write(
                json.dumps(
                    {"state": state, "progress": progress, "message": message},
                    ensure_ascii=False,
                )
                + "\n"
            )


class BaseAdapter:
    model = ""

    def __init__(self, context: Context):
        self.c = context

    def validate(self):
        c = self.c
        m = c.manifest
        expected = (
            "gaussian_wrapping"
            if m["mode"] == "scene"
            else "pixal3d"
            if m["input_image_count"] <= 20
            else "object_aware_loss"
        )
        if (
            m["kind"] != "generation"
            or expected != self.model
            or m["model"] != self.model
        ):
            raise ValueError("MODEL_OR_MODE_MISMATCH")
        if m["capture_mode"] != "camera_orbit" or not m["images"]:
            raise ValueError("DATASET_INVALID")
        lock = json.loads(
            (Path(__file__).parent.parent / "models.lock.json").read_text()
        )[self.model]
        if (
            subprocess.check_output(
                ["git", "rev-parse", "HEAD"], cwd=c.repo, text=True
            ).strip()
            != lock["commit"]
        ):
            raise ValueError("MODEL_COMMIT_MISMATCH")
        if m["mode"] == "object":
            for im in m["images"]:
                image = c.work / "images" / (im["image_id"] + ".jpg")
                mask = c.work / "masks" / (im["image_id"] + ".png")
                if not mask.exists() or Image.open(image).size != Image.open(mask).size:
                    raise ValueError("MASK_ALIGNMENT_REQUIRED")

    def validate_artifact(self, peak, elapsed):
        if (self.c.work / "mesh.glb").stat().st_size > 128 * 1024 * 1024:
            raise ValueError("ARTIFACT_TOO_LARGE")
        return quality(self.c.work / "mesh.glb", peak, elapsed)

    def create_preview(self):
        self.c.progress("texturing", 92, "공개용 경량 3D 미리보기 생성 중")
        output = self.c.work / "preview.glb"
        try:
            report = make_preview(self.c.work / "mesh.glb", output)
        except ValueError:
            # Preview rejection never replaces or exposes the private original.
            output.unlink(missing_ok=True)
            report = {"available": False, "code": "PREVIEW_QUALITY_REJECTED"}
        (self.c.work / "preview-report.json").write_text(json.dumps(report))

    def cleanup(self):
        # Source inputs/checkpoints follow retention policy; delete only derived temporary input copies here.
        for name in ("views", "frames"):
            path = self.c.work / name
            if path.is_dir():
                shutil.rmtree(path)


class Pixal3DAdapter(BaseAdapter):
    model = "pixal3d"

    def prepare(self):
        self.views = pixal_views(self.c.work, self.c.manifest)

    def execute(self):
        c = self.c
        c.progress("reconstruction", 10, "Pixal3D에서 실제 3D 복원 중")
        single = self.views.is_file()
        if c.pixal_naf_fp16 and not single:
            raise ValueError("PRECISION_PROFILE_MV_NOT_VALIDATED")
        entry = (
            [
                str(Path(__file__).with_name("pixal_fp16_runner.py")),
                "--repo",
                str(c.repo),
            ]
            if c.pixal_naf_fp16
            else [str(c.repo / ("inference.py" if single else "inference_mv.py"))]
        )
        argv = [
            c.python,
            *entry,
            "--image" if single else "--views_dir",
            str(self.views),
            "--output",
            str(c.work / "mesh.glb"),
            "--low_vram",
            "--resolution",
            "1024",
        ]
        if not single:
            argv += [
                "--num_views",
                str(len(c.manifest["pose_report"]["selected_view_ids"])),
            ]
        if getattr(c, "weights", None):
            argv += ["--model_path", str(c.weights)]
        c.run(argv)

    def extract_mesh(self):
        self.c.progress("meshing", 80, "Pixal3D 메시 추출 결과 확인")
        if not (self.c.work / "mesh.glb").is_file():
            raise ValueError("MESH_MISSING")

    def texture_bake(self):
        self.c.progress("texturing", 90, "Pixal3D UV 및 PBR 텍스처 검증 준비")
        self.create_preview()


class GaussianAdapter(BaseAdapter):
    def prepare(self):
        c = self.c
        c.progress("pose_estimation", 3, "원본 사진에서 실제 카메라와 희소 점군 정합")
        from . import colmap_adapter

        original = sys.argv
        sys.argv = ["colmap_adapter", "--work", str(c.work)]
        try:
            colmap_adapter.main()
        finally:
            sys.argv = original
        dataset = c.work / "dataset"
        sparse = dataset / "sparse"
        zero = sparse / "0"
        zero.mkdir(exist_ok=True)
        for path in list(sparse.iterdir()):
            if path.is_file():
                path.rename(zero / path.name)
        if self.model == "object_aware_loss":
            masks = dataset / "mask"
            masks.mkdir(exist_ok=True)
            for im in c.manifest["images"]:
                source = c.work / "masks" / (im["image_id"] + ".png")
                target = dataset / "images" / (im["image_id"] + ".jpg")
                if not target.exists():
                    continue
                if Image.open(source).size != Image.open(target).size:
                    raise ValueError("MASK_ALIGNMENT_REQUIRED")
                shutil.copy2(source, masks / source.name)
        self.stages = plan(
            self.model,
            c.work,
            c.repo,
            c.python,
            c.iterations,
            c.max_gaussians,
            c.gw_cuda_rasterizer,
        )

    def execute(self):
        self.c.progress("reconstruction", 10, "정합된 사진으로 Gaussian 모델 학습 중")
        self.c.run(self.stages[0])

    def extract_mesh(self):
        self.c.progress("meshing", 75, "학습 결과에서 실제 삼각형 메시 추출 중")
        self.c.run(self.stages[1])

    def texture_bake(self):
        c = self.c
        c.progress("texturing", 85, "표면 색상 정제 및 UV 텍스처 베이크 중")
        if self.model == "gaussian_wrapping":
            c.run(self.stages[2])
            source = c.work / "trained/mesh_ours_2pivots_post_texture_refined_999.ply"
        else:
            source = c.work / "trained/train" / f"ours_{c.iterations}" / "fuse_post.ply"
        if not source.is_file():
            raise ValueError("TEXTURE_BAKE_FAILED")
        report = bake_vertex_colors(source, c.work / "mesh.glb")
        (c.work / "bake-report.json").write_text(json.dumps(report))
        self.create_preview()


class ObjectAwareLossAdapter(GaussianAdapter):
    model = "object_aware_loss"


class GaussianWrappingAdapter(GaussianAdapter):
    model = "gaussian_wrapping"


REGISTRY = {
    "pixal3d": Pixal3DAdapter,
    "object_aware_loss": ObjectAwareLossAdapter,
    "gaussian_wrapping": GaussianWrappingAdapter,
}
