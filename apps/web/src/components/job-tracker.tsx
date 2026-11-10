"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  OctagonX,
  RefreshCw,
} from "lucide-react";
import type { Job } from "@objectscan/shared";
import { api, post, stateLabels } from "@/lib/client-api";
import { Button } from "./ui/button";
export function JobTracker({
  jobId,
  onComplete,
}: {
  jobId: string;
  onComplete?: () => Promise<void>;
}) {
  const [job, setJob] = useState<Job | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [cancel, setCancel] = useState(false),
    [pollVersion, setPollVersion] = useState(0);
  const load = useCallback(async () => {
    const j = await api<Job>(`jobs/${jobId}`);
    setJob(j);
    return j;
  }, [jobId]);
  useEffect(() => {
    let stopped = false,
      t: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const j = await load();
        if (!stopped && !["completed", "failed", "cancelled"].includes(j.state))
          t = setTimeout(poll, 4000);
        else if (j.state === "completed") await onComplete?.();
      } catch (e) {
        if (!stopped) setError((e as Error).message);
      }
    }
    void poll();
    return () => {
      stopped = true;
      clearTimeout(t);
    };
  }, [load, onComplete, pollVersion]);
  async function act(path: string) {
    setBusy(true);
    setError("");
    try {
      await post(`jobs/${jobId}/${path}`);
      await load();
      setPollVersion((v) => v + 1);
      setCancel(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!job)
    return (
      <div className="inline-empty">{error || "작업 상태를 불러오는 중…"}</div>
    );
  const terminal = ["completed", "failed", "cancelled"].includes(job.state);
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
              ? "SAM2 마스크 분석"
              : job.kind === "poses"
                ? "카메라 정합"
                : "3D 메시 생성"}
          </small>
          <h3>{stateLabels[job.state]}</h3>
        </div>
        <strong>{job.progress}%</strong>
      </div>
      <progress max="100" value={job.progress} />
      {job.state === "queued" && (
        <p className="job-info">
          한 번에 하나의 GPU 작업을 처리합니다. 현재 순서에서 기다리고 있어요.
        </p>
      )}
      {job.error_code && (
        <div className="notice error">
          <AlertCircle size={16} />
          {job.error_code}
        </div>
      )}
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      <details open>
        <summary>작업 로그</summary>
        <ol className="event-list">
          {job.events?.map((e) => (
            <li key={e.id}>
              <time>{new Date(e.created_at).toLocaleTimeString("ko-KR")}</time>
              <span>{e.message}</span>
              <small>{e.progress}%</small>
            </li>
          ))}
        </ol>
      </details>
      <div className="job-tracker-actions">
        {!terminal && (
          <Button variant="outline" size="sm" onClick={() => setCancel(true)}>
            <OctagonX size={15} />
            작업 취소
          </Button>
        )}
        {["failed", "cancelled"].includes(job.state) && (
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => void act("retry")}
          >
            <RefreshCw size={15} />
            같은 입력으로 재시도
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => void load().catch((e) => setError(e.message))}
        >
          상태 새로고침
        </Button>
      </div>
      {cancel && (
        <div className="notice warning">
          <div>
            <p>
              현재 작업을 취소할까요? GPU 프로세스 종료가 확인될 때까지 슬롯은
              유지됩니다.
            </p>
            <Button
              variant="danger"
              size="sm"
              disabled={busy}
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
