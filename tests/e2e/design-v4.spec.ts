import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
test("v5 public design: real preview states, anonymous upload entry, responsive and axe audit", async ({
  page,
}) => {
  test.setTimeout(180000);
  await mkdir("artifacts/launch-v5", { recursive: true });
  const audit = [];
  for (const width of [1440, 1280, 768, 390, 360]) {
    await page.setViewportSize({
      width,
      height: width < 500 ? 844 : width === 768 ? 1024 : 900,
    });
    for (const route of [
      "/",
      "/create",
      "/marketplace",
      "/pricing",
      "/login",
    ]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("main")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} ${width}`,
      ).toBe(true);
      await page.screenshot({
        path: `artifacts/launch-v5/final-${route === "/" ? "home" : route.slice(1)}-${width}.png`,
        fullPage: true,
      });
      if (width === 1440 || width === 390) {
        const r = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        audit.push({ route, width, violations: r.violations });
      }
    }
  }
  await writeFile(
    "artifacts/launch-v5/axe.json",
    JSON.stringify(audit, null, 2),
  );
  expect(
    audit.flatMap((x) =>
      x.violations.map((v) => ({
        route: x.route,
        width: x.width,
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    ),
  ).toEqual([]);
  await page.goto("/");
  await page.getByRole("button", { name: "구조 보기", exact: true }).click();
  await expect(page.locator('img[src*="shoe-wire"]')).toBeVisible();
  await page.getByRole("button", { name: "질감 보기", exact: true }).click();
  await expect(
    page.locator('.result-preview img[src*="shoe-render"]'),
  ).toBeVisible();
  await page.goto("/create");
  await page.locator("input[type=file]").setInputFiles({
    name: "unsupported.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from("<svg/>"),
  });
  await expect(page.locator("main").getByRole("alert")).toContainText("JPG");
  await page.getByRole("button", { name: /공간 전체 만들기/ }).click();
  await expect(
    page.getByRole("button", { name: /공간 전체 만들기/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "사진 없이 제작 과정 살펴보기" })
    .click();
  await expect(page).toHaveURL(/login.*create/);
});
