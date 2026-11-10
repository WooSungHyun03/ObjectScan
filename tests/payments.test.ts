// Provider responses are simulated here; this is not a Toss sandbox transaction.
import { beforeEach, afterEach, expect, test, vi } from "vitest";
const mocks = vi.hoisted(() => ({ adminClient: vi.fn(), rpc: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ adminClient: mocks.adminClient }));
import { verifyPayment } from "../apps/web/src/lib/server/payments";
const order = {
  id: "order-fixture",
  amount: 1000,
  status: "paid",
  kind: "marketplace",
};
let response: Record<string, unknown>;
beforeEach(() => {
  vi.stubEnv("PAYMENTS_MODE", "test");
  vi.stubEnv("TOSS_SECRET_KEY", "test_sk_fixture");
  vi.stubEnv("NEXT_PUBLIC_TOSS_CLIENT_KEY", "test_ck_fixture");
  mocks.rpc
    .mockReset()
    .mockResolvedValue({ data: { status: "refunded" }, error: null });
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue({ data: order, error: null }),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  mocks.adminClient.mockReturnValue({ from: () => query, rpc: mocks.rpc });
  response = {
    orderId: order.id,
    paymentKey: "fixture-key",
    totalAmount: 1000,
    currency: "KRW",
    status: "CANCELED",
    balanceAmount: 0,
    cancels: [
      {
        cancelStatus: "DONE",
        cancelAmount: 1000,
        transactionKey: "cancel-fixture",
      },
    ],
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json(response)),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
test("mock provider: verified full cancellation uses refund RPC", async () => {
  await verifyPayment("fixture-key", order.id, 1000, false);
  expect(mocks.rpc).toHaveBeenCalledWith("settle_test_refund", {
    p_order: order.id,
    p_key: "fixture-key",
    p_amount: 1000,
    p_transaction: "cancel-fixture",
  });
});
test.each([
  { totalAmount: 999 },
  { paymentKey: "another-key" },
  { currency: "USD" },
  { balanceAmount: 500 },
  {
    cancels: [
      { cancelStatus: "DONE", cancelAmount: 500, transactionKey: "partial" },
    ],
  },
  {
    cancels: [
      {
        cancelStatus: "PENDING",
        cancelAmount: 1000,
        transactionKey: "pending",
      },
    ],
  },
  { cancels: [{ cancelStatus: "DONE", cancelAmount: 1000 }] },
])(
  "mock provider: inconsistent cancellation never changes ledger (%j)",
  async (patch) => {
    Object.assign(response, patch);
    await expect(
      verifyPayment("fixture-key", order.id, 1000, false),
    ).rejects.toThrow();
    expect(mocks.rpc).not.toHaveBeenCalled();
  },
);
