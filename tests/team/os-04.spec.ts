// MOCK: billing fixture. license_snapshot in the API response is OWN-06 (OWNER_PENDING).
import { test, expect } from "@playwright/test";
import { checkPage, shooter } from "./check";

const shot = shooter("OS-04");

test("OS-04 order shows purchase-time terms; legacy order is not backfilled", async ({
  page,
}, info) => {
  await page.goto("/?fixture=billing-terms");
  const terms = page.getByText("주문 시점 이용 조건");
  await expect(terms).toHaveCount(2); // only the two marketplace orders, not credits
  await terms.first().focus();
  await page.keyboard.press("Enter");
  const recorded = page.locator("details.order-terms").first();
  await expect(recorded).toContainText("원목 의자");
  await expect(recorded).toContainText("CC BY 4.0");
  await expect(recorded).toContainText("원본 · 확인값 9f2c4e7a1b3d");

  await terms.nth(1).click();
  const legacy = page.locator("details.order-terms").nth(1);
  await expect(legacy).toContainText("기록을 확인하고 있습니다");
  for (const current of ["CC BY 4.0", "CC0", "일반 이용"])
    await expect(legacy).not.toContainText(current);
  await checkPage(page);
  await shot(page, "billing-terms", info.project.name);
});

test("OS-04 billing lookup error shows only the error and a retry", async ({
  page,
}, info) => {
  await page.goto("/?fixture=billing-error");
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("other@x.test");
  await expect(page.locator("body")).not.toContainText("22222222");
  await expect(page.getByText("주문과 환불 검토")).toHaveCount(0);
  await expect(page.getByText("정산 가능 잔액")).toHaveCount(0);
  await checkPage(page);
  await shot(page, "billing-error", info.project.name);

  await page.getByRole("button", { name: "다시 불러오기" }).click();
  await expect(page.getByText("주문과 환불 검토")).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
});
