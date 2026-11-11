import { z } from "zod";
const vector = z.tuple([
  z.number().finite().min(-10000).max(10000),
  z.number().finite().min(-10000).max(10000),
  z.number().finite().min(-10000).max(10000),
]);
export const operationSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("transform"),
      node: z.number().int().nonnegative(),
      position: vector,
      rotation: vector,
      scale: z.tuple([
        z.number().min(0.001).max(1000),
        z.number().min(0.001).max(1000),
        z.number().min(0.001).max(1000),
      ]),
    })
    .strict(),
  z
    .object({
      type: z.enum(["hide", "delete"]),
      node: z.number().int().nonnegative(),
    })
    .strict(),
  z.object({ type: z.enum(["center", "normalize"]) }).strict(),
  z
    .object({
      type: z.literal("simplify"),
      ratio: z.number().min(0.1).max(0.95),
    })
    .strict(),
]);
export type MeshEditOperation = z.infer<typeof operationSchema>;
export type MeshPart = {
  id: number;
  name: string;
  hidden: boolean;
  position: number[];
  rotation: number[];
  scale: number[];
};
export type MeshReport = {
  triangles: number;
  vertices: number;
  uv: boolean;
  textures: number;
  materials: number;
  parts: MeshPart[];
  size: number;
  bounds: { min: number[]; max: number[] };
};
export const MAX_EDIT_BYTES = 64 * 1024 * 1024;
export function inspectContainer(bytes: Uint8Array) {
  if (bytes.byteLength < 28 || bytes.byteLength > MAX_EDIT_BYTES)
    throw Error("모델 파일은 64MB 이하의 GLB를 사용해 주세요.");
  const d = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (
    d.getUint32(0, true) !== 0x46546c67 ||
    d.getUint32(4, true) !== 2 ||
    d.getUint32(8, true) !== bytes.byteLength ||
    d.getUint32(16, true) !== 0x4e4f534a
  )
    throw Error("올바른 GLB 모델을 선택해 주세요.");
  const n = d.getUint32(12, true);
  if (n > 8 * 1024 * 1024 || 20 + n > bytes.byteLength)
    throw Error("모델 구조를 읽을 수 없습니다.");
  const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + n)));
  if (
    json.buffers?.some((b: { uri?: string }) => b.uri) ||
    json.images?.some((i: { uri?: string }) => i.uri) ||
    json.extensionsRequired?.some((s: string) =>
      /draco|meshopt|basisu/i.test(s),
    )
  )
    throw Error(
      "외부 파일이나 압축 확장을 사용하는 모델은 현재 편집할 수 없습니다. 텍스처를 포함한 GLB로 준비해 주세요.",
    );
  if (json.skins?.length || json.animations?.length)
    throw Error("움직임이나 뼈대가 있는 모델은 현재 편집을 지원하지 않습니다.");
  if (
    (json.nodes?.length ?? 0) > 5000 ||
    (json.images?.length ?? 0) > 64 ||
    (json.materials?.length ?? 0) > 256
  )
    throw Error("모델 구조가 너무 복잡합니다. 더 가벼운 모델을 사용해 주세요.");
  const binAt = 20 + n;
  if (
    binAt + 8 > bytes.byteLength ||
    d.getUint32(binAt + 4, true) !== 0x004e4942
  )
    throw Error("모델 데이터가 올바르지 않습니다.");
  let pixels = 0;
  for (const image of json.images ?? []) {
    const view = json.bufferViews?.[image.bufferView];
    if (!view || view.byteLength < 24)
      throw Error("표면 이미지가 올바르지 않습니다.");
    const start = binAt + 8 + (view.byteOffset ?? 0),
      end = start + view.byteLength;
    if (end > bytes.length)
      throw Error("표면 이미지 범위를 확인할 수 없습니다.");
    const v = new DataView(
      bytes.buffer,
      bytes.byteOffset + start,
      view.byteLength,
    );
    let width = 0,
      height = 0;
    if (image.mimeType === "image/png" && v.getUint32(0) === 0x89504e47) {
      width = v.getUint32(16);
      height = v.getUint32(20);
    } else if (image.mimeType === "image/jpeg" && v.getUint16(0) === 0xffd8) {
      let pos = 2;
      while (pos + 8 < view.byteLength) {
        if (v.getUint8(pos) !== 255) break;
        const marker = v.getUint8(pos + 1),
          length = v.getUint16(pos + 2);
        if (length < 2 || pos + 2 + length > view.byteLength) break;
        if (
          [
            192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207,
          ].includes(marker)
        ) {
          height = v.getUint16(pos + 5);
          width = v.getUint16(pos + 7);
          break;
        }
        pos += length + 2;
      }
    } else if (
      image.mimeType === "image/webp" &&
      v.getUint32(0) === 0x52494646 &&
      v.getUint32(8) === 0x57454250
    ) {
      const chunk = v.getUint32(12);
      if (chunk === 0x56503858 && view.byteLength >= 30) {
        width =
          1 + v.getUint8(24) + (v.getUint8(25) << 8) + (v.getUint8(26) << 16);
        height =
          1 + v.getUint8(27) + (v.getUint8(28) << 8) + (v.getUint8(29) << 16);
      } else if (
        chunk === 0x5650384c &&
        view.byteLength >= 25 &&
        v.getUint8(20) === 0x2f
      ) {
        const bits = v.getUint32(21, true);
        width = 1 + (bits & 0x3fff);
        height = 1 + ((bits >>> 14) & 0x3fff);
      } else if (
        chunk === 0x56503820 &&
        view.byteLength >= 30 &&
        v.getUint8(23) === 0x9d &&
        v.getUint8(24) === 1 &&
        v.getUint8(25) === 0x2a
      ) {
        width = v.getUint16(26, true) & 0x3fff;
        height = v.getUint16(28, true) & 0x3fff;
      }
    } else throw Error("PNG·JPG·WEBP 텍스처를 포함한 GLB를 사용해 주세요.");
    pixels += width * height;
    if (
      !width ||
      !height ||
      width > 8192 ||
      height > 8192 ||
      width * height > 16777216 ||
      pixels > 50331648
    )
      throw Error(
        "표면 이미지 해상도가 너무 큽니다. 텍스처 크기를 줄여 주세요.",
      );
  }
  return json;
}
