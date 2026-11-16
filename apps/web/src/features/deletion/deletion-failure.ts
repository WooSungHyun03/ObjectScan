import { ApiResponseError } from "@/lib/client-api";

export function deletionFailure(error: unknown) {
  if (error instanceof ApiResponseError) {
    if (error.status === 409 && error.code === "ASSET_HAS_PURCHASES") {
      return {
        message:
          "진행 중인 주문과 구매자의 이용 권리를 보호하기 위해 이 에셋을 삭제할 수 없습니다.",
        retry: false,
      };
    }
    if (error.status === 409 && error.code === "LISTING_ENVIRONMENT_MISMATCH") {
      return {
        message:
          "다른 판매 환경에 등록된 에셋입니다. 해당 판매 환경의 게시 상태를 확인해 주세요.",
        retry: false,
      };
    }
    if (error.status === 401 || error.status === 403 || error.status === 404) {
      return {
        message:
          "대상을 확인할 수 없습니다. 로그인과 접근 권한을 확인해 주세요.",
        retry: false,
      };
    }
  }
  return {
    message:
      "삭제 요청 결과를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    retry: true,
  };
}
