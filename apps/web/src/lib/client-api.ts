export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const r = await fetch(`/api/${path}`, {
    ...options,
    headers: {
      ...(typeof options.body === "string"
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });
  const value = await r.json();
  if (!r.ok) throw new Error(value.error ?? "요청을 처리하지 못했습니다.");
  return value as T;
}
export function post<T>(path: string, value: unknown = {}) {
  return api<T>(path, { method: "POST", body: JSON.stringify(value) });
}
export const stateLabels: Record<string, string> = {
  draft: "사진 준비",
  uploaded: "업로드 완료",
  awaiting_mask_review: "마스크 검토",
  queued: "대기 중",
  preflight: "입력 검증",
  pose_estimation: "카메라 정렬",
  segmentation: "물체 분리",
  reconstruction: "3D 복원",
  meshing: "메시 추출",
  texturing: "텍스처 베이킹",
  validating: "결과 검증",
  completed: "완료",
  failed: "실패",
  cancelled: "취소됨",
};
export const date = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" }).format(
    new Date(value),
  );
