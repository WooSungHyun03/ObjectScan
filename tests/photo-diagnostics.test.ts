import { expect, test } from "vitest";
import sharp from "sharp";
import {
  moveItem,
  photoWarnings,
} from "../apps/web/src/features/create/photo-diagnostics";
import {
  diagnoseImage,
  DIAGNOSTICS_MAX_BYTES,
} from "../apps/web/src/features/create/image-diagnostics.server";

test("photoWarnings separates duplicate, blurry and unchecked photos", () => {
  expect(
    photoWarnings([
      { sharpness: 20 },
      { sharpness: 18 },
      { sharpness: 2 },
      { sharpness: 20, duplicate_of: "a.jpg" },
      { unavailable: true },
      undefined,
    ]),
  ).toEqual([null, null, "blurry", "duplicate", "unchecked", null]);
  // Too few measurements to compare: never guess "blurry".
  expect(photoWarnings([{ sharpness: 20 }, { sharpness: 1 }])).toEqual([
    null,
    null,
  ]);
});
test("moveItem reorders and ignores moves past either end", () => {
  const list = ["a", "b", "c"];
  expect(moveItem(list, 0, 1)).toEqual(["b", "a", "c"]);
  expect(moveItem(list, 2, -1)).toEqual(["a", "c", "b"]);
  expect(moveItem(list, 0, -1)).toBe(list);
  expect(moveItem(list, 2, 1)).toBe(list);
});
test("diagnoseImage ranks a blurred copy lower and stops on oversized or broken input", async () => {
  const sharpImage = await sharp({
    create: {
      width: 256,
      height: 256,
      channels: 3,
      noise: { type: "gaussian", mean: 128, sigma: 60 },
    },
  })
    .png()
    .toBuffer();
  const blurred = await sharp(sharpImage).blur(6).png().toBuffer();
  const a = await diagnoseImage(sharpImage),
    b = await diagnoseImage(blurred);
  expect(a!.sharpness).toBeGreaterThan(b!.sharpness * 2);
  expect(await diagnoseImage(Buffer.from("not an image"))).toBeNull();
  expect(
    await diagnoseImage(new Uint8Array(DIAGNOSTICS_MAX_BYTES + 1)),
  ).toBeNull();
  const tooManyPixels = await sharp({
    create: { width: 6400, height: 6400, channels: 3, background: "#888" },
  })
    .png()
    .toBuffer();
  expect(await diagnoseImage(tooManyPixels)).toBeNull();
});
