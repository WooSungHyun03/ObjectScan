from pathlib import Path
from typing import Literal
from urllib.parse import urlparse
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class Image(BaseModel):
    image_id: UUID
    filename: str
    width: int = Field(gt=0, le=12000)
    height: int = Field(gt=0, le=12000)
    download_url: str
    mask_url: str | None = None
    mask_upload_url: str
    mask_path: str


class Manifest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    schema_version: Literal[1]
    job_id: UUID
    lease_token: UUID
    lease_expires_at: str
    kind: Literal["masks", "poses", "generation"]
    mode: Literal["object", "scene"]
    model: Literal["pixal3d", "object_aware_loss", "gaussian_wrapping"]
    input_image_count: int = Field(ge=1, le=200)
    project_revision: int
    selection: dict | None
    target_image_id: UUID | None
    capture_mode: Literal["camera_orbit", "turntable"]
    pose_report: dict | None
    images: list[Image] = Field(min_length=1, max_length=200)
    artifact_upload_url: str
    artifact_path: str
    preview_upload_url: str
    preview_path: str
    real_gpu_required: bool

    @model_validator(mode="after")
    def route(self):
        expected = (
            "gaussian_wrapping"
            if self.mode == "scene"
            else "pixal3d"
            if self.input_image_count <= 20
            else "object_aware_loss"
        )
        if self.model != expected or self.capture_mode != "camera_orbit":
            raise ValueError("MODEL_OR_CAPTURE_MISMATCH")
        if len({i.image_id for i in self.images}) != len(self.images):
            raise ValueError("DUPLICATE_IMAGE")
        if self.mode == "scene" and self.kind == "masks":
            raise ValueError("SCENE_MUST_NOT_BE_MASKED")
        return self


def checked_storage_url(url: str, storage_origin: str) -> str:
    u, allowed = urlparse(url), urlparse(storage_origin)
    if (
        u.scheme != allowed.scheme
        or u.netloc != allowed.netloc
        or u.username
        or u.fragment
    ):
        raise ValueError("UNTRUSTED_STORAGE_ORIGIN")
    if not u.path.startswith("/storage/v1/object/"):
        raise ValueError("UNTRUSTED_STORAGE_PATH")
    return url


def image_path(root: Path, image_id: UUID, suffix: str = ".jpg") -> Path:
    return root / (str(image_id) + suffix)
