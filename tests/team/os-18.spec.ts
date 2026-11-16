// MOCK: listings fixture. license/price filter the loaded page only (no API change).
import { test, expect, type Page } from "@playwright/test";
import { checkPage, shooter } from "./check";

const shot = shooter("OS-18");
const titles = (page: Page) =>
  page.locator(".listing-card h3").allTextContents();

test("OS-18 license and price filters narrow the loaded list", async ({
  page,
}, info) => {
  await page.goto("/fixture/market-list");
  await expect.poll(() => titles(page)).toHaveLength(4);
  await page.getByLabel("이용 조건", { exact: true }).selectOption("standard");
  expect(await titles(page)).toEqual(["원목 의자", "탁상 조명"]);
  await page.getByLabel("가격", { exact: true }).selectOption("under10k");
  expect(await titles(page)).toEqual(["원목 의자", "탁상 조명"]);
  await page.getByLabel("가격", { exact: true }).selectOption("free");
  expect(await titles(page)).toEqual([]);
  await expect(
    page.getByRole("heading", { name: "조건에 맞는 에셋이 없습니다." }),
  ).toBeVisible();
  await page.getByLabel("이용 조건", { exact: true }).selectOption("all");
  expect(await titles(page)).toEqual(["무료 화분"]);
  await expect(page.getByRole("status")).toContainText(
    "불러온 에셋 4개 중 1개",
  );
  await checkPage(page);
  await shot(page, "market-filtered", info.project.name);
});

test("OS-18 back from a detail page restores query, category, sort and filters", async ({
  page,
}) => {
  await page.goto("/fixture/market-list");
  await page.getByLabel("에셋 검색", { exact: true }).fill("조명");
  await page.getByRole("button", { name: "소품" }).click();
  await page.getByLabel("정렬", { exact: true }).selectOption("price");
  await page.getByLabel("이용 조건", { exact: true }).selectOption("standard");
  await expect.poll(() => titles(page)).toEqual(["탁상 조명"]);
  expect(new URL(page.url()).search).toBe(
    "?q=%EC%A1%B0%EB%AA%85&category=decor&sort=price&license=standard",
  );

  await page.getByRole("link", { name: /탁상 조명/ }).click();
  await expect(page).toHaveURL(/\/marketplace\/l-lamp$/);
  await page.goBack();
  await expect(page.getByLabel("에셋 검색", { exact: true })).toHaveValue(
    "조명",
  );
  await expect(page.getByRole("button", { name: "소품" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByLabel("정렬", { exact: true })).toHaveValue("price");
  await expect(page.getByLabel("이용 조건", { exact: true })).toHaveValue(
    "standard",
  );
  await expect.poll(() => titles(page)).toEqual(["탁상 조명"]);
});

test("OS-18 list failure is distinct from loading/empty; retry keeps the inputs", async ({
  page,
}, info) => {
  await page.goto(
    "/fixture/market-error?q=%EC%9D%98%EC%9E%90&license=standard",
  );
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("10.0.0.2");
  await expect(page.getByText("새로운 에셋을 기다리고 있어요.")).toHaveCount(0);
  await expect(page.locator(".project-skeleton")).toHaveCount(0);
  await checkPage(page);
  await shot(page, "market-error", info.project.name);

  await page.getByRole("button", { name: "다시 불러오기" }).click();
  await expect.poll(() => titles(page)).toEqual(["원목 의자"]);
  await expect(page.getByLabel("에셋 검색", { exact: true })).toHaveValue(
    "의자",
  );
  await expect(page.getByLabel("이용 조건", { exact: true })).toHaveValue(
    "standard",
  );
  await expect(page.getByRole("alert")).toHaveCount(0);
});
