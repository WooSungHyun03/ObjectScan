// Fixture registry. Each ticket adds its own entries; OS-22 dedupes them.
// All data here is MOCK and proves UI/contract behaviour only.
import type { ReactNode } from "react";
import type { Job } from "@objectscan/shared";
import { JobTracker } from "@/components/job-tracker";
import { PaymentResult } from "@/components/payment-result";
import type { FixtureRoutes } from "./api";

export type Fixture = {
  title: string;
  routes: FixtureRoutes;
  render: () => ReactNode;
  search?: string; // query string the fixture page expects
};

const t = "2026-11-12T03:00:00.000Z";
const job = (over: Partial<Job>): Job => ({
  id: "fixture-job",
  project_id: "fixture-project",
  kind: "generation",
  state: "queued",
  progress: 0,
  model: "pixal3d",
  created_at: t,
  updated_at: t,
  events: [
    { id: "e1", stage: "queued", message: "작업이 대기열에 등록되었습니다.", progress: 0, created_at: t },
  ],
  ...over,
});

export const fixtures: Record<string, Fixture> = {
  // OS-12: job state — failed, then the same-input retry succeeds into the queue.
  "job-failed-retry": {
    title: "작업 상태: 실패 후 재시도",
    routes: {
      "GET jobs/fixture-job": ({ call }) => ({
        json:
          call === 1
            ? job({ state: "failed", progress: 40, error_code: "INVALID_VIEW_COUNT" })
            : job({ state: "queued", progress: 0 }),
      }),
      "POST jobs/fixture-job/retry": () => ({ json: { ok: true } }),
    },
    render: () => <JobTracker jobId="fixture-job" />,
  },
  // OS-12: order state — provider error first, then the same order confirms.
  "payment-error-retry": {
    title: "주문 상태: 확인 실패 후 재확인",
    search: "?paymentKey=fixture-only&orderId=00000000-0000-4000-8000-000000000001&amount=1000",
    routes: {
      "POST payments/confirm": ({ call }) =>
        call === 1
          ? { status: 502, json: { code: "PROCESSOR_ERROR", error: "upstream 10.0.0.1 detail" } }
          : { json: { status: "paid" } },
    },
    render: () => <PaymentResult />,
  },
};
