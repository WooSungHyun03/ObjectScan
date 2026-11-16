// Fixture registry. Each ticket adds its own entries; OS-22 dedupes them.
// All data here is MOCK and proves UI/contract behaviour only.
import { useState, type ReactNode } from "react";
import { GenerationCheckout } from "@/features/create/generation-checkout";
import { useGenerationSubmission } from "@/features/create/use-generation-submission";
import { api } from "@/lib/client-api";
import { CreateEntry } from "@/features/create/create-entry";
import type { Job, ProjectImage } from "@objectscan/shared";
import { JobTracker } from "@/components/job-tracker";
import { PaymentResult } from "@/components/payment-result";
import { CheckoutButton } from "@/components/checkout-button";
import { AuthForm } from "@/components/auth-form";
import { BillingPanel } from "@/components/account-panels";
import { AssetLibrary } from "@/components/asset-library";
import { ModelViewer } from "@/components/model-viewer";
import { Marketplace } from "@/components/marketplace";
import type { Listing } from "@/features/marketplace/asset-card";
import { DraftPhotos } from "@/features/create/draft-photos";
import { ReconstructionWizard } from "@/components/reconstruction-wizard";
import { putDraft } from "@/features/create/upload-draft";
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
    {
      id: "22222222-0000-4000-8000-000000000002",
      kind: "marketplace",
      amount: 8000,
      status: "paid",
      created_at: t,
    },
    {
      id: "33333333-0000-4000-8000-000000000003",
      kind: "credits",
      amount: 5000,
      status: "paid",
      created_at: t,
    },
  ],
};
// OS-21: paid, refunded and an unrecognised status, plus a credits order.
const billingStates = {
  ...billing,
  // Payout status and ledger kind values from the DB checks, plus one unknown each.
  payouts: [
    {
      id: "p1",
      kind: "payout",
      amount: 3000,
      status: "requested",
      created_at: t,
    },
    {
      id: "p2",
      kind: "payout",
      amount: 2000,
      status: "manual_hold_v2",
      created_at: t,
    },
  ],
  ledger: [
    { id: "g1", kind: "marketplace_purchase", amount: -12000, created_at: t },
    { id: "g2", kind: "fee", amount: -1200, created_at: t },
    { id: "g3", kind: "promo_adjust_v2", amount: 100, created_at: t },
  ],
  orders: [
    {
      id: "aaaaaaaa-0000-4000-8000-000000000001",
      kind: "marketplace",
      amount: 12000,
      status: "paid",
      created_at: t,
    },
    {
      id: "bbbbbbbb-0000-4000-8000-000000000002",
      kind: "marketplace",
      amount: 8000,
      status: "refunded",
      created_at: t,
    },
    {
      id: "cccccccc-0000-4000-8000-000000000003",
      kind: "marketplace",
      amount: 7000,
      status: "chargeback_review_v2",
      created_at: t,
    },
    {
      id: "dddddddd-0000-4000-8000-000000000004",
      kind: "credits",
      amount: 5000,
      status: "paid",
      created_at: t,
    },
  ],
};
const listing = (
  id: string,
  title: string,
  category: string,
  price: number,
  license: string,
): Listing => ({
  id,
  title,
  category,
  price,
  license,
  description: "",
  currency: "KRW",
  test_mode: true,
});
const listings = [
  listing("l-free", "무료 화분", "decor", 0, "cc0-1.0"),
  listing("l-chair", "원목 의자", "furniture", 8000, "standard"),
  listing("l-lamp", "탁상 조명", "decor", 10000, "standard"),
  listing("l-room", "작은 거실", "scenes", 25000, "cc-by-4.0"),
];
// Mimics the existing API: search + category on the server, sort by price.
const listingsRoute: FixtureRoute = ({ query }) => {
  const q = query.get("search") ?? "",
    c = query.get("category") ?? "all";
  const out = listings.filter(
    (l) => l.title.includes(q) && (c === "all" || l.category === c),
  );
  if (query.get("sort") === "price") out.sort((a, b) => a.price - b.price);
  return { json: out };
};
const walletRoutes: FixtureRoutes = {
  "GET wallet": () => ({ json: { balance: 3, trial_available: false } }),
  "GET pricing": () => ({ json: { packages: [] } }),
};
const paySearch =
  "?paymentKey=fixture-only&orderId=00000000-0000-4000-8000-000000000001&amount=1000";
