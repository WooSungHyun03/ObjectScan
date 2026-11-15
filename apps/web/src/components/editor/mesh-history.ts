import type {
  MeshEditOperation,
  MeshPart,
} from "@objectscan/mesh-editor/contracts";

export function meshOperationLabel(
  operation: MeshEditOperation,
  parts: MeshPart[],
) {
  if (operation.type === "simplify")
    return `삼각형 줄이기 (${Math.round(operation.ratio * 100)}%)`;
  if (operation.type === "center") return "중앙 배치";
  if (operation.type === "normalize") return "크기 맞춤";
  if ("node" in operation) {
    const name =
      parts.find((part) => part.id === operation.node)?.name ?? "부품";
    const action = { transform: "변환", hide: "숨기기", delete: "삭제" }[
      operation.type
    ];
    return `${name} ${action}`;
  }
  return "편집";
}

export function meshOperationsChanged(
  operations: MeshEditOperation[],
  saved: MeshEditOperation[],
) {
  return (
    operations.length !== saved.length ||
    operations.some((operation, index) => operation !== saved[index])
  );
}
