import { expect, test } from "vitest";
import { readFile } from "node:fs/promises";
import { Document, WebIO } from "@gltf-transform/core";
import { editMesh, inspectContainer, operationSchema } from "./index";
const shoe = () =>
  readFile(new URL("../../../apps/web/public/demo/shoe.glb", import.meta.url));
test("actual licensed GLB transforms/normalizes and roundtrips embedded textures/materials", async () => {
  const source = new Uint8Array(await shoe());
  const initial = await editMesh(source);
  expect(initial.report.uv).toBe(true);
  expect(initial.report.textures).toBeGreaterThan(0);
  const id = initial.report.parts[0].id;
  const result = await editMesh(source, [
    {
      type: "transform",
      node: id,
      position: [1, 2, 3],
      rotation: [0, 45, 0],
      scale: [1.2, 1.2, 1.2],
    },
    { type: "normalize" },
  ]);
  expect(result.report.triangles).toBe(initial.report.triangles);
  expect(result.report.textures).toBe(initial.report.textures);
  expect(result.report.materials).toBe(initial.report.materials);
  expect(result.report.uv).toBe(true);
  const span = Math.max(
    ...result.report.bounds.max.map((n, i) => n - result.report.bounds.min[i]),
  );
  expect(span).toBeCloseTo(2, 4);
  const reload = await editMesh(result.bytes);
  expect(reload.report.triangles).toBe(result.report.triangles);
  const undo = await editMesh(source);
  expect(undo.report.bounds).toEqual(initial.report.bounds);
});
test("actual GLB simplification reduces triangles while retaining textures and UVs", async () => {
  const s = new Uint8Array(await shoe());
  const a = await editMesh(s),
    b = await editMesh(s, [{ type: "simplify", ratio: 0.5 }]);
  expect(b.report.triangles).toBeLessThan(a.report.triangles);
  expect(b.report.uv).toBe(true);
  expect(b.report.textures).toBe(a.report.textures);
});
test("separate parts can be hidden/deleted and restored without mutating source", async () => {
  const d = new Document(),
    buffer = d.createBuffer(),
    scene = d.createScene();
  for (let i = 0; i < 2; i++) {
    const pos = d
      .createAccessor()
      .setType("VEC3")
      .setArray(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]))
      .setBuffer(buffer);
    const prim = d.createPrimitive().setAttribute("POSITION", pos);
    scene.addChild(
      d
        .createNode()
        .setMesh(d.createMesh().addPrimitive(prim))
        .setTranslation([i * 2, 0, 0]),
    );
  }
  const source = await new WebIO().writeBinary(d);
  const base = await editMesh(source);
  expect(base.report.parts).toHaveLength(2);
  const modified = await editMesh(source, [
    { type: "hide", node: base.report.parts[0].id },
  ]);
  expect(modified.report.triangles).toBe(1);
  expect(modified.report.parts[0].hidden).toBe(true);
  expect((await editMesh(source)).report.triangles).toBe(2);
  await expect(
    editMesh(source, [
      { type: "delete", node: 0 },
      { type: "delete", node: 1 },
    ]),
  ).rejects.toThrow();
});
test("untrusted model containers/commands fail closed", async () => {
  expect(() => inspectContainer(new Uint8Array(40))).toThrow();
  expect(() =>
    operationSchema.parse({ type: "exec", code: "anything" }),
  ).toThrow();
  expect(() =>
    operationSchema.parse({
      type: "transform",
      node: 0,
      position: [Infinity, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    }),
  ).toThrow();
  const d = new Document();
  d.createBuffer();
  d.createTexture().setURI("https://attacker.invalid/pixel.png");
  const json = {
    asset: { version: "2.0" },
    buffers: [{ uri: "https://attacker.invalid/data.bin", byteLength: 0 }],
  };
  const text = new TextEncoder().encode(
    JSON.stringify(json).padEnd(Math.ceil(JSON.stringify(json).length / 4) * 4),
  );
  const bytes = new Uint8Array(20 + text.length);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, bytes.length, true);
  view.setUint32(12, text.length, true);
  view.setUint32(16, 0x4e4f534a, true);
  bytes.set(text, 20);
  expect(() => inspectContainer(bytes)).toThrow(/외부/);
});
