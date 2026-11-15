import { useEffect, useRef, useState } from "react";
import { jobStateSchema, type Job } from "@objectscan/shared";
import { api } from "@/lib/client-api";
import {
  canRetryJobRead,
  isTerminalJob,
  jobPollingDelay,
  jobReadMessage,
} from "./job-polling";

export function useJobPolling(jobId: string, onComplete?: () => Promise<void>) {
  const [snapshot, setSnapshot] = useState<{
    jobId: string;
    version: number;
    job?: Job;
    error?: string;
  }>();
  const [version, setVersion] = useState(0);
  const completed = useRef<string>(undefined);
  useEffect(() => {
    let disposed = false;
    let terminal = false;
    let fatal = false;
    let failures = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let request: AbortController | undefined;
    function pause() {
      clearTimeout(timer);
      request?.abort();
      request = undefined;
    }
    async function poll() {
      if (disposed || request || terminal || fatal || document.hidden) return;
      clearTimeout(timer);
      const controller = new AbortController();
      request = controller;
      try {
        const job = await api<Job>(`jobs/${jobId}`, {
          cache: "no-store",
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(15_000),
          ]),
        });
        if (controller.signal.aborted) return;
        if (job?.id !== jobId || !jobStateSchema.safeParse(job.state).success)
          throw new Error("Invalid job response");
        failures = 0;
        terminal = isTerminalJob(job.state);
        setSnapshot({ jobId, version, job });
        if (job.state === "completed" && completed.current !== jobId) {
          completed.current = jobId;
          void onComplete?.().catch(() => undefined);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        failures++;
        fatal = !canRetryJobRead(error);
        setSnapshot((previous) => ({
          jobId,
          version,
          job: !fatal && previous?.jobId === jobId ? previous.job : undefined,
          error: jobReadMessage(error),
        }));
      } finally {
        if (!controller.signal.aborted) {
          request = undefined;
          if (!terminal && !fatal)
            timer = setTimeout(poll, jobPollingDelay(failures));
        }
      }
    }
    function resume() {
      if (document.hidden) pause();
      else void poll();
    }
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("online", resume);
    void poll();
    return () => {
      disposed = true;
      pause();
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("online", resume);
    };
  }, [jobId, onComplete, version]);

  return {
    ...(snapshot?.jobId === jobId
      ? snapshot
      : { job: undefined, error: undefined }),
    refreshing: snapshot?.jobId !== jobId || snapshot.version !== version,
    refresh: () => setVersion((value) => value + 1),
  };
}
