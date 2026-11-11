import { expect, test } from "vitest";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { prepareEditorView } from "./index";
// Optional real previously-produced GPU artifact; no GPU is invoked by this CPU-only check.
test.skipIf(!process.env.OBJECTSCAN_EDITOR_LARGE_GLB)(
  "large actual artifact uses separate LOD while preserving full export and texture",
  async () => {
    const source = new Uint8Array(
      await readFile(process.env.OBJECTSCAN_EDITOR_LARGE_GLB!),
    );
    const hash = createHash("sha256").update(source).digest("hex");
    const start = performance.now();
    const result = await prepareEditorView(source);
    expect(result.report.triangles).toBeGreaterThan(150000);
    expect(result.previewReport!.triangles).toBeLessThan(
      result.report.triangles,
    );
    expect(result.previewReport!.textures).toBe(result.report.textures);
    expect(result.previewReport!.uv).toBe(true);
    expect(result.report.parts.map((p) => p.id)).toEqual(
      result.previewReport!.parts.map((p) => p.id),
    );
    expect(createHash("sha256").update(source).digest("hex")).toBe(hash);
    expect(result.bytes.length).toBeGreaterThan(result.previewBytes!.length);
    await writeFile(
      "artifacts/mascot-redesign/large-editor-lod.json",
      JSON.stringify(
        {
          scope:
            "CPU-only import/LOD of a previously validated GPU artifact; not a new inference run or browser performance guarantee",
          source_sha256: hash,
          triangles: result.report.triangles,
          preview_triangles: result.previewReport!.triangles,
          full_bytes: result.bytes.length,
          preview_bytes: result.previewBytes!.length,
          elapsed_seconds: (performance.now() - start) / 1000,
          rss_mib_at_end: process.memoryUsage().rss / 1024 / 1024,
          texture_preserved: true,
          source_unchanged: true,
        },
        null,
        2,
      ),
    );
  },
  120000,
);