const payment = (title: string, confirm: FixtureRoute): Fixture => ({
  title,
  search: paySearch,
  routes: { "POST payments/confirm": confirm },
  render: () => <PaymentResult />,
});
// OS-07: memory-only draft; the upload callback only records what it would send.
const draft = (
  title: string,
  names: string[],
  diagnostics?: Parameters<typeof DraftPhotos>[0]["diagnostics"],
): Fixture => ({
  title,
  routes: {},
  setup: () =>
    putDraft(names.map((n) => new File([n], n, { type: "image/jpeg" }))),
  render: () => (
    <main id="main" style={{ padding: 16 }}>
      <h1>MOCK 사진 준비</h1>
      <DraftPhotos
        busy={false}
        diagnostics={diagnostics}
        onUpload={async (files) => {
          (window as unknown as { __uploaded: string[] }).__uploaded =
            files.map((f) => f.name);
        }}
      />
    </main>
  ),
});
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
    {
      id: "e1",
      stage: "queued",
      message: "작업이 대기열에 등록되었습니다.",
      progress: 0,
      created_at: t,
    },
  ],
  ...over,
});
// OS-08: wizard on an existing object project; the API mirrors projects/:id, masks and images PATCH.
const pid = "p-fixture";
const photo = (
  id: string,
  position: number,
  over: Partial<ProjectImage> = {},
): ProjectImage => ({
  id,
  project_id: pid,
  filename: `${id}.webp`,
  original_path: "",
  position,
  excluded: false,
  width: 800,
  height: 800,
  size_bytes: 1,
  status: "verified",
  url: "/demo/shoe-photo.webp",
  ...over,
});
const mask = { mask_url: "/brand/mascot/front.webp" };
const wizard = (
  title: string,
  images: () => ProjectImage[],
  routes: FixtureRoutes = {},
  jobs: Job[] = [],
): Fixture => ({
  title,
  routes: {
    "GET health": () => ({
      json: {
        worker_online: false,
        real_gpu_validated: false,
        payments_mode: "test",
        models: [],
      },
    }),
    [`GET projects/${pid}`]: () => ({
      json: {
        id: pid,
        name: "MOCK 운동화",
        mode: "object",
        capture_mode: "camera_orbit",
        status: "uploaded",
        input_image_count: 3,
        created_at: t,
        updated_at: t,
        target_image_id: "a",
        target_selection: {
          kind: "box",
          x: 0.2,
          y: 0.2,
          width: 0.5,
          height: 0.5,
        },
        images: images(),
        jobs,
        artifacts: [],
      },
    }),
    ...routes,
  },
  render: () => (
    <ReconstructionWizard initialMode="object" initialProject={pid} />
  ),
});
// Server state for the stale-approval fixture: the first approval lands after the revision moved.
let revisionMoved = false;
let approved: string[] = [];
let excluded: string[] = [];

