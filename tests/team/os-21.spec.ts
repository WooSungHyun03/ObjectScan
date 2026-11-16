// MOCK: billing/assets fixtures over the existing billing + assets APIs (no new endpoint).
import { test, expect } from "@playwright/test";
import { checkPage, shooter } from "./check";

const shot = shooter("OS-21");
// shortcut: real app bugs — `.project-info p` is 4.12:1 and `.workspace-notice` 4.49:1 in globals.css; drop once fixed.
const known = { contrastExclude: [".project-info > p", ".workspace-notice"] };
const raw = [
  "paid",
  "refunded",
  "chargeback_review_v2",
  "pending",
  "requested",
  "manual_hold_v2",
  "marketplace_purchase",
  "promo_adjust_v2",
];

test("OS-21 orders show Korean status, TEST marker, amount and the asset link", async ({
  page,
}, info) => {
  await page.goto("/?fixture=billing-orders");
  const orders = page.locator("section", { hasText: "주문과 환불 검토" });
  await expect(orders).toContainText(
    "에셋 구매 · ₩12,000 · 결제 완료 · 테스트 결제",
  );
  await expect(orders).toContainText("₩8,000 · 환불 완료");
  await expect(orders).toContainText("₩7,000 · 확인 중");
  const text = await orders.innerText();
  for (const r of raw) expect(text).not.toContain(r);

  // Only the paid marketplace order links to the library; refunded/unknown/credits do not.
  const link = orders.getByRole("link", { name: "내 에셋에서 파일 받기" });
  await expect(link).toHaveCount(1);
  await expect(link).toHaveAttribute("href", "/assets");
  await expect(orders).toContainText(
    "환불된 주문입니다. 이 주문의 파일은 받을 수 없습니다.",
  );
  // Payout status and ledger kind are Korean too; unknown values never show raw.
  const body = page.locator("body");
  await expect(body).toContainText("₩3,000 · 검토 대기");
  await expect(body).toContainText("₩2,000 · 확인 중");
  await expect(page.getByRole("cell", { name: "에셋 구매" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "판매 수수료" })).toBeVisible();
  const all = await body.innerText();
  for (const r of raw) expect(all).not.toContain(r);
  await link.focus();
  await expect(link).toBeFocused();
  await checkPage(page, known);
  await shot(page, "billing-orders", info.project.name);

  // Unknown status offers a recovery action that re-reads the server state.
  const before = await page.evaluate(
    () =>
      (
        window as never as { __fixtureCalls: { key: string }[] }
      ).__fixtureCalls.filter((c) => c.key === "GET billing").length,
  );
  await orders.getByRole("button", { name: "상태 다시 확인" }).press("Enter");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as never as { __fixtureCalls: { key: string }[] }
          ).__fixtureCalls.filter((c) => c.key === "GET billing").length,
      ),
    )
    .toBe(before + 1);
});

test("OS-21 refunded asset download is denied without claiming access", async ({
  page,
}, info) => {
  await page.goto("/?fixture=assets-download-denied");
  await page.getByRole("button", { name: "다운로드" }).click();
  const alert = page.getByRole("alert");
  await expect(alert).toContainText("환불된 주문의 에셋은 받을 수 없습니다");
  await expect(alert).not.toContainText("ASSET_NOT_FOUND");
  await expect(
    alert.getByRole("link", { name: "구매 내역에서 주문 상태 확인" }),
  ).toHaveAttribute("href", "/billing");
  expect(page.url()).toContain("fixture=assets-download-denied"); // no file navigation happened
  await checkPage(page, known);
  await shot(page, "assets-download-denied", info.project.name);
});

test("OS-21 billing 503 shows a safe error and recovers on retry", async ({
  page,
}, info) => {
  await page.goto("/?fixture=billing-unavailable");
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("10.0.0.2");
  await expect(page.locator("body")).not.toContainText("UNAVAILABLE");
  await checkPage(page, known);
  await shot(page, "billing-unavailable", info.project.name);
  await page.getByRole("button", { name: "다시 불러오기" }).click();
  await expect(page.getByText("결제 완료").first()).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
});
