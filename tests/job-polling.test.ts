import { expect, test } from "vitest";
import { ApiResponseError } from "../apps/web/src/lib/client-api";
import {
  canRetryJobRead,
  isTerminalJob,
  jobPollingDelay,
  jobReadMessage,
} from "../apps/web/src/features/create/job-polling";

test("OS-03 job reads back off without retrying a missing or unauthorized job", () => {
  expect([0, 1, 2, 3, 12].map(jobPollingDelay)).toEqual([
    4000, 8000, 16000, 30000, 30000,
  ]);
  expect(canRetryJobRead(new ApiResponseError(503))).toBe(true);
  expect(canRetryJobRead(new ApiResponseError(429))).toBe(true);
  expect(canRetryJobRead(new Error("offline"))).toBe(true);
  for (const status of [401, 403, 404]) {
    expect(canRetryJobRead(new ApiResponseError(status))).toBe(false);
    expect(jobReadMessage(new ApiResponseError(status))).toContain("접근 권한");
  }
});

test("OS-03 server terminal states stop polling", () => {
  expect(
    ["completed", "failed", "cancelled"].every((state) =>
      isTerminalJob(state as "completed" | "failed" | "cancelled"),
    ),
  ).toBe(true);
  expect(isTerminalJob("reconstruction")).toBe(false);
});
