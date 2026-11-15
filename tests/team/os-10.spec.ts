// MOCK: provider/confirm fixtures only. Real TEST payment, webhook and ledger checks are OWN-03 (OWNER_PENDING).
import { test, expect, type Page } from "@playwright/test";
import { checkPage, shooter } from "./check";

const shot = shooter("OS-10");
const q = "&paymentKey=fixture-only&orderId=00000000-0000-4000-8000-000000000001&amount=1000";
const calls = (page: Page, key: string) =>
  page.evaluate((k) => (window as never as { __fixtureCalls: { key: string; body: unknown }[] }).__fixtureCalls.filter((c) => c.key === k), key);
const doneHeading = (page: Page) => page.getByRole("heading", { name: "결제 확인 완료", exact: true });

test("OS-10 lost approval response: re-check reads the server state and completes once", async ({ page }, info) => {
  await page.goto(`/?fixture=payment-response-lost${q}`);
  await expect(page.getByRole("status")).toContainText("서비스에 연결하지 못했습니다");
  await expect(doneHeading(page)).toHaveCount(0);
  await checkPage(page);
  await shot(page, "response-lost", info.project.name);

  // Keyboard retry; while the request is in flight the button is locked.
  const again = page.getByRole("button", { name: "결제 상태 다시 확인" });
  await again.focus();
  await page.keyboard.press("Enter");
  const locked = page.getByRole("button", { name: "확인 중…" });
  await expect(locked).toBeDisabled();
  await locked.click({ force: true }).catch(() => {});
  await expect(doneHeading(page)).toHaveCount(1);
  await expect(page.getByRole("link", { name: "내 에셋 확인" })).toBeVisible();
  await expect(page.getByRole("button", { name: /다시 확인|확인 중/ })).toHaveCount(0);
  const sent = await calls(page, "POST payments/confirm");
  expect(sent).toHaveLength(2); // one lost + one re-check, never a third
  expect(sent[0].body).toEqual(sent[1].body);
  await shot(page, "response-recovered", info.project.name);
});

for (const [fixture, text] of [
  ["payment-amount-mismatch", "주문 금액을 확인하지 못해"],
  ["payment-expired", "주문 유효시간이 지났습니다"],
] as const)
  test(`OS-10 ${fixture}: no completion, no entitlement, order history only`, async ({ page }, info) => {
    await page.goto(`/?fixture=${fixture}${q}`);
    await expect(page.getByRole("status")).toContainText(text);
    await expect(page.locator("body")).not.toContainText("5000 != 1000");
    await expect(page.locator("body")).not.toContainText("ORDER_EXPIRED");
    await expect(doneHeading(page)).toHaveCount(0);
    await expect(page.getByRole("link", { name: "내 에셋 확인" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "결제 상태 다시 확인" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "주문 내역 확인" })).toHaveAttribute("href", "/billing");
    await checkPage(page);
    await shot(page, fixture, info.project.name);
  });

test("OS-10 refunded order is never shown as a successful purchase", async ({ page }, info) => {
  await page.goto(`/?fixture=payment-refunded${q}`);
  await expect(page.getByRole("heading", { name: "환불된 주문" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("구매 완료로 표시하지 않으며");
  await expect(doneHeading(page)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "내 에셋 확인" })).toHaveCount(0);
  await checkPage(page);
  await shot(page, "payment-refunded", info.project.name);
});

test("OS-10 purchase button ignores a second click while the order request is in flight", async ({ page }, info) => {
  await page.goto("/?fixture=checkout-double");
  const buy = page.getByRole("button", { name: "테스트 결제" });
  await expect(buy).toBeEnabled();
  // Two clicks in the same task, before any re-render could disable the button.
  await buy.evaluate((el: HTMLButtonElement) => {
    el.click();
    el.click();
  });
  await expect(page.getByRole("button", { name: "결제 페이지 여는 중…" })).toBeDisabled();
  await shot(page, "checkout-busy", info.project.name);
  await expect.poll(() => page.url()).toContain("/checkout/00000000-0000-4000-8000-000000000009");
  expect(await calls(page, "POST orders")).toHaveLength(1);
});
