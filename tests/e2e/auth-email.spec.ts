import { test, expect, type APIRequestContext } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
if (existsSync(".env.test.local")) process.loadEnvFile(".env.test.local");
async function verificationLink(
  request: APIRequestContext,
  email: string,
  subject: RegExp,
) {
  let messageId = "";
  await expect
    .poll(
      async () => {
        const list = await (
          await request.get("http://127.0.0.1:56324/api/v1/messages")
        ).json();
        const message = list.messages.find(
          (m: { ID: string; Subject: string; To: { Address: string }[] }) =>
            m.To.some((t) => t.Address === email) && subject.test(m.Subject),
        );
        messageId = message?.ID ?? "";
        return Boolean(messageId);
      },
      { timeout: 20000 },
    )
    .toBe(true);
  const message = await (
    await request.get(`http://127.0.0.1:56324/api/v1/message/${messageId}`)
  ).json();
  const link = String(message.HTML)
    .match(/href="([^"]*\/auth\/v1\/verify[^"]*)"/)?.[1]
    .replaceAll("&amp;", "&");
  if (!link || new URL(link).origin !== "http://127.0.0.1:56321")
    throw Error("Local verification link missing");
  return link;
}
test("signup requires email confirmation; recovery email changes only the disposable fixture password", async ({
  page,
  request,
}) => {
  test.skip(
    !process.env.TEST_SERVICE_KEY,
    "Local email integration requires isolated Supabase",
  );
  const admin = createClient(
      process.env.TEST_SUPABASE_URL!,
      process.env.TEST_SERVICE_KEY!,
      { auth: { persistSession: false } },
    ),
    email = `email-${randomUUID()}@objectscan.test`,
    password = `Before-${randomUUID()}!`,
    replacement = `After-${randomUUID()}!`;
  try {
    await page.goto("/signup");
    await page
      .getByRole("textbox", { name: "이름", exact: true })
      .fill("Email fixture");
    await page.getByRole("textbox", { name: "이메일" }).fill(email);
    await page.getByLabel("비밀번호", { exact: true }).fill(password);
    await page.getByRole("button", { name: "계정 만들기" }).click();
    await expect(page.getByRole("status")).toContainText("이메일의 확인 링크");
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
    await page.goto(await verificationLink(request, email, /confirm/i));
    await expect(page).toHaveURL(/dashboard/);
    await page.getByRole("button", { name: "로그아웃" }).click();
    await expect(page).toHaveURL("http://127.0.0.1:3000/");
    await page.goto("/forgot-password");
    await page.getByRole("textbox", { name: "이메일" }).fill(email);
    await page.getByRole("button", { name: "재설정 이메일 받기" }).click();
    await expect(page.getByRole("status")).toContainText("재설정 안내");
    await page.goto(await verificationLink(request, email, /reset/i));
    await expect(page).toHaveURL(/reset-password/);
    await page.getByLabel("비밀번호", { exact: true }).fill(replacement);
    await page.getByRole("button", { name: "새 비밀번호 저장" }).click();
    await expect(page).toHaveURL(/dashboard/);
    await page.getByRole("button", { name: "로그아웃" }).click();
    await expect(page).toHaveURL("http://127.0.0.1:3000/");
    await page.goto("/login");
    await page.getByRole("textbox", { name: "이메일" }).fill(email);
    await page.getByLabel("비밀번호", { exact: true }).fill(replacement);
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await expect(page).toHaveURL(/dashboard/);
  } finally {
    const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const user = data.users.find((u) => u.email === email);
    if (user) await admin.auth.admin.deleteUser(user.id);
  }
});
