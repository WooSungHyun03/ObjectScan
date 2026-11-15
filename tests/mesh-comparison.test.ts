import { expect, test } from "vitest";
import type { MeshReport } from "@objectscan/mesh-editor";
import { meshComparisonReport } from "../apps/web/src/components/editor/mesh-comparison";

test("OS-06 exports inspected metrics, version and deltas without private source fields", () => {
  const original: MeshReport = {
    triangles: 60,
    vertices: 35,
    uv: true,
    textures: 1,
    materials: 1,
    parts: [],
    size: 3020,
    bounds: { min: [0, 0, 0], max: [1, 1, 1] },
  };
  const current = {
    ...original,
    triangles: 30,
    size: 2600,
    parts: [
      {
        id: 1,
        name: "private-part-name",
        hidden: false,
        position: [],
        rotation: [],
        scale: [],
      },
    ],
  };
  const version = {
    id: "version-2",
    version_number: 2,
    source_url: "https://fixture.invalid/private",
    session: "never-export",
  };
  expect(meshComparisonReport(original, current, version)).toEqual({
    source: "saved-version",
    inspection: "client",
    unitStatus: "unknown",
    version: { id: "version-2", number: 2 },
    original: { bytes: 3020, triangles: 60, uv: true, textures: 1 },
    current: { bytes: 2600, triangles: 30, uv: true, textures: 1 },
    delta: { triangles: -30, bytes: -420 },
  });
  expect(meshComparisonReport(original, current, undefined)).toMatchObject({
    source: "local",
    version: null,
  });
});
