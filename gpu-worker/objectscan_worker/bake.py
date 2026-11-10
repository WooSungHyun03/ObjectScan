"""Bake measured vertex colors into a real UV atlas. Requires refined source colors.
This preserves vertex-color quality; it cannot recover details absent from source.
"""

from pathlib import Path

import numpy as np
from PIL import Image


def bake_vertex_colors(source: Path, output: Path, resolution=2048):
    import trimesh
    import xatlas

    mesh = trimesh.load(source, force="mesh", process=False)
    if not len(mesh.faces) or mesh.visual.kind != "vertex":
        raise ValueError("REFINED_VERTEX_COLORS_REQUIRED")
    if not 64 <= resolution <= 4096:
        raise ValueError("ATLAS_SIZE_INVALID")
    mapping, indices, uv = xatlas.parametrize(
        np.asarray(mesh.vertices, dtype=np.float32),
        np.asarray(mesh.faces, dtype=np.uint32),
    )
    colors = np.asarray(mesh.visual.vertex_colors)[mapping, :3].astype(float)
    canvas = np.zeros((resolution, resolution, 3), dtype=np.uint8)
    covered = np.zeros((resolution, resolution), dtype=bool)
    for face in indices:
        triangle = uv[face] * [resolution - 1, resolution - 1]
        triangle[:, 1] = (resolution - 1) - triangle[:, 1]
        minimum = np.maximum(np.floor(triangle.min(axis=0)).astype(int), 0)
        maximum = np.minimum(np.ceil(triangle.max(axis=0)).astype(int), resolution - 1)
        x, y = np.meshgrid(
            np.arange(minimum[0], maximum[0] + 1), np.arange(minimum[1], maximum[1] + 1)
        )
        pts = np.stack([x, y], axis=-1)
        a, b, c = triangle
        denominator = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
        if abs(denominator) < 1e-10:
            continue
        w0 = (
            (b[1] - c[1]) * (pts[..., 0] - c[0]) + (c[0] - b[0]) * (pts[..., 1] - c[1])
        ) / denominator
        w1 = (
            (c[1] - a[1]) * (pts[..., 0] - c[0]) + (a[0] - c[0]) * (pts[..., 1] - c[1])
        ) / denominator
        weights = np.stack([w0, w1, 1 - w0 - w1], axis=-1)
        inside = np.all(weights >= -1e-6, axis=-1)
        canvas[y[inside], x[inside]] = np.clip(
            weights[inside] @ colors[face], 0, 255
        ).astype(np.uint8)
        covered[y[inside], x[inside]] = True
    # Four texels of edge dilation reduce black filtering seams without changing UVs.
    for _ in range(4):
        nxt = canvas.copy()
        mask = covered.copy()
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            shifted = np.roll(covered, (dy, dx), (0, 1))
            target = ~covered & shifted
            nxt[target] = np.roll(canvas, (dy, dx), (0, 1))[target]
            mask |= target
        canvas, covered = nxt, mask
    material = trimesh.visual.material.PBRMaterial(
        baseColorTexture=Image.fromarray(canvas),
        metallicFactor=0.0,
        roughnessFactor=1.0,
    )
    result = trimesh.Trimesh(
        vertices=mesh.vertices[mapping],
        faces=indices,
        process=False,
        visual=trimesh.visual.TextureVisuals(uv=uv, material=material),
    )
    output.write_bytes(result.export(file_type="glb"))
    return {
        "vertices": len(result.vertices),
        "triangles": len(result.faces),
        "uv_count": len(uv),
        "watertight": bool(result.is_watertight),
    }
