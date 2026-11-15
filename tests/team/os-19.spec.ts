// MOCK: public demo GLB in the fixture shell. Camera hook = canvas data-camera "x,y,z|distance".
import { test, expect, type Page } from "@playwright/test";
import { checkPage, shooter } from "./check";

const YAW = 0.2;
const expected = {
  "앞": [Math.sin(YAW), 0, Math.cos(YAW)],
  "오른쪽": [Math.cos(YAW), 0, -Math.sin(YAW)],
  "뒤": [-Math.sin(YAW), 0, -Math.cos(YAW)],
  "왼쪽": [-Math.cos(YAW), 0, Math.sin(YAW)],
} as const;
const shot = shooter("OS-19");
async function cam(page: Page) {
  const raw = (await page.locator("canvas").getAttribute("data-camera")) ?? "0,0,0|0";
  const [dir, dist] = raw.split("|");
  return { dir: dir.split(",").map(Number), dist: Number(dist) };
}
const near = (a: number[], b: readonly number[], tol = 0.03) => a.every((v, i) => Math.abs(v - b[i]) <= tol);

test("OS-19 view presets move the camera to the matching file axis", async ({ page }, info) => {
  await page.goto("/?fixture=viewer-model");
  await expect(page.locator('canvas[data-model-loaded="true"]')).toBeVisible({ timeout: 30000 });
  const group = page.getByRole("group", { name: "보기 방향" });
  await expect(group.getByRole("button", { name: "앞에서 보기" })).toBeEnabled();

  for (const [label, dir] of Object.entries(expected)) {
    const button = group.getByRole("button", { name: `${label}에서 보기` });
    if (label === "오른쪽") {
      await button.focus();
      await page.keyboard.press("Enter"); // keyboard path
    } else await button.click();
    await expect.poll(async () => near((await cam(page)).dir, dir), { timeout: 5000 }).toBe(true);
  }
  await checkPage(page);
  await shot(page, "viewer-left", info.project.name);
});

test("OS-19 fit brings an over-zoomed camera back to the whole model", async ({ page }, info) => {
  await page.goto("/?fixture=viewer-model");
  await expect(page.locator('canvas[data-model-loaded="true"]')).toBeVisible({ timeout: 30000 });
  const group = page.getByRole("group", { name: "보기 방향" });
  await group.getByRole("button", { name: "앞에서 보기" }).click();
  await expect.poll(async () => near((await cam(page)).dir, expected["앞"])).toBe(true);
  await page.waitForTimeout(1200); // let the Bounds animation settle
  const fitDist = (await cam(page)).dist;

  const box = (await page.locator("canvas").boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  for (let i = 0; i < 15; i++) await page.mouse.wheel(0, -400);
  await expect.poll(async () => (await cam(page)).dist).toBeLessThan(fitDist * 0.6);
  await shot(page, "viewer-zoomed", info.project.name);

  await group.getByRole("button", { name: "화면 맞춤" }).click();
  await expect.poll(async () => Math.abs((await cam(page)).dist - fitDist) / fitDist, { timeout: 5000 }).toBeLessThan(0.1);
  await shot(page, "viewer-fit", info.project.name);
});

test("OS-19 load failure is explained and view tools stay disabled", async ({ page }, info) => {
  await page.goto("/?fixture=viewer-broken");
  await expect(page.getByText("3D 파일을 불러오지 못했습니다.")).toBeVisible({ timeout: 30000 });
  const group = page.getByRole("group", { name: "보기 방향" });
  for (const name of ["앞에서 보기", "뒤에서 보기", "왼쪽에서 보기", "오른쪽에서 보기", "화면 맞춤"])
    await expect(group.getByRole("button", { name })).toBeDisabled();
  await expect(page.getByRole("button", { name: "미리보기 스크린샷" })).toBeDisabled();
  await checkPage(page);
  await shot(page, "viewer-broken", info.project.name);
});
