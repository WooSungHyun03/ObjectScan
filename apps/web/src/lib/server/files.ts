import "server-only";
import sharp from "sharp";
import { createHash } from "node:crypto";
import { fail } from "./guards";
import { adminClient } from "@/lib/supabase/server";
export const PRIVATE_BUCKET = "project-files";
export const SOURCE_BUCKET = "original-uploads";
export const RESULT_BUCKET = "job-results";
export function bucketFor(path: string) {
  return /\/original\.(jpg|png|webp)$/.test(path)
    ? SOURCE_BUCKET
    : path.endsWith(".glb")
      ? RESULT_BUCKET
      : PRIVATE_BUCKET;
}
export function safeFilename(name: string) {
  return name
    .normalize("NFC")
    .replace(/[\\/\x00-\x1f]/g, "_")
    .slice(0, 160);
}
export async function normalizeImage(bytes: Uint8Array, mime: string) {
  if (bytes.length > 16 * 1024 * 1024) fail(413, "IMAGE_TOO_LARGE");
  const expected =
    mime === "image/jpeg"
      ? "jpeg"
      : mime === "image/png"
        ? "png"
        : mime === "image/webp"
          ? "webp"
          : null;
  if (!expected) fail(415, "IMAGE_TYPE_UNSUPPORTED");
  try {
    const image = sharp(bytes, {
        limitInputPixels: 40_000_000,
        failOn: "warning",
      }),
      meta = await image.metadata();
    if (
      meta.format !== expected ||
      !meta.width ||
      !meta.height ||
      meta.width > 12000 ||
      meta.height > 12000 ||
      meta.width * meta.height > 40_000_000 ||
      (meta.pages ?? 1) > 1
    )
      fail(422, "IMAGE_INVALID");
    const { data, info } = await image
      .rotate()
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 95, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    return {
      bytes: data,
      width: info.width,
      height: info.height,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    };
  } catch (e) {
    if (e instanceof Error && "status" in e) throw e;
    fail(
      422,
      "IMAGE_INVALID",
      "유효한 JPEG·PNG·WebP 이미지가 필요합니다. 최대 40MP입니다.",
    );
  }
}
export async function signedDownload(path: string, seconds = 120) {
  const { data, error } = await adminClient()
    .storage.from(bucketFor(path))
    .createSignedUrl(path, seconds);
  if (error || !data) fail(404, "FILE_NOT_FOUND");
  return data.signedUrl;
}
export async function downloadBounded(path: string, max = 128 * 1024 * 1024) {
  const { data, error } = await adminClient()
    .storage.from(bucketFor(path))
    .download(path);
  if (error || !data) fail(404, "FILE_NOT_FOUND");
  if (data.size > max) fail(413, "FILE_TOO_LARGE");
  return new Uint8Array(await data.arrayBuffer());
}
export async function validateMask(
  bytes: Uint8Array,
  width: number,
  height: number,
) {
  try {
    const image = sharp(bytes, {
        limitInputPixels: 40_000_000,
        failOn: "warning",
      }),
      meta = await image.metadata();
    if (meta.format !== "png" || meta.width !== width || meta.height !== height)
      fail(422, "MASK_DIMENSIONS");
    const { data } = await image
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let foreground = 0;
    for (const v of data) if (v > 127) foreground++;
    const ratio = foreground / data.length;
    if (ratio < 0.001 || ratio > 0.98)
      fail(
        422,
        "MASK_REVIEW_REQUIRED",
        "빈 마스크 또는 전체 프레임 마스크입니다.",
      );
    return ratio;
  } catch (e) {
    if (e instanceof Error && "status" in e) throw e;
    fail(422, "MASK_INVALID");
  }
}
export async function validateGLB(bytes: Uint8Array) {
  const d = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const bad = () =>
    fail(
      422,
      "TEXTURE_BAKE_FAILED",
      "삼각형·UV·내장 텍스처가 있는 GLB가 필요합니다.",
    );
  if (
    bytes.length < 28 ||
    d.getUint32(0, true) !== 0x46546c67 ||
    d.getUint32(4, true) !== 2 ||
    d.getUint32(8, true) !== bytes.length ||
    d.getUint32(16, true) !== 0x4e4f534a
  )
    bad();
  const jsonLength = d.getUint32(12, true),
    binAt = 20 + jsonLength;
  if (jsonLength % 4 || binAt + 8 > bytes.length) bad();
  let gltf;
  try {
    gltf = JSON.parse(new TextDecoder().decode(bytes.slice(20, binAt)));
  } catch {
    bad();
  }
  const binLength = d.getUint32(binAt, true);
  if (
    d.getUint32(binAt + 4, true) !== 0x004e4942 ||
    binAt + 8 + binLength !== bytes.length ||
    gltf.asset?.version !== "2.0" ||
    gltf.buffers?.length !== 1 ||
    gltf.buffers[0].uri
  )
    bad();
  const views = gltf.bufferViews ?? [],
    accessors = gltf.accessors ?? [];
  const valid = (index: number, type: string) => {
    const a = accessors[index],
      v = views[a?.bufferView],
      componentBytes = (
        { 5121: 1, 5123: 2, 5125: 4, 5126: 4 } as Record<number, number>
      )[a?.componentType],
      components = type === "VEC3" ? 3 : type === "VEC2" ? 2 : 1;
    if (
      !a ||
      a.sparse ||
      !Number.isInteger(a.count) ||
      a.count < 3 ||
      a.type !== type ||
      !componentBytes ||
      !v ||
      v.buffer !== 0 ||
      !Number.isInteger(v.byteLength) ||
      v.byteLength <= 0 ||
      (v.byteOffset ?? 0) + v.byteLength > binLength ||
      (a.byteOffset ?? 0) +
        (a.count - 1) * (v.byteStride ?? componentBytes * components) +
        componentBytes * components >
        v.byteLength
    )
      bad();
    return a;
  };
  let triangles = 0,
    vertices = 0,
    uvCount = 0,
    textureBytes = 0;
  for (const mesh of gltf.meshes ?? [])
    for (const p of mesh.primitives ?? []) {
      if ((p.mode ?? 4) !== 4) bad();
      const position = valid(p.attributes?.POSITION, "VEC3"),
        uv = valid(p.attributes?.TEXCOORD_0, "VEC2"),
        indices = valid(p.indices, "SCALAR");
      if (
        position.componentType !== 5126 ||
        uv.count !== position.count ||
        indices.count % 3 ||
        ![5121, 5123, 5125].includes(indices.componentType)
      )
        bad();
      const v = views[indices.bufferView],
        start = binAt + 8 + (v.byteOffset ?? 0) + (indices.byteOffset ?? 0),
        stride =
          v.byteStride ??
          ({ 5121: 1, 5123: 2, 5125: 4 } as Record<number, number>)[
            indices.componentType
          ];
      for (let i = 0; i < indices.count; i++) {
        const at = start + i * stride,
          value =
            indices.componentType === 5121
              ? d.getUint8(at)
              : indices.componentType === 5123
                ? d.getUint16(at, true)
                : d.getUint32(at, true);
        if (value >= position.count) bad();
      }
      const material = gltf.materials?.[p.material],
        texture =
          gltf.textures?.[
            material?.pbrMetallicRoughness?.baseColorTexture?.index
          ],
        image = gltf.images?.[texture?.source ?? texture?.extensions?.EXT_texture_webp?.source],
        view = views[image?.bufferView];
      if (
        !image ||
        image.uri ||
        !["image/png", "image/jpeg", "image/webp"].includes(image.mimeType) ||
        !view ||
        view.buffer !== 0 ||
        view.byteLength < 24 ||
        (view.byteOffset ?? 0) + view.byteLength > binLength
      )
        bad();
      const tex = bytes.slice(
        binAt + 8 + (view.byteOffset ?? 0),
        binAt + 8 + (view.byteOffset ?? 0) + view.byteLength,
      );
      try {
        await sharp(tex, { limitInputPixels: 40_000_000 }).stats();
      } catch {
        bad();
      }
      triangles += indices.count / 3;
      vertices += position.count;
      uvCount += uv.count;
      textureBytes += view.byteLength;
    }
  if (!triangles) bad();
  return {
    triangles,
    vertices,
    uv_count: uvCount,
    texture_bytes: textureBytes,
    size_bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
}
