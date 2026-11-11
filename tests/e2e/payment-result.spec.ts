// UI contract only: mocked responses do not establish provider payment success.
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("payment callback never trusts URL success and retries the same order after a provider error", async ({
  page,
}) => {
  const payloads: unknown[] = [];
  await page.route("**/api/payments/confirm", async (route) => {
    payloads.push(route.request().postDataJSON());
    await route.fulfill({
      status: payloads.length === 1 ? 502 : 200,
      json:
        payloads.length === 1
          ? {
              code: "PROCESSOR_ERROR",
              error: "허용되지 않은 요청 IP 34.239.116.6",
            }
          : { status: "paid" },
    });
  });
  await page.goto("/payments/success");
  await expect(page.getByRole("status")).toContainText(
    "유효하지 않은 결제 응답",
  );
  expect(payloads).toHaveLength(0);
  await page.goto(
    "/payments/success?paymentKey=ui-contract-only&orderId=00000000-0000-4000-8000-000000000001&amount=1000",
  );
  await expect(page.getByRole("status")).toContainText(
    "결제사 연결을 확인하지 못했습니다",
  );
  await expect(page.locator("body")).not.toContainText("34.239.116.6");
  await expect(
    page.getByRole("heading", { name: "결제 확인 완료", exact: true }),
  ).toHaveCount(0);
  await page.screenshot({
    path: "artifacts/launch-v5/payment-result-error-1440.png",
    fullPage: true,
  });
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "결제 상태 다시 확인" }).click();
  await expect(
    page.getByRole("heading", { name: "결제 확인 완료", exact: true }),
  ).toBeVisible();
  expect(payloads).toHaveLength(2);
  expect(payloads[0]).toEqual(payloads[1]);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.screenshot({
    path: "artifacts/launch-v5/payment-result-ui-360.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
