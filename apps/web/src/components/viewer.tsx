"use client";
import dynamic from "next/dynamic";
export const Viewer = dynamic(
  () => import("./model-viewer").then((m) => m.ModelViewer),
  {
    ssr: false,
    loading: () => (
      <div className="model-viewer viewer-fallback">
        <span className="spinner" />
        3D 뷰어 준비 중
      </div>
    ),
  },
);
