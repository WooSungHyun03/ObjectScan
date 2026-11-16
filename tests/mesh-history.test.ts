import { expect, test } from "vitest";
import type {
  MeshEditOperation,
  MeshPart,
} from "@objectscan/mesh-editor/contracts";
import {
  meshOperationLabel,
  meshOperationsChanged,
} from "../apps/web/src/components/editor/mesh-history";

test("OS-20 history names existing parts and reports applied checkpoint changes", () => {
  const part: MeshPart = {
    id: 2,
    name: "부품 3",
    hidden: true,
    position: [],
    rotation: [],
    scale: [],
  };
  const hide: MeshEditOperation = { type: "hide", node: 2 };
  const original: MeshEditOperation[] = [];
  const saved = [hide];
  expect(meshOperationLabel(hide, [part])).toBe("부품 3 숨기기");
  expect(meshOperationLabel({ type: "simplify", ratio: 0.5 }, [])).toBe(
    "삼각형 줄이기 (50%)",
  );
  expect(meshOperationsChanged(original, saved)).toBe(true);
  expect(meshOperationsChanged([hide], saved)).toBe(false);
  expect(meshOperationsChanged([{ type: "delete", node: 2 }], saved)).toBe(
    true,
  );
});
