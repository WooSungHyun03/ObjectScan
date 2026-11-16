import type { Ref } from "react";
import type {
  MeshEditOperation,
  MeshPart,
} from "@objectscan/mesh-editor/contracts";
import { meshOperationLabel } from "./mesh-history";

export function MeshHistoryPanel({
  operations,
  cursor,
  parts,
  disabled,
  onChange,
  summaryRef,
}: {
  operations: MeshEditOperation[];
  cursor: number;
  parts: MeshPart[];
  disabled: boolean;
  onChange: (next: number) => void;
  summaryRef: Ref<HTMLElement>;
}) {
  const labels = [
    "편집 시작",
    ...operations.map((operation) => meshOperationLabel(operation, parts)),
  ];
  return (
    <details className="mesh-history">
      <summary ref={summaryRef}>편집 이력</summary>
      <ol aria-label="편집 동작 목록">
        {labels.map((label, index) => (
          <li key={index}>
            <button
              type="button"
              aria-current={cursor === index ? "step" : undefined}
              disabled={disabled}
              onClick={() => {
                if (index !== cursor) onChange(index);
              }}
            >
              <span>{label}</span>
              {cursor === index && <strong>현재</strong>}
            </button>
          </li>
        ))}
      </ol>
    </details>
  );
}
