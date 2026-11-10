"""Calibrated coordinate conversion. Does not synthesize camera poses."""

import math

import numpy as np


def colmap_to_opengl_z_up(qvec, tvec):
    q = np.asarray(qvec, dtype=float)
    if (
        q.shape != (4,)
        or not np.isfinite(q).all()
        or not np.isclose(np.linalg.norm(q), 1, atol=1e-5)
    ):
        raise ValueError("INVALID_ROTATION")
    w, x, y, z = q
    rotation = np.array(
        [
            [1 - 2 * y * y - 2 * z * z, 2 * x * y - 2 * z * w, 2 * x * z + 2 * y * w],
            [2 * x * y + 2 * z * w, 1 - 2 * x * x - 2 * z * z, 2 * y * z - 2 * x * w],
            [2 * x * z - 2 * y * w, 2 * y * z + 2 * x * w, 1 - 2 * x * x - 2 * y * y],
        ]
    )
    world_to_camera = np.eye(4)
    world_to_camera[:3, :3] = rotation
    world_to_camera[:3, 3] = tvec
    # COLMAP OpenCV camera: +X right, +Y down, +Z forward.
    camera_axis = np.diag([1, -1, -1, 1])
    world_axis = np.array([[1, 0, 0, 0], [0, 0, -1, 0], [0, 1, 0, 0], [0, 0, 0, 1]])
    return world_axis @ np.linalg.inv(world_to_camera) @ camera_axis


def adjusted_intrinsics(fx, fy, cx, cy, scale_x, scale_y, crop_x=0, crop_y=0):
    if min(fx, fy, scale_x, scale_y) <= 0:
        raise ValueError("INVALID_INTRINSICS")
    return fx * scale_x, fy * scale_y, (cx - crop_x) * scale_x, (cy - crop_y) * scale_y


def horizontal_fov(width, fx):
    if min(width, fx) <= 0:
        raise ValueError("INVALID_INTRINSICS")
    return 2 * math.atan(width / (2 * fx))


def representative_views(cameras: list[dict], count: int) -> list[str]:
    if count not in (2, 4, 6, 8) or count > len(cameras):
        raise ValueError("INVALID_VIEW_COUNT")
    centers = np.array([np.asarray(c["c2w"]).reshape(4, 4)[:3, 3] for c in cameras])
    # Farthest-point sampling of measured camera centers, preserving canonical first view.
    chosen = [0]
    for _ in range(count - 1):
        distances = np.min(
            np.linalg.norm(centers[:, None] - centers[chosen][None, :], axis=2), axis=1
        )
        distances[chosen] = -1
        chosen.append(int(np.argmax(distances)))
    return [cameras[i]["image_id"] for i in chosen]


def canonicalize(cameras: list[dict], points: np.ndarray, reference_id: str):
    """One measured global similarity; preserves every camera projection.
    The selected reference optical axis defines the front. No pose is invented.
    """
    if len(points) < 20 or not np.isfinite(points).all():
        raise ValueError("POSE_UNAVAILABLE")
    reference = next((c for c in cameras if c["image_id"] == reference_id), None)
    if reference is None:
        raise ValueError("REFERENCE_NOT_REGISTERED")
    first = np.asarray(reference["c2w"], dtype=float).reshape(4, 4)
    depths = (points - first[:3, 3]) @ (-first[:3, 2])
    positive = depths[depths > 0]
    if len(positive) < 20:
        raise ValueError("POSE_UNAVAILABLE")
    distance = float(np.median(positive))
    center = first[:3, 3] - first[:3, 2] * distance
    canonical = np.array([[1, 0, 0], [0, 0, -1], [0, 1, 0]], dtype=float)
    q = canonical @ first[:3, :3].T
    local = (points - center) @ q.T
    radius = float(np.quantile(np.max(np.abs(local), axis=1), 0.95))
    if radius <= 1e-8:
        raise ValueError("POSE_UNAVAILABLE")
    scale = 0.45 / radius
    result = []
    for camera in sorted(cameras, key=lambda c: c["image_id"] != reference_id):
        old = np.asarray(camera["c2w"]).reshape(4, 4)
        new = np.eye(4)
        new[:3, :3] = q @ old[:3, :3]
        new[:3, 3] = q @ (old[:3, 3] - center) * scale
        result.append({**camera, "c2w": new.flatten().tolist()})
    check = np.asarray(result[0]["c2w"]).reshape(4, 4)
    if (
        not np.allclose(check[:3, :3], canonical, atol=1e-5)
        or not np.allclose(check[[0, 2], 3], 0, atol=1e-5)
        or check[1, 3] >= 0
    ):
        raise ValueError("CANONICAL_VERIFICATION_FAILED")
    return result, {"rotation": q.tolist(), "center": center.tolist(), "scale": scale}
