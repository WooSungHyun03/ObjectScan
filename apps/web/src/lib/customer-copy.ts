const hiddenTerms =
  /Pixal3D|pixal3d|SAM2|Object[- ]Aware Loss|object_aware_loss|Gaussian Wrapping|gaussian_wrapping|COLMAP|TSDF|2DGS|DINOv3|TRELLIS(?:\.2)?|RMBG[- ]?2\.0|objectmark|flow matching/gi;
export function customerText(value: string) {
  if (
    /Traceback|File \"|\/(?:home|tmp|root|usr|var|opt|mnt)\/|CUDA|CUBLAS|RuntimeError|https?:\/\/[^ ]+[?].*(token|signature)/i.test(
      value,
    )
  )
    return "작업을 처리하지 못했습니다. 입력 사진을 확인하고 다시 시도해 주세요.";
  return value.replace(hiddenTerms, (term) =>
    /sam/i.test(term)
      ? "대상 선택"
      : /colmap/i.test(term)
        ? "사진 정합"
        : "3D 제작",
  );
}
const messages: Record<string, string> = {
  invalid_credentials: "이메일 또는 비밀번호를 확인해 주세요.",
  email_not_confirmed: "가입 확인 이메일의 링크를 먼저 열어 주세요.",
  user_already_exists:
    "이미 가입된 계정입니다. 로그인하거나 비밀번호를 재설정해 주세요.",
  email_address_not_authorized:
    "가입 확인 이메일 발송을 준비하고 있습니다. 잠시 후 다시 시도해 주세요.",
  over_email_send_rate_limit:
    "이메일을 여러 번 요청했습니다. 잠시 후 다시 시도해 주세요.",
  over_request_rate_limit: "요청이 많습니다. 잠시 후 다시 시도해 주세요.",
  weak_password: "더 길고 안전한 비밀번호를 입력해 주세요.",
  signup_disabled:
    "현재 신규 가입을 준비하고 있습니다. 잠시 후 다시 확인해 주세요.",
  same_password: "기존과 다른 새 비밀번호를 입력해 주세요.",
  session_not_found: "로그인 상태를 확인할 수 없습니다. 다시 로그인해 주세요.",

  EDITOR_STORAGE_QUOTA:
    "편집본 보관 한도에 도달했습니다. 계정 설정에서 데이터 삭제 검토를 요청해 주세요.",
  VERSION_NOT_FOUND: "선택한 편집 버전을 찾을 수 없습니다.",
  VERSION_INVALID:
    "편집본의 파일 정보가 일치하지 않습니다. 모델을 다시 열고 저장해 주세요.",
  IDEMPOTENCY_MISMATCH:
    "저장 요청의 내용이 변경되었습니다. 모델을 다시 확인해 주세요.",
  GPU_OOM:
    "처리 가능한 메모리를 초과했습니다. 사진을 줄이거나 낮은 해상도로 다시 시도해 주세요.",
  REAL_GPU_NOT_VALIDATED:
    "3D 생성 기능을 검증하고 있습니다. 사진 업로드와 대상 선택을 먼저 이용해 주세요.",
  MODEL_UNAVAILABLE:
    "현재 이 제작 방식은 준비 중입니다. 나중에 다시 확인해 주세요.",
  MASK_REVIEW_REQUIRED: "선택된 영역을 확인하고 승인해 주세요.",
  POSE_UNAVAILABLE:
    "사진의 촬영 위치를 확인할 수 없습니다. 서로 겹치는 사진을 추가해 주세요.",
  POSE_REQUIRED: "사진 정합을 먼저 완료해 주세요.",
  AUTH_REQUIRED: "로그인 후 이용해 주세요.",
  FILE_TOO_LARGE:
    "지원하는 파일 크기를 초과했습니다. 더 작은 파일을 사용해 주세요.",
  PROJECT_BUSY:
    "현재 진행 중인 작업을 완료하거나 취소한 뒤 다시 시도해 주세요.",
  TURNTABLE_NOT_VALIDATED:
    "대상을 고정하고 카메라를 움직여 촬영한 사진을 사용해 주세요.",
  PAYMENTS_DISABLED: "현재 결제를 운영하지 않습니다.",
  NONCOMMERCIAL_ONLY:
    "학교 교육·연구용 서비스에서는 결제·판매·정산을 운영하지 않습니다.",
  INVALID_VIEW_COUNT: "처리에 사용할 사진을 확인해 주세요.",
  NO_INPUTS: "사진을 먼저 올려주세요.",
  NO_INCLUDED_IMAGES: "제외하지 않은 사진을 한 장 이상 남겨 주세요.",
};
export function customerError(code?: string, detail?: string) {
  if (code && messages[code]) return messages[code];
  const text = detail ?? code ?? "";
  if (!/[가-힣]/.test(text))
    return "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
  return customerText(text);
}
