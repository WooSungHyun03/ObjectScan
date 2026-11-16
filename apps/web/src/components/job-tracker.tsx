"use client";
import { customerText, customerError } from "@/lib/customer-copy";
import { useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  OctagonX,
  RefreshCw,
} from "lucide-react";
import { ApiResponseError, post, stateLabels } from "@/lib/client-api";
import { isTerminalJob } from "@/features/create/job-polling";
import { useJobPolling } from "@/features/create/use-job-polling";
import { Button } from "./ui/button";
export function JobTracker({
  jobId,
  onComplete,
}: {
  jobId: string;
  onComplete?: () => Promise<void>;
}) {
  const {
    job,
    error: readError,
    refreshing,
    refresh,
  } = useJobPolling(jobId, onComplete);
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [cancel, setCancel] = useState(false);
  const acting = useRef(false);
  async function act(path: "retry" | "cancel") {
    if (acting.current) return;
    acting.current = true;
    setBusy(true);
    setError("");
    try {
      await post(`jobs/${jobId}/${path}`);
    } catch (e) {
      if (!(
        path === "cancel" &&
        e instanceof ApiResponseError &&
        e.code === "JOB_TERMINAL"
      ))
        setError(
          "요청 결과를 확인하지 못했습니다. 서버의 작업 상태를 다시 확인해 주세요.",
        );
    } finally {
      setCancel(false);
      refresh();
      acting.current = false;
      setBusy(false);
    }
  }
  if (!job)
    return (
      <div className="inline-empty">
        <p role="status">{readError || "작업 상태를 불러오는 중…"}</p>
        {readError && (
          <Button variant="outline" disabled={refreshing} onClick={refresh}>
            상태 새로고침
          </Button>
        )}
      </div>
    );
  const terminal = isTerminalJob(job.state);
  return (
    <div className="job-tracker">
      <div className="job-tracker-heading">
        <span className={`job-icon ${job.state}`}>
          {job.state === "completed" ? (
            <CheckCircle2 size={23} />
          ) : job.state === "failed" ? (
            <AlertCircle size={23} />
          ) : (
            <Activity size={23} />
          )}
        </span>
        <div>
          <small>
            {job.kind === "masks"
              ? "선택 영역 분석"
              : job.kind === "poses"
                ? "카메라 정합"
                : "3D 메시 생성"}
          </small>
          <h3>{stateLabels[job.state]}</h3>
        </div>
        <strong>{job.progress}%</strong>
      </div>
      <progress aria-label="작업 진행률" max="100" value={job.progress} />
      {job.state === "queued" && (
        <p className="job-info">
          한 번에 하나의 GPU 작업을 처리합니다. 현재 순서에서 기다리고 있어요.
        </p>
      )}
      {job.error_code && (
        <div className="notice error">
          <AlertCircle size={16} />
          {customerError(job.error_code)}
        </div>
      )}
      {readError && (
        <p className="job-info" role="status">
          {readError}
        </p>
      )}
      {error && job.state !== "completed" && job.state !== "cancelled" && (
        <div className="notice error" role="status">
          {error}
        </div>
      )}
      <details open>
        <summary>작업 로그</summary>
        <ol className="event-list">
          {job.events?.map((e) => (
            <li key={e.id}>
              <time>{new Date(e.created_at).toLocaleTimeString("ko-KR")}</time>
              <span>{customerText(e.message)}</span>
              <small>{e.progress}%</small>
            </li>
          ))}
        </ol>
      </details>
      <div className="job-tracker-actions">
        {!terminal && (
          <Button
            variant="outline"
            size="sm"
            disabled={busy || refreshing || Boolean(readError)}
            onClick={() => setCancel(true)}
          >
            <OctagonX size={15} />
            작업 취소
          </Button>
        )}
        {["failed", "cancelled"].includes(job.state) && (
          <Button
            variant="outline"
            size="sm"
            disabled={busy || refreshing || Boolean(readError)}
            onClick={() => void act("retry")}
          >
            <RefreshCw size={15} />
            같은 입력으로 재시도
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          disabled={busy || refreshing}
          onClick={refresh}
        >
          상태 새로고침
        </Button>
      </div>
      {cancel && !terminal && !readError && (
        <div className="notice warning">
          <div>
            <p>
              현재 작업을 취소할까요? GPU 프로세스 종료가 확인될 때까지 슬롯은
              유지됩니다.
            </p>
            <Button
              variant="danger"
              size="sm"
              disabled={busy || refreshing}
              onClick={() => void act("cancel")}
            >
              취소 확인
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCancel(false)}>
              계속 처리
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