function GenerationFixture({ blocked = false }: { blocked?: boolean }) {
  const [tracked, setTracked] = useState("");
  const submission = useGenerationSubmission({
    projectId: "fixture-project",
    input: "revision-1",
    jobs: [],
    load: () => api<{ jobs: Job[] }>("projects/fixture-project"),
    track: setTracked,
  });
  return (
    <main id="main">
      <h1>MOCK generation</h1>
      <GenerationCheckout
        quote={{
          project: { mode: "object", input_image_count: blocked ? 21 : 1 },
          gate: {
            allowed: !blocked,
            errors: blocked ? ["INPUT_PROFILE_NOT_VALIDATED"] : [],
          },
        }}
        refreshQuote={() => {}}
        submission={submission}
      />
      {tracked && <p data-testid="tracked-job">{tracked}</p>}
    </main>
  );
}
const generationWallet: FixtureRoutes = {
  "GET wallet": () => ({
    json: {
      balance: 5,
      rates: [{ mode: "object", min_images: 1, credits: 1 }],
    },
  }),
};
function DraftFailureFixture() {
  const [attempt, setAttempt] = useState(0);
  return (
    <main id="main">
      <h1>MOCK upload failure</h1>
      <DraftPhotos
        busy={false}
        onUpload={async () => {
          setAttempt((v) => v + 1);
          return attempt > 0;
        }}
      />
    </main>
  );
}
export const fixtures: Record<string, Fixture> = {
  "generation-blocked": {
    title: "Unsupported generation",
    routes: generationWallet,
    render: () => <GenerationFixture blocked />,
  },
  "generation-ambiguous": {
    title: "Ambiguous generation",
    routes: {
      ...generationWallet,
      "POST projects/fixture-project/generate": () => ({
        network: true,
        json: null,
      }),
      "GET projects/fixture-project": () => ({
        json: { jobs: [job({ id: "new-job", state: "queued" })] },
      }),
    },
    render: () => <GenerationFixture />,
  },
  "job-network-recovery": {
    title: "Polling failure recovery",
    routes: {
      "GET jobs/fixture-job": ({ call }) =>
        call === 1
          ? { status: 503, json: { code: "UNAVAILABLE" } }
          : { json: job({ state: "queued" }) },
    },
    render: () => <JobTracker jobId="fixture-job" />,
  },
  "asset-delete-hold": {
    title: "Deletion rights hold",
    routes: {
      "GET assets": () => ({
        json: [
          {
            id: "owned-asset",
            name: "MOCK owned",
            created_at: t,
            can_publish: true,
            project_id: pid,
            quality: { triangles: 12 },
          },
        ],
      }),
      "DELETE assets/owned-asset": ({ call }) =>
        call === 1
          ? { status: 503, json: { code: "UNAVAILABLE" } }
          : { status: 409, json: { code: "ASSET_HAS_PURCHASES" } },
    },
    render: () => (
      <main id="main">
        <AssetLibrary />
      </main>
    ),
  },

  "create-entry-limit": {
    title: "Upload limit",
    routes: {
      "GET health": () => ({
        json: {
          configured: true,
          worker_online: true,
          real_gpu_validated: true,
          capabilities: { single_photo: true },
        },
      }),
    },
    render: () => <CreateEntry />,
  },
  "draft-upload-failure": {
    title: "Draft upload failure",
    routes: {},
    setup: () =>
      putDraft([new File(["fixture"], "keep.jpg", { type: "image/jpeg" })]),
    render: () => <DraftFailureFixture />,
  },
  "checkout-response-lost": {
    title: "Order response lost",
    routes: {
      "GET health": () => ({ json: { payments_mode: "test" } }),
      "POST orders": ({ call }) =>
        call === 1
          ? { network: true, json: null }
          : {
              json: {
                id: "00000000-0000-4000-8000-000000000009",
                amount: 1000,
                currency: "KRW",
                status: "pending",
                kind: "marketplace",
              },
            },
    },
    render: () => (
      <main id="main">
        <h1>MOCK purchase retry</h1>
        <CheckoutButton listingId="l-chair" />
      </main>
    ),
  },

  // OS-08: the mask request fails (worker 503); photos and the saved selection must stay.
  "mask-analysis-503": wizard(
    "마스크: 분석 요청 실패",
    () => [photo("a", 0), photo("b", 1), photo("c", 2)],
    {
      [`POST projects/${pid}/masks`]: () => ({
        status: 503,
        json: {
          code: "WORKER_NOT_CONFIGURED",
          error: "GPU 작업자 연결을 준비하고 있습니다.",
        },
      }),
    },
  ),
  // OS-08: mask job finished but one photo got no mask; approve by keyboard, exclude the failed photo.
  "mask-partial": wizard(
    "마스크: 일부 사진 실패",
    () => [
      photo("a", 0, { ...mask, mask_reviewed: approved.includes("a") }),
      photo("b", 1, { ...mask, excluded: excluded.includes("b") }),
      photo("c", 2),
    ],
    {
      [`PATCH projects/${pid}/masks/a`]: ({ body }) => {
        approved = (body as { reviewed: boolean }).reviewed ? ["a"] : [];
        return { delay: 200, json: { ok: true } };
      },
      [`PATCH projects/${pid}/images/b`]: ({ body }) => {
        excluded = (body as { excluded?: boolean }).excluded ? ["b"] : [];
        return { delay: 200, json: { ok: true } };
      },
    },
    [job({ id: "mask-job", kind: "masks", state: "completed", progress: 100 })],
  ),
  // OS-08: approving after the selection changed elsewhere; the server answers MASK_NOT_FOUND
  // for the stale revision and the next read shows no approvals.
  "mask-stale-approval": wizard(
    "마스크: 변경된 선택의 이전 승인",
    () => [
      photo("a", 0, { ...mask, mask_reviewed: !revisionMoved }),
      photo("b", 1, mask),
    ],
    {
      [`PATCH projects/${pid}/masks/b`]: () => {
        revisionMoved = true;
        return {
          status: 404,
          json: { code: "MASK_NOT_FOUND", error: "MASK_NOT_FOUND" },
        };
      },
    },
  ),
  // OS-08: another user's project id answers 404 without any project detail.
  "project-other-404": {
    title: "마스크: 다른 사용자의 프로젝트",
    routes: {
      "GET health": () => ({
        json: {
          worker_online: false,
          real_gpu_validated: false,
          payments_mode: "test",
          models: [],
        },
      }),
      "GET projects/p-other-owner": () => ({
        status: 404,
        json: {
          code: "PROJECT_NOT_FOUND",
          error: "프로젝트를 찾을 수 없습니다.",
        },
      }),
    },
    render: () => (
      <ReconstructionWizard
        initialMode="object"
        initialProject="p-other-owner"
      />
    ),
  },
  // OS-12: job state — failed, then the same-input retry succeeds into the queue.
  "job-failed-retry": {
    title: "작업 상태: 실패 후 재시도",
    routes: {
      "GET jobs/fixture-job": ({ call }) => ({
        json:
          call === 1
            ? job({
                state: "failed",
                progress: 40,
                error_code: "INVALID_VIEW_COUNT",
              })
            : job({ state: "queued", progress: 0 }),
      }),
      "POST jobs/fixture-job/retry": () => ({ json: { ok: true } }),
    },
    render: () => <JobTracker jobId="fixture-job" />,
  },
  // OS-12: order state — provider error first, then the same order confirms.
  "payment-error-retry": {
    title: "주문 상태: 확인 실패 후 재확인",
    search:
      "?paymentKey=fixture-only&orderId=00000000-0000-4000-8000-000000000001&amount=1000",
    routes: {
      "POST payments/confirm": ({ call }) =>
        call === 1
          ? {
              status: 502,
              json: {
                code: "PROCESSOR_ERROR",
                error: "upstream 10.0.0.1 detail",
              },
            }
          : { json: { status: "paid" } },
    },
    render: () => <PaymentResult />,
  },
  // OS-10: the approval response is lost once; the server already holds the paid order.
  "payment-response-lost": payment(
    "결제 복귀: 승인 응답 유실 후 재확인",
    ({ call }) =>
      call === 1
        ? { network: true, json: null }
        : { delay: 400, json: { status: "paid" } },
  ),
  // OS-10: amount in the return URL does not match the server order.
  "payment-amount-mismatch": payment("결제 복귀: 금액 불일치", () => ({
    status: 409,
    json: { code: "AMOUNT_MISMATCH", error: "order amount 5000 != 1000" },
  })),
  // OS-10: returning to an order whose validity window has passed.
  "payment-expired": payment("결제 복귀: 만료된 주문", () => ({
    status: 409,
    json: { code: "ORDER_EXPIRED", error: "ORDER_EXPIRED" },
  })),
  // OS-10: re-checking an order that was refunded in the meantime.
  "payment-refunded": payment("결제 복귀: 환불된 주문", () => ({
    json: { status: "refunded" },
  })),
  // OS-10: purchase button pressed twice while the order request is in flight.
  "checkout-double": {
    title: "구매 버튼: 중복 클릭",
    routes: {
      "GET health": () => ({ json: { payments_mode: "test" } }),
      "POST orders": () => ({
        delay: 400,
        json: {
          id: "00000000-0000-4000-8000-000000000009",
          amount: 1000,
          currency: "KRW",
          status: "pending",
          kind: "marketplace",
        },
      }),
    },
    render: () => (
      <main id="main" style={{ padding: 16 }}>
        <h1>MOCK 구매</h1>
        <CheckoutButton listingId="l-chair" />
      </main>
    ),
  },
  // OS-07: sharp, blurry, exact duplicate and a photo that could not be checked.
  "draft-diagnostics": draft(
    "사진 준비: 선명도·중복 안내",
    ["front.jpg", "side.jpg", "blurry.jpg", "front-copy.jpg", "broken.jpg"],
    {
      "front.jpg": { sharpness: 20.5 },
      "side.jpg": { sharpness: 18.2 },
      "blurry.jpg": { sharpness: 1.7 },
      "front-copy.jpg": { sharpness: 20.5, duplicate_of: "front.jpg" },
      "broken.jpg": { unavailable: true },
    },
  ),
  // OS-07: no diagnostics yet → static shooting guide, keyboard reorder and exclude.
  "draft-reorder": draft("사진 준비: 순서 정리", ["a.jpg", "b.jpg", "c.jpg"]),
  // OS-02: signup without session → waiting state with resend cooldown.
  "signup-unconfirmed": {
    title: "가입: 이메일 확인 대기",
    routes: {},
    setup: () =>
      setAuthFixture({
        signUp: () => ({
          data: { session: null, user: { id: "fixture-user" } },
          error: null,
        }),
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
          error: {
            name: "AuthSessionMissingError",
            message: "Auth session missing!",
          },
        }),
      }),
    render: () => <AuthForm kind="reset" configured />,
  },
  // OS-02: forgot page after the callback rejected an expired link.
  "forgot-link-expired": {
    title: "재설정 요청: 링크 만료 후 복귀",
    search: "?error=link_expired",
    routes: {},
    setup: () =>
      setAuthFixture({
        resetPasswordForEmail: () => ({ data: {}, error: null }),
      }),
    render: () => <AuthForm kind="forgot" configured />,
  },
  // OS-02: login with an external next URL must stay internal.
  "login-next": {
    title: "로그인: 복귀 경로 검사",
    search: "?next=https://evil.test/steal",
    routes: {},
    setup: () =>
      setAuthFixture({ signInWithPassword: () => ({ data: {}, error: null }) }),
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
          ? {
              status: 404,
              json: {
                code: "NOT_FOUND",
                error: "order 22222222 of user other@x.test",
              },
            }
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
          ? {
              status: 503,
              json: { code: "UNAVAILABLE", error: "db timeout at 10.0.0.2" },
            }
          : { json: billingStates },
    },
    render: () => <BillingPanel />,
  },
  // OS-21: a purchased asset whose order was refunded → the server denies the file.
  "assets-download-denied": {
    title: "내 에셋: 환불 후 다운로드 거부",
    routes: {
      "GET assets": () => ({
        json: [
          {
            id: "asset-refunded",
            name: "원목 의자",
            created_at: t,
            quality: { triangles: 12000 },
            can_publish: false,
          },
        ],
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
        req.call === 1
          ? {
              status: 503,
              json: { code: "UNAVAILABLE", error: "db timeout at 10.0.0.2" },
            }
          : listingsRoute(req),
    },
    render: () => (
      <main id="main" className="public-page">
        <Marketplace />
      </main>
    ),
  },
};
