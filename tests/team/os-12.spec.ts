// MOCK: fixture shell only. Passing here is TEAM_PASS, never real-service proof.
import { test, expect } from "@playwright/test";
import { checkPage, shooter } from "./check";

const shot = shooter("OS-12");

test("OS-12 job fixture: failed state, keyboard retry reaches queue", async ({
  page,
}, info) => {
  await page.goto("/?fixture=job-failed-retry");
  await expect(page.getByRole("heading", { name: "실패" })).toBeVisible();
  await expect(
    page.getByText("처리에 사용할 사진을 확인해 주세요."),
  ).toBeVisible();
  await checkPage(page);
  await shot(page, "job-failed", info.project.name);

  const retry = page.getByRole("button", { name: "같은 입력으로 재시도" });
  for (
    let i = 0;
    i < 10 && !(await retry.evaluate((el) => el === document.activeElement));
    i++
  )
    await page.keyboard.press("Tab");
  await expect(retry).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "대기 중" })).toBeVisible();
  await shot(page, "job-retried", info.project.name);
  const calls = await page.evaluate(() =>
    (
      window as unknown as { __fixtureCalls: { key: string }[] }
    ).__fixtureCalls.map((c) => c.key),
  );
  expect(calls).toContain("POST jobs/fixture-job/retry");
});

test("OS-12 order fixture: provider error hidden, same order re-confirms", async ({
  page,
}, info) => {
  await page.goto(
    "/?fixture=payment-error-retry&paymentKey=fixture-only&orderId=00000000-0000-4000-8000-000000000001&amount=1000",
  );
  await expect(page.getByRole("status")).toContainText(
    "결제사 연결을 확인하지 못했습니다",
  );
  await expect(page.locator("body")).not.toContainText("10.0.0.1");
  await checkPage(page);
  await shot(page, "order-error", info.project.name);

  const again = page.getByRole("button", { name: "결제 상태 다시 확인" });
  await again.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "결제 확인 완료", exact: true }),
  ).toBeVisible();
  await shot(page, "order-confirmed", info.project.name);
  const bodies = await page.evaluate(() =>
    (
      window as unknown as { __fixtureCalls: { body: unknown }[] }
    ).__fixtureCalls.map((c) => c.body),
  );
  expect(bodies).toHaveLength(2);
  expect(bodies[0]).toEqual(bodies[1]);
});

test("OS-12 unknown API route fails loudly instead of passing", async ({
  page,
}) => {
  await page.goto("/?fixture=job-failed-retry");
  const status = await page.evaluate(
    async () => (await fetch("/api/not-a-fixture")).status,
  );
  expect(status).toBe(404);
});
