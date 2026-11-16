import type { JobState } from "@objectscan/shared";
import { ApiResponseError } from "@/lib/client-api";

export function isTerminalJob(state: JobState) {
  return state === "completed" || state === "failed" || state === "cancelled";
}

export function jobPollingDelay(failures: number) {
  return Math.min(30_000, 4_000 * 2 ** failures);
}

export function canRetryJobRead(error: unknown) {
  return (
    !(error instanceof ApiResponseError) ||
    error.status === 429 ||
    error.status >= 500
  );
}

export function jobReadMessage(error: unknown) {
  if (
    error instanceof ApiResponseError &&
    [401, 403, 404].includes(error.status)
  )
    return "이 작업을 확인할 수 없습니다. 로그인과 프로젝트 접근 권한을 확인해 주세요.";
  return "작업 상태를 확인하지 못했습니다. 연결이 돌아오면 같은 작업을 다시 확인합니다.";
}
