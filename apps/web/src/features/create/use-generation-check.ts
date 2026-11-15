import { useEffect, useState } from "react";
import type { z } from "zod";
import { api } from "@/lib/client-api";

type Result<T> = { data: T; failed?: never } | { data?: never; failed: true };

export function useGenerationCheck<T>(
  path: string | undefined,
  schema: z.ZodType<T>,
  revision?: string,
) {
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify([path, revision, attempt]);
  const [result, setResult] = useState<{ key: string; value: Result<T> }>();
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    void api<unknown>(path, { signal: controller.signal, cache: "no-store" })
      .then((value) => schema.parse(value))
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, value: { data } });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setResult({ key, value: { failed: true } });
      });
    return () => controller.abort();
  }, [key, path, schema]);
  const current = result?.key === key ? result.value : undefined;
  return {
    data: current?.data,
    failed: current?.failed,
    pending: !current && Boolean(path),
    hasRetried: attempt > 0,
    retry: () => setAttempt((value) => value + 1),
  };
}
