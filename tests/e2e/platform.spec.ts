import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
if (existsSync(".env.test.local")) process.loadEnvFile(".env.test.local");
test("landing, pricing, real viewer controls and responsive navigation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "사진을 3D로",
  );
  await expect(
    page.getByRole("link", { name: /Object Mesh 객체만/ }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/landing-desktop.png",
    fullPage: true,
  });
  await page.goto("/demo");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: /와이어프레임/ }).click();
  await page.goto("/pricing");
  await expect(page.getByText("181–200장", { exact: false })).toBeVisible();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "메뉴 열기" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.screenshot({
    path: "artifacts/landing-mobile.png",
    fullPage: true,
  });
});
test("verified login, private project, real signed upload, object/scene separation and logout", async ({
  page,
}) => {
  test.skip(!process.env.TEST_SERVICE_KEY, "Needs isolated local Supabase");
  const admin = createClient(
      process.env.TEST_SUPABASE_URL!,
      process.env.TEST_SERVICE_KEY!,
      { auth: { persistSession: false } },
    ),
    email = `browser-${randomUUID()}@objectscan.test`,
    password = `Test-${randomUUID()}!`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  try {
    await page.goto("/login");
    await page.getByRole("textbox", { name: "이메일" }).fill(email);
    await page.getByLabel("비밀번호", { exact: true }).fill(password);
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await expect(page).toHaveURL(/dashboard/);
    await page.goto("/reconstruct/new?mode=object");
    const image = await sharp({
      create: { width: 80, height: 60, channels: 3, background: "#bdac92" },
    })
      .jpeg()
      .toBuffer();
    await page.locator("input[type=file]").setInputFiles({
      name: "fixture.jpg",
      mimeType: "image/jpeg",
      buffer: image,
    });
    await expect(page.getByText(/업로드 1장/)).toBeVisible();
    await expect(page.getByText("fixture.jpg", { exact: true })).toBeVisible();
    await page.screenshot({
      path: "artifacts/wizard-object.png",
      fullPage: true,
    });
    const projects = await page.request.get("/api/projects");
    expect(projects.ok()).toBe(true);
    const items = await projects.json();
    expect(items).toHaveLength(1);
    expect(items[0].input_image_count).toBe(1);
    const unknown = await page.request.get(`/api/projects/${randomUUID()}`);
    expect(unknown.status()).toBe(404);
    await page.goto("/reconstruct/new?mode=scene");
    await expect(
      page.getByRole("heading", {
        name: "공간을 담은 사진을 올려주세요.",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("객체 선택", { exact: true }),
    ).not.toBeVisible();
    await page.getByRole("button", { name: "로그아웃" }).click();
    await expect(page).toHaveURL("http://127.0.0.1:3000/");
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  } finally {
    // Disposable test data only. Orders and GPU outputs are never created by this test.
    const uid = data.user!.id;
    const { data: projects } = await admin
      .from("projects")
      .select("id")
      .eq("owner_id", uid);
    for (const p of projects ?? []) {
      const { data: images } = await admin
        .from("project_images")
        .select("original_path,normalized_path")
        .eq("project_id", p.id);
      const keys = (images ?? [])
        .flatMap((i) => [i.original_path, i.normalized_path])
        .filter(Boolean);
      if (keys.length) await admin.storage.from("project-files").remove(keys);
      await admin.storage.from("original-uploads").remove(keys);
      await admin.from("project_images").delete().eq("project_id", p.id);
      await admin.from("projects").delete().eq("id", p.id);
    }
    await admin.auth.admin.deleteUser(uid);
  }
});
