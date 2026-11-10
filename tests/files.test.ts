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
