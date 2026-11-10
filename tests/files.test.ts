import { test, expect } from "vitest";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import {
  normalizeImage,
  validateGLB,
  validateMask,
} from "../apps/web/src/lib/server/files";
test("image content must match declared MIME; malformed and oversized content fails closed", async () => {
  const png = await sharp({
    create: { width: 32, height: 24, channels: 3, background: "#bdac92" },
  })
    .png()
    .toBuffer();
  await expect(normalizeImage(png, "image/jpeg")).rejects.toThrow(
    "IMAGE_INVALID",
  );
  const result = await normalizeImage(png, "image/png");
  expect(result.width).toBe(32);
  expect(result.height).toBe(24);
  expect((await sharp(result.bytes).metadata()).exif).toBeUndefined();
  await expect(
    normalizeImage(Buffer.from("not an image"), "image/png"),
  ).rejects.toThrow();
  await expect(
    normalizeImage(new Uint8Array(16 * 1024 * 1024 + 1), "image/png"),
  ).rejects.toThrow("IMAGE_TOO_LARGE");
});
test("masks must retain dimensions and contain a bounded foreground", async () => {
  const none = await sharp({
    create: { width: 32, height: 24, channels: 3, background: "#000" },
  })
    .png()
    .toBuffer();
  await expect(validateMask(none, 32, 24)).rejects.toThrow();
  const mask = await sharp({
    create: { width: 32, height: 24, channels: 3, background: "#000" },
  })
    .composite([
      {
        input: await sharp({
          create: { width: 10, height: 10, channels: 3, background: "#fff" },
        })
          .png()
          .toBuffer(),
        left: 5,
        top: 5,
      },
    ])
    .png()
    .toBuffer();
  expect(await validateMask(mask, 32, 24)).toBeGreaterThan(0.1);
  await expect(validateMask(mask, 64, 48)).rejects.toThrow();
});
test("actual textured GLB decodes; untextured or malformed buffer is rejected", async () => {
  const file = await readFile("apps/web/public/demo/shoe.glb");
  const result = await validateGLB(file);
  expect(result.triangles).toBeGreaterThan(0);
  expect(result.uv_count).toBe(result.vertices);
  expect(result.texture_bytes).toBeGreaterThan(0);
  await expect(validateGLB(file.subarray(0, 100))).rejects.toThrow();
  const copy = Buffer.from(file);
  copy.writeUInt32LE(1, 4);
  await expect(validateGLB(copy)).rejects.toThrow();
});
test("GLB rejects nonfinite coordinates, collapsed geometry/UV and negative offsets", async () => {
  const file = await readFile("apps/web/public/demo/shoe.glb");
  const jsonSize = file.readUInt32LE(12),
    gltf = JSON.parse(file.subarray(20, 20 + jsonSize).toString()),
    binAt = 28 + jsonSize;
  const mutate = (attribute: string, value: number) => {
    const copy = Buffer.from(file);
    for (const mesh of gltf.meshes)
      for (const p of mesh.primitives) {
        const a = gltf.accessors[p.attributes[attribute]],
          v = gltf.bufferViews[a.bufferView],
          size = attribute === "POSITION" ? 3 : 2;
        for (let i = 0; i < a.count; i++)
          for (let axis = 0; axis < size; axis++)
            copy.writeFloatLE(
              value,
              binAt +
                (v.byteOffset ?? 0) +
                (a.byteOffset ?? 0) +
                i * (v.byteStride ?? size * 4) +
                axis * 4,
            );
      }
    return copy;
  };
  await expect(validateGLB(mutate("POSITION", NaN))).rejects.toMatchObject({
    code: "TEXTURE_BAKE_FAILED",
  });
  await expect(validateGLB(mutate("POSITION", 0))).rejects.toMatchObject({
    code: "TEXTURE_BAKE_FAILED",
  });
  await expect(validateGLB(mutate("TEXCOORD_0", 0))).rejects.toMatchObject({
    code: "TEXTURE_BAKE_FAILED",
  });
  gltf.bufferViews[
    gltf.accessors[gltf.meshes[0].primitives[0].attributes.POSITION].bufferView
  ].byteOffset = -4;
  const malformed = Buffer.from(file),
    json = Buffer.from(JSON.stringify(gltf));
  expect(json.length).toBeLessThanOrEqual(jsonSize);
  malformed.fill(32, 20, 20 + jsonSize);
  json.copy(malformed, 20);
  await expect(validateGLB(malformed)).rejects.toMatchObject({
    code: "TEXTURE_BAKE_FAILED",
  });
});
