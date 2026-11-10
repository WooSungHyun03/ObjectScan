"""Bake measured vertex colors into a real UV atlas. Requires refined source colors.
This preserves vertex-color quality; it cannot recover details absent from source.
"""

from pathlib import Path

import numpy as np
from PIL import Image


def bake_vertex_colors(source: Path, output: Path, resolution=2048, max_faces=1000000):
    import trimesh

    mesh = trimesh.load(source, force="mesh", process=False)
    if not len(mesh.faces) or mesh.visual.kind != "vertex":
        raise ValueError("REFINED_VERTEX_COLORS_REQUIRED")
    original_faces = len(mesh.faces)
    if max_faces < 1:
        raise ValueError("MESH_BUDGET_INVALID")
    mesh.update_faces(mesh.nondegenerate_faces())
    distance_ratio = 0.0
    if len(mesh.faces) > max_faces:
        from scipy.spatial import cKDTree

        print(
            f"UV bake: simplifying {len(mesh.faces)} refined faces to budget {max_faces}",
            flush=True,
        )
        # Dense refined colors are measured at source vertices. Keep the source
        # intact; transfer these colors to a bounded derived mesh before xatlas.
        geometry = trimesh.Trimesh(
            vertices=mesh.vertices, faces=mesh.faces, process=True
        )
        simplified = geometry.simplify_quadric_decimation(
            face_count=max_faces, aggression=7
        )
        distances, nearest = cKDTree(mesh.vertices).query(simplified.vertices)
        distance_ratio = float(
            distances.max() / max(float(np.linalg.norm(mesh.extents)), 1e-12)
        )
        if not np.isfinite(distances).all() or distance_ratio > 0.01:
            raise ValueError("MESH_SIMPLIFICATION_ERROR")
        simplified.visual = trimesh.visual.ColorVisuals(
            mesh=simplified,
            vertex_colors=np.asarray(mesh.visual.vertex_colors)[nearest],
        )
        mesh = simplified
    if not 0 < len(mesh.faces) <= max_faces:
        raise ValueError("MESH_BUDGET_EXCEEDED")
    print(
        f"UV bake: {len(mesh.faces)} faces; nearest-source distance ratio {distance_ratio:.6f}",
        flush=True,
    )
    report = bake_mesh_colors(mesh, output, resolution)
    report.update(
        source_triangles=original_faces,
        simplified=len(mesh.faces) < original_faces,
        nearest_source_vertex_distance_ratio=distance_ratio,
    )
    return report


def bake_mesh_colors(mesh, output: Path, resolution=2048, atlas_strategy="auto"):
    import trimesh
    import xatlas

    if not 64 <= resolution <= 4096:
        raise ValueError("ATLAS_SIZE_INVALID")
    if atlas_strategy not in ("auto", "xatlas", "triangle_tiles"):
        raise ValueError("ATLAS_STRATEGY_INVALID")
    if atlas_strategy == "triangle_tiles" or (
        atlas_strategy == "auto" and len(mesh.faces) > 50000
    ):
        if atlas_strategy == "auto":
            import math

            resolution = max(
                resolution,
                2 ** math.ceil(math.log2(4 * math.ceil(math.sqrt(len(mesh.faces))))),
            )
            if resolution > 4096:
                raise ValueError("ATLAS_CAPACITY_EXCEEDED")
        return bake_triangle_tiles(mesh, output, resolution)
    print(f"UV bake: unwrap {len(mesh.faces)} faces at {resolution}px", flush=True)
    mapping, indices, uv = xatlas.parametrize(
        np.asarray(mesh.vertices, dtype=np.float32),
        np.asarray(mesh.faces, dtype=np.uint32),
    )
    colors = np.asarray(mesh.visual.vertex_colors)[mapping, :3].astype(float)
    print(f"UV bake: rasterizing {len(indices)} textured faces", flush=True)
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
        "atlas_strategy": "xatlas",
    }


