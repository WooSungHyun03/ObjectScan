import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const forbidden =
  /Pixal3D|SAM2|Object[- ]Aware Loss|Gaussian Wrapping|COLMAP|TSDF|2DGS/i;
test("mascot routes, Korean customer copy and 360/390/768/1440 visual coverage", async ({
  page,
}) => {
  test.setTimeout(120000);
  await mkdir("artifacts/mascot-redesign", { recursive: true });
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({
      width,
      height: width > 1000 ? 900 : width === 768 ? 1024 : 844,
    });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "사진 속 대상을",
    );
    const mascot = page.locator('img[src*="wave.webp"]');
    await expect(mascot).toBeVisible();
    await expect
      .poll(() =>
        mascot.evaluate(
          (img) =>
            img instanceof HTMLImageElement &&
            img.complete &&
            img.naturalWidth > 0,
        ),
      )
      .toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `artifacts/mascot-redesign/home-${width}.png`,
      fullPage: true,
    });
  }
  for (const route of [
    "/",
    "/create",
    "/pricing",
    "/docs",
    "/marketplace",
    "/login",
    "/signup",
    "/terms",
    "/privacy",
    "/demo/edit",
  ]) {
    await page.goto(route);
    await expect(page.getByRole("main")).toBeVisible();
    expect(await page.locator("body").innerText(), route).not.toMatch(
      forbidden,
    );
  }
  await page.goto("/create");
  await page.getByRole("link", { name: /원하는 물체만 3D로 만들기/ }).click();
  await expect(page).toHaveURL(/login/);
  await page.goto("/create/scene");
  await expect(page).toHaveURL(/login/);
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "본문으로 건너뛰기" }),
  ).toBeFocused();
});
