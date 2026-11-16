// MOCK: the real ReconstructionWizard over fixture projects/:id, masks and images routes (existing API only).
// Note: the server answers a stale-revision approval with 404 MASK_NOT_FOUND, not 409; the fixture mirrors that.
import { test, expect, type Page } from "@playwright/test";
import { checkPage, shooter } from "./check";

const shot = shooter("OS-08");
const calls = (page: Page) =>
  page.evaluate(() =>
    (
      window as never as { __fixtureCalls: { key: string }[] }
    ).__fixtureCalls.map((c) => c.key),
  );
async function openMaskStep(page: Page, fixture: string) {
  await page.goto(`/?fixture=${fixture}`);
  await expect(
    page.getByText("MOCK 운동화").or(page.locator(".photo-grid-heading")),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "제작 단계" })
    .getByRole("button", { name: /물체 선택/ })
    .click();
}

test("OS-08 mask request 503 returns to reselection without re-uploading", async ({
  page,
}, info) => {
  await openMaskStep(page, "mask-analysis-503");
  await page.getByRole("button", { name: "선택 영역 분석" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "GPU 작업자 연결을 준비하고 있습니다.",
  );
  const again = page.getByRole("button", { name: "선택 다시 하기" });
  await again.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "박스" })).toBeFocused();
  await expect(page.locator(".target-overlay")).toBeVisible(); // saved selection kept
  await expect(page.locator(".reference-strip button")).toHaveCount(3); // photos kept
  expect((await calls(page)).filter((k) => k.includes("upload"))).toEqual([]);
  await checkPage(page);
  await shot(page, "mask-503", info.project.name);
});

test("OS-08 failed photo link, keyboard approval and exclusion keep focus and announce state", async ({
  page,
}, info) => {
  await openMaskStep(page, "mask-partial");
  await expect(page.getByText("마스크를 만들지 못한 사진 1장")).toBeVisible();
  await page
    .getByRole("button", { name: "c.webp 기준으로 다시 선택" })
    .press("Enter");
  await expect(page.getByText("기준 사진: c.webp")).toBeVisible();
  await expect(page.getByRole("button", { name: "박스" })).toBeFocused();
  await checkPage(page);
  await shot(page, "mask-partial", info.project.name);

  const approve = page.getByRole("button", { name: "a.webp 마스크 승인" });
  await approve.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText(
    "a.webp 마스크 승인했습니다.",
  );
  await expect(approve).toHaveAttribute("aria-pressed", "true");
  await expect(approve).toBeFocused(); // focus survives the busy-disabled re-render

  await page.getByRole("button", { name: "b.webp 사진 제외" }).press("Enter");
  await expect(
    page.getByRole("heading", { name: "사진별 마스크 검토" }),
  ).toBeFocused();
  await expect(
    page.getByRole("button", { name: "b.webp 마스크 승인" }),
  ).toHaveCount(0);

  await page.getByRole("button", { name: "a.webp 크게 보기" }).press("Enter");
  await expect(
    page.getByRole("button", { name: "a.webp 크게 보기" }),
  ).toHaveAttribute("aria-pressed", "true");
  await checkPage(page);
  await shot(page, "mask-approved", info.project.name);
});

test("OS-08 stale approval is not shown as done and asks for re-review", async ({
  page,
}, info) => {
  await openMaskStep(page, "mask-stale-approval");
  const a = page.getByRole("button", { name: "a.webp 마스크 승인" });
  await expect(a).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "b.webp 마스크 승인" }).click();
  const alert = page.getByRole("alert");
  await expect(alert).toContainText("이전 승인은 적용되지 않습니다");
  await expect(alert).not.toContainText("MASK_NOT_FOUND");
  await expect(a).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("button", { name: /다음 단계/ })).toBeDisabled();
  await checkPage(page);
  await shot(page, "mask-stale", info.project.name);
});

test("OS-08 another user's project shows not-found without details", async ({
  page,
}, info) => {
  await page.goto("/?fixture=project-other-404");
  await expect(page.getByRole("alert").first()).toContainText(
    "프로젝트를 찾을 수 없습니다.",
  );
  const text = await page.locator("body").innerText();
  expect(text).not.toContain("p-other-owner");
  expect(text).not.toContain("PROJECT_NOT_FOUND");
  await expect(page.locator(".image-grid")).toHaveCount(0);
  await checkPage(page);
  await shot(page, "project-404", info.project.name);
});
