import { expect, test } from "vitest";
import {
  ledgerKindLabel,
  orderStatusKnown,
  orderStatusLabel,
  payoutStatusLabel,
} from "@/features/billing/order-status";
test("payout status and ledger kind are Korean, unknown values fall back", () => {
  expect(payoutStatusLabel("requested")).toBe("검토 대기");
  expect(ledgerKindLabel("fee")).toBe("판매 수수료");
  expect(payoutStatusLabel("hasOwnProperty")).toBe("확인 중");
  expect(ledgerKindLabel(undefined)).toBe("확인 중");
});
test("order status is shown in Korean and unknown values are never shown raw", () => {
  expect(orderStatusLabel("paid")).toBe("결제 완료");
  expect(orderStatusLabel("refunded")).toBe("환불 완료");
  for (const raw of [undefined, "", "chargeback_review", "toString"]) {
    expect(orderStatusLabel(raw)).toBe("확인 중");
    expect(orderStatusKnown(raw)).toBe(false);
  }
});