def bake_triangle_tiles(mesh, output: Path, resolution=2048):
    """Bounded per-triangle UV atlas for dense measured vertex-color meshes.

    Each four-pixel cell has a private triangle and clamped color padding.
    This trades UV sharing for deterministic packing; it cannot add photo detail.
    """
    import math
    import trimesh

    count = len(mesh.faces)
    columns = math.ceil(math.sqrt(count))
    if count < 1 or resolution < columns * 4:
        raise ValueError("ATLAS_CAPACITY_EXCEEDED")
    print(
        f"UV bake: bounded triangle tiles for {count} faces at {resolution}px",
        flush=True,
    )
    rows, cols = np.divmod(np.arange(count), columns)
    origins = np.column_stack([cols * 4, rows * 4])
    corners = np.array([[0.75, 0.75], [2.25, 0.75], [0.75, 2.25]])
    pixels = origins[:, None, :] + corners[None, :, :]
    uv = (pixels + 0.5) / resolution
    uv[:, :, 1] = 1 - uv[:, :, 1]
    face_colors = np.asarray(mesh.visual.vertex_colors)[mesh.faces, :3].astype(
        np.float32
    )
    canvas = np.zeros((resolution, resolution, 3), dtype=np.uint8)
    for y in range(4):
        for x in range(4):
            w1, w2 = (x - 0.75) / 1.5, (y - 0.75) / 1.5
            weights = np.maximum([1 - w1 - w2, w1, w2], 0)
            weights /= weights.sum()
            colors = np.einsum("c,fcd->fd", weights, face_colors)
            canvas[rows * 4 + y, cols * 4 + x] = np.rint(
                np.clip(colors, 0, 255)
            ).astype(np.uint8)
    material = trimesh.visual.material.PBRMaterial(
        baseColorTexture=Image.fromarray(canvas),
        metallicFactor=0.0,
        roughnessFactor=1.0,
    )
    result = trimesh.Trimesh(
        vertices=mesh.vertices[mesh.faces.reshape(-1)],
        faces=np.arange(count * 3).reshape(-1, 3),
        process=False,
        visual=trimesh.visual.TextureVisuals(uv=uv.reshape(-1, 2), material=material),
    )
    output.write_bytes(result.export(file_type="glb"))
    return {
        "vertices": len(result.vertices),
        "triangles": count,
        "uv_count": len(result.vertices),
        "watertight": bool(result.is_watertight),
        "atlas_strategy": "triangle_tiles",
        "texture_resolution": resolution,
    }


def make_preview(source: Path, output: Path, max_faces=15000):
    """Public derivative: simplify geometry and re-bake measured source colors.

    Does not retain the full source texture or full-resolution geometry. This is
    an approximate preview; the private original keeps its complete PBR maps.
    """
    import trimesh

    mesh = trimesh.load(source, force="mesh", process=False)
    original_faces = len(mesh.faces)
    # TSDF output can contain zero-area faces. Exclude these from the closest
    # surface query before barycentric interpolation can divide by zero.
    mesh.update_faces(mesh.nondegenerate_faces())
    target = min(max_faces, original_faces // 4)
    if target < 1 or mesh.visual.kind not in ("texture", "vertex"):
        raise ValueError("PREVIEW_SOURCE_INVALID")
    colors = (
        mesh.visual.to_color().vertex_colors
        if mesh.visual.kind == "texture"
        else mesh.visual.vertex_colors
    )
    geometry = trimesh.Trimesh(vertices=mesh.vertices, faces=mesh.faces, process=True)
    geometry.update_faces(geometry.nondegenerate_faces())
    geometry.update_faces(geometry.unique_faces())
    geometry.remove_unreferenced_vertices()
    # QEM can stop above its requested count on nonmanifold input. Leave
    # headroom and still enforce the actual published face/geometry budgets.
    simplified = geometry.simplify_quadric_decimation(
        face_count=max(1, int(target * 0.9)), aggression=7
    )
    aggression = 7
    if len(simplified.faces) > target:
        aggression = 10
        simplified = geometry.simplify_quadric_decimation(
            face_count=max(1, int(target * 0.9)), aggression=aggression
        )
    if not 0 < len(simplified.faces) <= target:
        raise ValueError("PREVIEW_TOO_DETAILED")
    closest, distances, triangle_ids = trimesh.proximity.closest_point(
        mesh, simplified.vertices
    )
    extent = float(np.linalg.norm(mesh.extents))
    error_ratio = float(distances.max() / max(extent, 1e-12))
    if not np.isfinite(distances).all() or error_ratio > 0.02:
        raise ValueError("PREVIEW_GEOMETRY_ERROR")
    weights = trimesh.triangles.points_to_barycentric(
        mesh.triangles[triangle_ids], closest
    )
    if not np.isfinite(weights).all():
        raise ValueError("PREVIEW_COLOR_TRANSFER_INVALID")
    transferred = np.clip(
        (weights[:, :, None] * np.asarray(colors)[mesh.faces[triangle_ids]]).sum(
            axis=1
        ),
        0,
        255,
    ).astype(np.uint8)
    simplified.visual = trimesh.visual.ColorVisuals(
        mesh=simplified, vertex_colors=transferred
    )
    report = bake_mesh_colors(simplified, output, resolution=512)
    report.update(
        source_triangles=original_faces,
        surface_distance_error_ratio=error_ratio,
        texture_resolution=512,
        approximate_public_derivative=True,
        simplification_aggression=aggression,
    )
    if output.stat().st_size > 16 * 1024 * 1024:
        output.unlink()
        raise ValueError("PREVIEW_TOO_LARGE")
    return report
