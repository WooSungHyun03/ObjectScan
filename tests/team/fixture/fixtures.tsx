// Fixture registry. Each ticket adds its own entries; OS-22 dedupes them.
// All data here is MOCK and proves UI/contract behaviour only.
import type { ReactNode } from "react";
import type { Job } from "@objectscan/shared";
import { JobTracker } from "@/components/job-tracker";
import { PaymentResult } from "@/components/payment-result";
import { AuthForm } from "@/components/auth-form";
import { BillingPanel } from "@/components/account-panels";
import { setAuthFixture } from "../adapters/supabase-client";
import type { FixtureRoutes } from "./api";

export type Fixture = {
  title: string;
  routes: FixtureRoutes;
  render: () => ReactNode;
  setup?: () => void; // e.g. script non-fetch adapters such as the auth client
  search?: string; // query string the fixture page expects
};

const t = "2026-11-12T03:00:00.000Z";
const billing = {
  ledger: [],
  balance: { available: 0, reserved: 0 },
  payouts: [],
  payments_mode: "test",
  orders: [
    {
      id: "11111111-0000-4000-8000-000000000001",
      kind: "marketplace",
      amount: 12000,
      status: "paid",
      created_at: t,
      // OWN-06 contract shape; server-only fields must not be sent to the client.
      license_snapshot: {
        schema_version: 1,
        license_code: "cc-by-4.0",
        license_label: "CC BY 4.0",
        listing_title: "원목 의자",
        source_version: "original",
        source_sha256: "9f2c4e7a1b3d5f60718293a4b5c6d7e8",
        captured_at: t,
      },
    },
    { id: "22222222-0000-4000-8000-000000000002", kind: "marketplace", amount: 8000, status: "paid", created_at: t },
    { id: "33333333-0000-4000-8000-000000000003", kind: "credits", amount: 5000, status: "paid", created_at: t },
  ],
};
const walletRoutes: FixtureRoutes = {
  "GET wallet": () => ({ json: { balance: 3, trial_available: false } }),
  "GET pricing": () => ({ json: { packages: [] } }),
};
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
  // OS-02: signup without session → waiting state with resend cooldown.
  "signup-unconfirmed": {
    title: "가입: 이메일 확인 대기",
    routes: {},
    setup: () =>
      setAuthFixture({
        signUp: () => ({ data: { session: null, user: { id: "fixture-user" } }, error: null }),
        resend: () => ({ data: {}, error: null }),
      }),
    render: () => <AuthForm kind="signup" configured />,
  },
  // OS-02: opening an expired recovery link, then saving a password.
  "reset-expired": {
    title: "비밀번호 재설정: 만료된 링크",
    routes: {},
    setup: () =>
      setAuthFixture({
        updateUser: () => ({
          error: { name: "AuthSessionMissingError", message: "Auth session missing!" },
        }),
      }),
    render: () => <AuthForm kind="reset" configured />,
  },
  // OS-02: forgot page after the callback rejected an expired link.
  "forgot-link-expired": {
    title: "재설정 요청: 링크 만료 후 복귀",
    search: "?error=link_expired",
    routes: {},
    setup: () => setAuthFixture({ resetPasswordForEmail: () => ({ data: {}, error: null }) }),
    render: () => <AuthForm kind="forgot" configured />,
  },
  // OS-02: login with an external next URL must stay internal.
  "login-next": {
    title: "로그인: 복귀 경로 검사",
    search: "?next=https://evil.test/steal",
    routes: {},
    setup: () => setAuthFixture({ signInWithPassword: () => ({ data: {}, error: null }) }),
    render: () => <AuthForm kind="login" configured />,
  },
  // OS-04: recorded snapshot, legacy order without snapshot, non-market order.
  "billing-terms": {
    title: "구매 내역: 주문 시점 이용 조건",
    routes: { ...walletRoutes, "GET billing": () => ({ json: billing }) },
    render: () => <BillingPanel />,
  },
  // OS-04: billing lookup fails once, then the retry loads.
  "billing-error": {
    title: "구매 내역: 조회 실패 후 재시도",
    routes: {
      ...walletRoutes,
      "GET billing": ({ call }) =>
        call === 1
          ? { status: 404, json: { code: "NOT_FOUND", error: "order 22222222 of user other@x.test" } }
          : { json: billing },
    },
    render: () => <BillingPanel />,
  },
};
