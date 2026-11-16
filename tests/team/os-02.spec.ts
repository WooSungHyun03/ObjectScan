// MOCK: scripted auth adapter. Passing here is TEAM_PASS; real SMTP/link validity is OWN-01.
import { test, expect, type Page } from "@playwright/test";
import { checkPage, shooter } from "./check";

const shot = shooter("OS-02");
const authCalls = (page: Page) =>
  page.evaluate(
    () =>
      (
        window as unknown as {
          __authCalls: { method: string; args: unknown }[];
        }
      ).__authCalls,
  );

test("OS-02 unconfirmed signup waits, blocks the workspace and rate-limits resend", async ({
  page,
}, info) => {
  await page.clock.install();
  await page.goto("/?fixture=signup-unconfirmed");
  await page.getByRole("textbox", { name: "이름" }).fill("Fixture");
  await page
    .getByRole("textbox", { name: "이메일" })
    .fill("new@objectscan.test");
  await page.getByLabel("비밀번호", { exact: true }).fill("Fixture-pass-1");
  await page.getByRole("button", { name: "계정 만들기" }).press("Enter");

  await expect(page.getByRole("status")).toContainText("이메일의 확인 링크");
  await expect(
    page.getByText("확인을 마치기 전에는 작업실을 사용할 수 없습니다."),
  ).toBeVisible();
  await expect(
    page.getByText("60초 후 확인 메일을 다시 받을 수 있습니다."),
  ).toBeVisible();
  const resend = page.getByRole("button", { name: "확인 메일 다시 받기" });
  await expect(resend).toBeDisabled();
  expect(new URL(page.url()).pathname).toBe("/"); // no push to /dashboard
  await checkPage(page);
  await shot(page, "signup-waiting", info.project.name);

  await page.clock.runFor(60_000);
  await expect(resend).toBeEnabled();
  await resend.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText(
    "확인 메일을 다시 보냈습니다",
  );
  await expect(resend).toBeDisabled();
  const calls = await authCalls(page);
  expect(calls.filter((c) => c.method === "resend")).toHaveLength(1);
  expect(calls.find((c) => c.method === "resend")?.args).toMatchObject({
    type: "signup",
    email: "new@objectscan.test",
  });
});

test("OS-02 expired reset link points to a new link and keeps the email", async ({
  page,
}, info) => {
  // The user requested a reset earlier on this device; the email was remembered.
  await page.goto("/?fixture=forgot-link-expired&error=link_expired");
  await page
    .getByRole("textbox", { name: "이메일" })
    .fill("keep@objectscan.test");
  await page.getByRole("button", { name: "재설정 이메일 받기" }).click();
  await expect(page.getByRole("status")).toContainText("재설정 안내");

  await page.goto("/?fixture=reset-expired");
  await page.getByLabel("비밀번호", { exact: true }).fill("Fixture-pass-2");
  await page.getByRole("button", { name: "새 비밀번호 저장" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "재설정 링크가 만료되었거나",
  );
  await expect(page.locator("body")).not.toContainText("Auth session missing");
  await expect(
    page.getByRole("link", { name: "새 재설정 링크 받기" }),
  ).toHaveAttribute("href", "/forgot-password");
  await checkPage(page);
  await shot(page, "reset-expired", info.project.name);

  // Callback rejected link → forgot page explains and the email is still filled in.
  await page.goto("/?fixture=forgot-link-expired&error=link_expired");
  await expect(page.getByRole("alert")).toContainText("새 링크를 받아 주세요");
  await expect(page.getByRole("textbox", { name: "이메일" })).toHaveValue(
    "keep@objectscan.test",
  );
  await checkPage(page);
  await shot(page, "forgot-link-expired", info.project.name);
});

test("OS-02 login ignores an external next URL and goes to the dashboard", async ({
  page,
}) => {
  await page.goto("/?fixture=login-next&next=https://evil.test/steal");
  await page
    .getByRole("textbox", { name: "이메일" })
    .fill("user@objectscan.test");
  await page.getByLabel("비밀번호", { exact: true }).fill("Fixture-pass-3");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect.poll(() => new URL(page.url()).pathname).toBe("/dashboard");
  expect(page.url()).not.toContain("evil.test");
});

test("OS-02 login shows the callback's confirmation failure in Korean", async ({
  page,
}, info) => {
  await page.goto("/?fixture=login-next&error=confirmation_failed");
  await expect(page.getByRole("alert")).toContainText(
    "확인 링크가 만료되었거나 이미 사용되었습니다",
  );
  await checkPage(page);
  await shot(page, "login-confirmation-failed", info.project.name);
});
