import { useRef, useState } from "react";
import type { Job } from "@objectscan/shared";
import { ApiResponseError, api } from "@/lib/client-api";
import { isTerminalJob } from "./job-polling";

type Attempt = { input: string; key: string; previousJobs: Set<string> };
type Status = "idle" | "sending" | "unknown" | "checking" | "retry";

export function useGenerationSubmission({
  projectId,
  input,
  jobs,
  load,
  track,
}: {
  projectId: string;
  input: string;
  jobs: Job[];
  load: () => Promise<{ jobs: Job[] } | undefined>;
  track: (id: string) => void;
}) {
  const attempt = useRef<Attempt>(undefined);
  const locked = useRef(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function check() {
    if (locked.current || !attempt.current) return;
    locked.current = true;
    setStatus("checking");
    setError("");
    try {
      const previous = attempt.current.previousJobs;
      const project = await load();
      if (!project) throw new Error("Missing project");
      const existing = project.jobs.find(
        (job) =>
          job.kind === "generation" &&
          (!previous.has(job.id) || !isTerminalJob(job.state)),
      );
      if (existing) {
        attempt.current = undefined;
        setStatus("idle");
        track(existing.id);
      } else {
        setStatus("retry");
      }
    } catch {
      setStatus("unknown");
      setError(
        "작업 목록을 확인할 수 없습니다. 연결을 확인한 뒤 다시 조회해 주세요.",
      );
    } finally {
      locked.current = false;
    }
  }

  async function start() {
    if (locked.current || !projectId || status === "unknown") return;
    const existing = jobs.find(
      (job) => job.kind === "generation" && !isTerminalJob(job.state),
    );
    if (existing) {
      track(existing.id);
      return;
    }
    locked.current = true;
    setStatus("sending");
    setError("");
    if (attempt.current?.input !== input) {
      attempt.current = {
        input,
        key: crypto.randomUUID(),
        previousJobs: new Set(jobs.map((job) => job.id)),
      };
    }
    try {
      const result = await api<{ id: string }>(
        `projects/${projectId}/generate`,
        {
          method: "POST",
          body: JSON.stringify({ idempotency_key: attempt.current.key }),
          signal: AbortSignal.timeout(20_000),
        },
      );
      if (!result?.id) throw new Error("Missing job ID");
      attempt.current = undefined;
      setStatus("idle");
      track(result.id);
      void load().catch(() => undefined);
    } catch (error) {
      if (
        status !== "retry" &&
        error instanceof ApiResponseError &&
        error.status >= 400 &&
        error.status < 500 &&
        error.status !== 408 &&
        error.status !== 429
      ) {
        setStatus("idle");
        setError(error.message);
      } else {
        setStatus("unknown");
      }
    } finally {
      locked.current = false;
    }
  }
  return { status, error, start, check };
}
