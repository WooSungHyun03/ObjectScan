import { WebIO, PropertyType, type Document } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { getBounds, simplify, prune } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";
import { Euler, Quaternion } from "three";
import { z } from "zod";
import {
  operationSchema,
  inspectContainer,
  type MeshEditOperation,
  type MeshReport,
  type MeshPart,
} from "./contracts";
export * from "./contracts";
const io = () => new WebIO().registerExtensions(ALL_EXTENSIONS);
function stats(doc: Document, size: number, parts: MeshPart[]): MeshReport {
  let triangles = 0,
    vertices = 0,
    uv = true;
  for (const mesh of doc.getRoot().listMeshes())
    for (const p of mesh.listPrimitives()) {
      const pos = p.getAttribute("POSITION");
      if (!pos || p.getMode() !== 4)
        throw Error("삼각형으로 구성된 모델이 필요합니다.");
      const count = pos.getCount();
      vertices += count;
      triangles += (p.getIndices()?.getCount() ?? count) / 3;
      uv = uv && p.getAttribute("TEXCOORD_0")?.getCount() === count;
      const array = pos.getArray();
      if (!array || !Array.from(array).every(Number.isFinite))
        throw Error("모델 좌표가 올바르지 않습니다.");
    }
  if (!triangles || triangles > 1_200_000)
    throw Error("편집 가능한 모델은 삼각형 1개 이상, 120만 개 이하입니다.");
  const bounds = getBounds(doc.getRoot().listScenes()[0]);
  if (![...bounds.min, ...bounds.max].every(Number.isFinite))
    throw Error("표시할 부품을 하나 이상 남겨 주세요.");
  return {
    triangles,
    vertices,
    uv,
    textures: doc.getRoot().listTextures().length,
    materials: doc.getRoot().listMaterials().length,
    parts,
    size,
    bounds,
  };
}
export async function editMesh(
  source: Uint8Array,
  commands: MeshEditOperation[] = [],
) {
  inspectContainer(source);
  const parsed = z.array(operationSchema).max(80).safeParse(commands);
  if (!parsed.success)
    throw Error(
      commands.length > 80
        ? "편집 이력은 80개까지입니다. 새 버전으로 저장한 뒤 이어서 편집해 주세요."
        : "위치·회전은 -10,000~10,000, 크기 비율은 0.001~1,000 사이로 입력해 주세요.",
    );
  const operations = parsed.data;
  const document = await io().readBinary(source);
  const nodes = document.getRoot().listNodes();
  const partNodes = nodes
    .map((node, id) => ({ node, id, mesh: node.getMesh() }))
    .filter((p) => p.mesh);
  for (const { node, id } of partNodes)
    node.setExtras({ ...node.getExtras(), objectscanNode: id });
  const originalTextures = document
    .getRoot()
    .listTextures()
    .map((t) => t.getImage()?.slice());
  if (typeof createImageBitmap === "function")
    for (const texture of originalTextures) {
      if (!texture) throw Error("표면 이미지가 없습니다.");
      try {
        const image = await createImageBitmap(
          new Blob([texture as Uint8Array<ArrayBuffer>]),
        );
        image.close();
      } catch {
        throw Error(
          "표면 이미지를 읽을 수 없습니다. 정상적인 텍스처가 포함된 GLB를 사용해 주세요.",
        );
      }
    }

  stats(document, source.byteLength, []);
  for (const op of operations) {
    if (op.type === "transform") {
      const node = nodes[op.node];
      if (!partNodes.some((p) => p.id === op.node) || !node.getMesh())
        throw Error("수정할 부품을 선택해 주세요.");
      const q = new Quaternion().setFromEuler(
        new Euler(
          ...(op.rotation.map((n) => (n * Math.PI) / 180) as [
            number,
            number,
            number,
          ]),
        ),
      );
      node
        .setTranslation(op.position)
        .setRotation(q.toArray())
        .setScale(op.scale);
    } else if (op.type === "hide" || op.type === "delete") {
      if (!partNodes.some((p) => p.id === op.node))
        throw Error("선택한 부품을 찾을 수 없습니다.");
      nodes[op.node].setMesh(null);
    } else if (op.type === "center" || op.type === "normalize") {
      const scene = document.getRoot().listScenes()[0],
        b = getBounds(scene),
        center = b.min.map((v, i) => (v + b.max[i]) / 2),
        span = Math.max(...b.max.map((v, i) => v - b.min[i]));
      if (!Number.isFinite(span) || span < 1e-8)
        throw Error("모델 크기를 계산할 수 없습니다.");
      const scale = op.type === "normalize" ? 2 / span : 1;
      const children = scene.listChildren().slice();
      const wrapper = document
        .createNode("ObjectScan placement")
        .setTranslation(
          center.map((v) => -v * scale) as [number, number, number],
        )
        .setScale([scale, scale, scale]);
      for (const child of children) wrapper.addChild(child);
      scene.addChild(wrapper);
    } else if (op.type === "simplify") {
      await MeshoptSimplifier.ready;
      await document.transform(
        simplify({
          simplifier: MeshoptSimplifier,
          ratio: op.ratio,
          error: 0.001,
          lockBorder: true,
        }),
      );
    }
  }
  const parts = partNodes.map(({ node, id }) => {
    const q = new Quaternion(...node.getRotation()),
      e = new Euler().setFromQuaternion(q);
    return {
      id,
      name: `부품 ${partNodes.findIndex((p) => p.id === id) + 1}`,
      hidden: !node.getMesh(),
      position: [...node.getTranslation()],
      rotation: [e.x, e.y, e.z].map((n) => (n * 180) / Math.PI),
      scale: [...node.getScale()],
    };
  });
  // Dispose only unreferenced geometry, preserving every material and embedded texture.
  await document.transform(
    prune({
      keepAttributes: true,
      keepSolidTextures: true,
      keepExtras: true,
      propertyTypes: [PropertyType.MESH],
    }),
  );
  const output = await io().writeBinary(document);
  inspectContainer(output);
  const reloaded = await io().readBinary(output);
  const report = stats(reloaded, output.byteLength, parts);
  const textures = reloaded
    .getRoot()
    .listTextures()
    .map((t) => t.getImage());
  if (
    textures.length !== originalTextures.length ||
    textures.some(
      (t, i) =>
        !t ||
        !originalTextures[i] ||
        t.length !== originalTextures[i]!.length ||
        t.some((v, j) => v !== originalTextures[i]![j]),
    )
  )
    throw Error(
      "텍스처 보존을 확인하지 못했습니다. 원본은 변경되지 않았습니다.",
    );
  if (originalTextures.length && !report.uv)
    throw Error("표면 이미지 좌표를 보존하지 못했습니다.");
  return { bytes: output, report };
}

/** Display-only LOD; exported/stored bytes always remain the full edited model. */
export async function prepareEditorView(
  source: Uint8Array,
  commands: MeshEditOperation[] = [],
) {
  const result = await editMesh(source, commands);
  if (result.report.triangles <= 150000)
    return { ...result, previewBytes: undefined, previewReport: undefined };
  const preview = await editMesh(result.bytes, [
    {
      type: "simplify",
      ratio: Math.max(0.1, Math.min(0.95, 150000 / result.report.triangles)),
    },
  ]);
  if (preview.report.triangles >= result.report.triangles)
    return { ...result, previewBytes: undefined, previewReport: undefined };
  if (preview.report.parts.some((p, i) => p.id !== result.report.parts[i]?.id))
    throw Error("미리보기 부품 연결을 확인하지 못했습니다.");
  return {
    ...result,
    previewBytes: preview.bytes,
    previewReport: preview.report,
  };
}
