// Fixture registry. Each ticket adds its own entries; OS-22 dedupes them.
// All data here is MOCK and proves UI/contract behaviour only.
import type { ReactNode } from "react";
import type { Job } from "@objectscan/shared";
import { JobTracker } from "@/components/job-tracker";
import { PaymentResult } from "@/components/payment-result";
import { AuthForm } from "@/components/auth-form";
import { BillingPanel } from "@/components/account-panels";
import { AssetLibrary } from "@/components/asset-library";
import { ModelViewer } from "@/components/model-viewer";
import { Marketplace } from "@/components/marketplace";
import type { Listing } from "@/features/marketplace/asset-card";
import { setAuthFixture } from "../adapters/supabase-client";
import type { FixtureRoute, FixtureRoutes } from "./api";

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
// OS-21: paid, refunded and an unrecognised status, plus a credits order.
const billingStates = {
  ...billing,
  orders: [
    { id: "aaaaaaaa-0000-4000-8000-000000000001", kind: "marketplace", amount: 12000, status: "paid", created_at: t },
    { id: "bbbbbbbb-0000-4000-8000-000000000002", kind: "marketplace", amount: 8000, status: "refunded", created_at: t },
    { id: "cccccccc-0000-4000-8000-000000000003", kind: "marketplace", amount: 7000, status: "chargeback_review_v2", created_at: t },
    { id: "dddddddd-0000-4000-8000-000000000004", kind: "credits", amount: 5000, status: "paid", created_at: t },
  ],
};
const listing = (id: string, title: string, category: string, price: number, license: string): Listing => ({
  id, title, category, price, license, description: "", currency: "KRW", test_mode: true,
});
const listings = [
  listing("l-free", "무료 화분", "decor", 0, "cc0-1.0"),
  listing("l-chair", "원목 의자", "furniture", 8000, "standard"),
  listing("l-lamp", "탁상 조명", "decor", 10000, "standard"),
  listing("l-room", "작은 거실", "scenes", 25000, "cc-by-4.0"),
];
// Mimics the existing API: search + category on the server, sort by price.
const listingsRoute: FixtureRoute = ({ query }) => {
  const q = query.get("search") ?? "", c = query.get("category") ?? "all";
  const out = listings.filter((l) => l.title.includes(q) && (c === "all" || l.category === c));
  if (query.get("sort") === "price") out.sort((a, b) => a.price - b.price);
  return { json: out };
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
  // OS-21: Korean order states, TEST marker and the link to the asset library.
  "billing-orders": {
    title: "구매 내역: 한국어 상태와 내 에셋 연결",
    routes: { ...walletRoutes, "GET billing": () => ({ json: billingStates }) },
    render: () => <BillingPanel />,
  },
  // OS-21: billing lookup is unavailable once, then the retry loads.
  "billing-unavailable": {
    title: "구매 내역: 조회 불가 후 재시도",
    routes: {
      ...walletRoutes,
      "GET billing": ({ call }) =>
        call === 1
          ? { status: 503, json: { code: "UNAVAILABLE", error: "db timeout at 10.0.0.2" } }
          : { json: billingStates },
    },
    render: () => <BillingPanel />,
  },
  // OS-21: a purchased asset whose order was refunded → the server denies the file.
  "assets-download-denied": {
    title: "내 에셋: 환불 후 다운로드 거부",
    routes: {
      "GET assets": () => ({
        json: [{ id: "asset-refunded", name: "원목 의자", created_at: t, quality: { triangles: 12000 }, can_publish: false }],
      }),
      "GET assets/asset-refunded/download": () => ({
        status: 404,
        json: { code: "ASSET_NOT_FOUND", error: "ASSET_NOT_FOUND" },
      }),
    },
    render: () => (
      <main id="main">
        <AssetLibrary />
      </main>
    ),
  },
  // OS-19: demo GLB (public sample) with view presets and fit.
  "viewer-model": {
    title: "결과 뷰어: 방향 보기와 화면 맞춤",
    routes: {},
    render: () => (
      <main id="main" style={{ height: "80vh", padding: 16 }}>
        <ModelViewer demo={false} />
      </main>
    ),
  },
  // OS-19: unreadable file → error state, tools stay disabled.
  "viewer-broken": {
    title: "결과 뷰어: 불러오기 실패",
    routes: {},
    render: () => (
      <main id="main" style={{ height: "80vh", padding: 16 }}>
        <ModelViewer url="/demo/fixture-missing.glb" demo={false} />
      </main>
    ),
  },
  // OS-18: market list with local license/price filters and URL state.
  "market-list": {
    title: "마켓: 라이선스·가격 필터",
    routes: { "GET listings": listingsRoute },
    render: () => (
      <main id="main" className="public-page">
        <Marketplace />
      </main>
    ),
  },
  // OS-18: the first list request fails, the retry succeeds.
  "market-error": {
    title: "마켓: 목록 실패 후 재시도",
    routes: {
      "GET listings": (req) =>
        req.call === 1 ? { status: 503, json: { code: "UNAVAILABLE", error: "db timeout at 10.0.0.2" } } : listingsRoute(req),
    },
    render: () => (
      <main id="main" className="public-page">
        <Marketplace />
      </main>
    ),
  },
};
