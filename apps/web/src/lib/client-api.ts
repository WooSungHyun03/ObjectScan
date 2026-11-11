import { customerError } from "./customer-copy";
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let r: Response;
  try {
    r = await fetch(`/api/${path}`, {
      ...options,
      headers: {
        ...(typeof options.body === "string"
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "서비스에 연결하지 못했습니다. 네트워크 상태를 확인하고 다시 시도해 주세요.",
    );
  }
  let value;
  try {
    value = await r.json();
  } catch {
    throw new Error(
      "서비스 응답을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    );
  }
  if (!r.ok) throw new Error(customerError(value.code, value.error));
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
  pose_estimation: "사진 정합",
  segmentation: "물체 분리",
  reconstruction: "3D 복원",
  meshing: "모델 표면 정리",
  texturing: "표면 이미지 적용",
  validating: "결과 검증",
  completed: "완료",
  failed: "실패",
  cancelled: "취소됨",
};
export const date = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" }).format(
    new Date(value),
  );
