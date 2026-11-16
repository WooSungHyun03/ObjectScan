import type { MeshReport } from "@objectscan/mesh-editor";
import { Button } from "@/components/ui/button";
import {
  downloadMeshComparison,
  meshComparisonReport,
  type MeshComparisonVersion,
} from "./mesh-comparison";

export function MeshComparisonPanel({
  original,
  current,
  version,
  showingOriginal,
  disabled,
  onChange,
}: {
  original: MeshReport;
  current: MeshReport;
  version?: MeshComparisonVersion;
  showingOriginal: boolean;
  disabled: boolean;
  onChange: (showOriginal: boolean) => void;
}) {
  const comparison = meshComparisonReport(original, current, version);
  const triangles = new Intl.NumberFormat("ko-KR", {
    signDisplay: "exceptZero",
  }).format(comparison.delta.triangles);
  const originalTextured = original.uv && original.textures > 0;
  const currentTextured = current.uv && current.textures > 0;
  const textureStatus =
    originalTextured === currentTextured
      ? currentTextured
        ? "표면 이미지 유지"
        : "표면 이미지 없음"
      : currentTextured
        ? "표면 이미지 추가"
        : "표면 이미지 없음으로 변경";
  return (
    <section className="mesh-comparison" aria-label="원본과 작업본 비교">
      <div
        className="mesh-comparison-switch"
        role="group"
        aria-label="비교할 모델"
      >
        <Button
          size="sm"
          variant="outline"
          aria-pressed={showingOriginal}
          disabled={disabled}
          onClick={() => onChange(true)}
        >
          원본 보기
        </Button>
        <Button
          size="sm"
          variant="outline"
          aria-pressed={!showingOriginal}
          disabled={disabled}
          onClick={() => onChange(false)}
        >
          {version
            ? `버전 ${version.version_number} 작업본 보기`
            : "작업본 보기"}
        </Button>
      </div>
      <p role="status">
        삼각형 {triangles}개 · {textureStatus} · 브라우저 검사
      </p>
      <Button
        size="sm"
        variant="ghost"
        disabled={disabled}
        onClick={() => downloadMeshComparison(comparison)}
      >
        비교 보고서 JSON 내려받기
      </Button>
    </section>
  );
}
