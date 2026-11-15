import type { MeshReport } from "@objectscan/mesh-editor";

export type MeshComparisonVersion = { id: string; version_number: number };
export type MeshComparisonView = {
  report: MeshReport;
  url: string;
  previewTriangles: number | null;
};

function metrics(report: MeshReport) {
  return {
    bytes: report.size,
    triangles: report.triangles,
    uv: report.uv,
    textures: report.textures,
  };
}

export function meshComparisonReport(
  original: MeshReport,
  current: MeshReport,
  version: MeshComparisonVersion | undefined,
) {
  return {
    source: version ? "saved-version" : "local",
    inspection: "client",
    unitStatus: "unknown",
    version: version
      ? { id: version.id, number: version.version_number }
      : null,
    original: metrics(original),
    current: metrics(current),
    delta: {
      triangles: current.triangles - original.triangles,
      bytes: current.size - original.size,
    },
  } as const;
}

export function downloadMeshComparison(
  report: ReturnType<typeof meshComparisonReport>,
) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "ObjectScan-모델-비교.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
