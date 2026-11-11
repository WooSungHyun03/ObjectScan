// Read-only release checks. BASE_URL may target a local or publicly accessible school deployment.
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const origin = new URL(process.env.BASE_URL ?? "http://127.0.0.1:3000").origin;
const browser = await chromium.launch({
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  for (const path of [
    "/",
    "/docs",
    "/create",
    "/terms",
    "/privacy",
    "/legal/opensource",
    "/demo/edit",
    "/pricing",
    "/marketplace",
    "/login",
    "/signup",
    "/demo",
    "/reset-password",
  ]) {
    const response = await context.request.get(origin + path);
    assert.equal(response.status(), 200, `Public route ${path}`);
    assert.equal(
      new URL(response.url()).origin,
      origin,
      `Unexpected external redirect for ${path}`,
    );
  }
  const page = await context.newPage();
  await page.goto(origin);
  await page.getByRole("complementary", { name: "운영 목적" }).waitFor();
  await page.locator('img[src*="wave.webp"]').waitFor();
  assert.match(await page.title(), /ObjectScan/);
  await mkdir("artifacts", { recursive: true });
  await page.screenshot({
    path: "artifacts/education-public-desktop.png",
    fullPage: true,
  });
  await page.goto(origin + "/pricing");
  await page
    .getByRole("heading", { name: "사진으로 배우는 3D 재구성." })
    .waitFor();
  assert.equal(await page.getByText("과금 없음", { exact: true }).count(), 10);
  assert.equal(
    await page.getByRole("heading", { name: "마켓 수수료" }).count(),
    0,
  );
  await page.goto(origin + "/docs#research");
  await page.getByRole("heading", { name: "학교 교육·연구용 운영" }).waitFor();
  assert.doesNotMatch(
    await page.locator("main").innerText(),
    /Pixal3D|SAM2|Gaussian Wrapping|COLMAP/i,
  );
  await page.goto(origin + "/legal/opensource");
  await page
    .getByRole("heading", { name: "오픈소스 및 콘텐츠 고지" })
    .waitFor();
  await page.goto(origin + "/demo");
  await page
    .locator('canvas[data-model-loaded="true"]')
    .waitFor({ timeout: 90000 });
  const health = await context.request.get(origin + "/api/health");
  assert.equal(health.status(), 200);
  const h = await health.json();
  assert.equal(h.payments_mode, "disabled");
  assert.equal(h.payouts_enabled, false);
  const privateResponse = await context.request.get(origin + "/api/projects");
  assert.equal(privateResponse.status(), 401);
  const webhook = await context.request.post(origin + "/api/payments/webhook", {
    data: {},
  });
  assert.equal(webhook.status(), 503);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(origin);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.getByRole("button", { name: "메뉴 열기" }).click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  await page.locator('img[src*="wave.webp"]').waitFor();
  await page.screenshot({
    path: "artifacts/education-public-mobile.png",
    fullPage: true,
  });
  console.log(
    "PASS public school banner, attribution, disabled finance, anonymous boundary, actual demo viewer and 360px navigation",
  );
} finally {
  await browser.close();
}
