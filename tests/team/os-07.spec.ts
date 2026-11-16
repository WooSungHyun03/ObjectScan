// MOCK: draft list only. Diagnostics values are a fixture; the server field is OWN-04 (OWNER_PENDING)
// and the wizard hookup for uploaded photos waits for OS-01.
import { test, expect, type Page } from "@playwright/test";
import { checkPage, shooter } from "./check";

const shot = shooter("OS-07");
const names = (page: Page) =>
  page
    .locator(".draft-photos li > span")
    .evaluateAll((els) =>
      els.map(
        (el) =>
          el.firstChild!.textContent! +
          el.childNodes[1].textContent! +
          el.childNodes[2].textContent!,
      ),
    );
const uploaded = (page: Page) =>
  page.evaluate(
    () => (window as never as { __uploaded?: string[] }).__uploaded,
  );

test("OS-07 duplicate, blurry and unchecked photos get distinct advice and the user may still proceed", async ({
  page,
}, info) => {
  await page.goto("/?fixture=draft-diagnostics");
  const row = (n: number) => page.locator(`.draft-photos [data-row="${n}"]`);
  await expect(row(0).locator("small")).toHaveCount(0);
  await expect(row(1).locator("small")).toHaveCount(0);
  await expect(row(2).locator("small")).toHaveAttribute(
    "data-warning",
    "blurry",
  );
  await expect(row(3).locator("small")).toHaveAttribute(
    "data-warning",
    "duplicate",
  );
  // A photo that could not be checked stays selected.
  await expect(row(4)).toContainText("broken.jpg");
  await expect(row(4).locator("small")).toContainText("확인하지 못했습니다");
  await expect(
    page.getByText("안내가 있어도 그대로 업로드할 수 있습니다"),
  ).toBeVisible();
  await checkPage(page);
  await shot(page, "draft-diagnostics", info.project.name);

  await page.getByRole("button", { name: "선택한 사진 5장 업로드" }).click();
  expect(await uploaded(page)).toEqual([
    "front.jpg",
    "side.jpg",
    "blurry.jpg",
    "front-copy.jpg",
    "broken.jpg",
  ]);
});

test("OS-07 keyboard reorder and exclude match what is uploaded", async ({
  page,
}, info) => {
  await page.goto("/?fixture=draft-reorder");
  await expect(page.getByText("초점이 맞고 서로 겹치는 사진")).toBeVisible(); // no diagnostics → static guide
  await expect(
    page.getByRole("button", { name: "a.jpg 위로 이동" }),
  ).toBeDisabled();

  const down = page.getByRole("button", { name: "a.jpg 아래로 이동" });
  for (
    let i = 0;
    i < 10 && !(await down.evaluate((el) => el === document.activeElement));
    i++
  )
    await page.keyboard.press("Tab");
  await expect(down).toBeFocused();
  await page.keyboard.press("Enter");
  expect(await names(page)).toEqual(["1. b.jpg", "2. a.jpg", "3. c.jpg"]);
  await expect(down).toBeFocused(); // focus follows the moved photo
  await expect(page.getByRole("status")).toContainText(
    "a.jpg: 2번째로 옮겼습니다.",
  );
  await page.keyboard.press("Enter");
  expect(await names(page)).toEqual(["1. b.jpg", "2. c.jpg", "3. a.jpg"]);
  // At the end "아래로" is disabled, so focus lands on another control of the same photo.
  await expect(
    page.locator('.draft-photos [data-row="2"] button:focus'),
  ).toHaveCount(1);
  await checkPage(page);
  await shot(page, "draft-reordered", info.project.name);

  const exclude = page.getByRole("button", { name: "c.jpg 제외" });
  await exclude.focus();
  await page.keyboard.press("Enter");
  expect(await names(page)).toEqual(["1. b.jpg", "2. a.jpg"]);
  await expect(page.getByRole("status")).toContainText("남은 사진 2장");
  await expect(page.getByRole("button", { name: "a.jpg 제외" })).toBeFocused();
  await shot(page, "draft-excluded", info.project.name);

  await page
    .getByRole("button", { name: "선택한 사진 2장 업로드" })
    .press("Enter");
  expect(await uploaded(page)).toEqual(["b.jpg", "a.jpg"]);
  await expect(page.locator(".draft-photos")).toHaveCount(0);
});

test("OS-07 upload could not start: private files stay selected for retry", async ({
  page,
}) => {
  await page.goto("/?fixture=draft-upload-failure");
  const upload = page.getByRole("button", { name: "선택한 사진 1장 업로드" });
  await upload.click();
  await expect(page.getByRole("status")).toContainText("선택한 사진을 유지");
  await expect(page.locator(".draft-photos")).toContainText("keep.jpg");
  await upload.click();
  await expect(page.locator(".draft-photos")).toHaveCount(0);
});
