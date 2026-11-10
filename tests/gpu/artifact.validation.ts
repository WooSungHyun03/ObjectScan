import { test, expect } from "vitest";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { validateGLB } from "../../apps/web/src/lib/server/files";

test("actual hardware output contains finite geometry, nondegenerate UV and decodable texture", async () => {
  const path = process.env.OBJECTSCAN_VALIDATE_GLB;
  if (!path)
    throw Error(
      "Set OBJECTSCAN_VALIDATE_GLB to a real GPU adapter output; this test never substitutes the demo",
    );
  const source = JSON.parse(
    await readFile(join(dirname(path), "result.json"), "utf8"),
  );
  expect(source.quality.real_gpu).toBe(true);
  expect(source.quality.gpu_peak_mib).toBeGreaterThan(0);
  const actual = await validateGLB(await readFile(path));
  expect(actual.sha256).toBe(source.quality.sha256);
  expect(actual.triangles).toBe(source.quality.triangles);
  expect(actual.uv_count).toBe(actual.vertices);
  expect(actual.texture_bytes).toBeGreaterThan(0);
  await writeFile(
    join(dirname(path), "semantic-validation.json"),
    JSON.stringify(actual, null, 2),
  );
});

test.skipIf(process.env.OBJECTSCAN_GPU_VIEWER_ONLY === "1")(
  "actual public preview is a bounded textured derivative of the private GPU original",
  async () => {
    const path = process.env.OBJECTSCAN_VALIDATE_GLB;
    if (!path) throw Error("Real GPU output required");
    const original = await validateGLB(await readFile(path));
    const preview = await validateGLB(
      await readFile(join(dirname(path), "preview.glb")),
    );
    expect(preview.triangles).toBeLessThanOrEqual(
      Math.min(20000, original.triangles * 0.25),
    );
    expect(preview.sha256).not.toBe(original.sha256);
    expect(preview.size_bytes).toBeLessThanOrEqual(16 * 1024 * 1024);
  },
);
