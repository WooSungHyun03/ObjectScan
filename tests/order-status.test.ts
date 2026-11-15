import { expect, test } from "vitest";
import {
  orderStatusKnown,
  orderStatusLabel,
} from "@/features/billing/order-status";
test("order status is shown in Korean and unknown values are never shown raw", () => {
  expect(orderStatusLabel("paid")).toBe("결제 완료");
  expect(orderStatusLabel("refunded")).toBe("환불 완료");
  for (const raw of [undefined, "", "chargeback_review", "toString"]) {
    expect(orderStatusLabel(raw)).toBe("확인 중");
    expect(orderStatusKnown(raw)).toBe(false);
  }
});
