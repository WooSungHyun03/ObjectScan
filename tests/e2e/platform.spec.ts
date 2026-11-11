import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
if (existsSync(".env.test.local")) process.loadEnvFile(".env.test.local");
test("landing, pricing, real viewer controls and responsive navigation", async ({
  page,
  baseURL,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "사진을 올리고,",
  );
  await expect(
    page.getByRole("link", { name: /원하는 물체만 3D로 만들기/ }),
  ).toBeVisible();
  await expect(page.locator('img[src*="wave.webp"]')).toBeVisible();
  await page.screenshot({
    path: "artifacts/landing-desktop.png",
    fullPage: true,
  });
  await page.goto("/demo");
  await expect(page.locator('canvas[data-model-loaded="true"]')).toBeVisible();
  await page.getByRole("button", { name: /와이어프레임/ }).click();
  await page.goto("/pricing");
  await expect(page.getByText("181–200장", { exact: false })).toBeVisible();
  await page.setViewportSize({ width: 360, height: 800 });
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
  await expect(page.locator('img[src*="wave.webp"]')).toBeVisible();
  await page.screenshot({
    path: "artifacts/landing-mobile.png",
    fullPage: true,
  });
});
test("verified login, private project, real signed upload, object/scene separation and logout", async ({
  page,
  baseURL,
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
    await page.goto("/create");
    const draftImage = await sharp({
      create: { width: 80, height: 60, channels: 3, background: "#bdac92" },
    })
      .jpeg()
      .toBuffer();
    await page.locator("input[type=file]").setInputFiles({
      name: "before-login.jpg",
      mimeType: "image/jpeg",
      buffer: draftImage,
    });
    await page
      .getByRole("button", { name: "선택한 사진으로 계속하기" })
      .click();
    await expect(page).toHaveURL(/login/);
    await page.getByRole("textbox", { name: "이메일" }).fill(email);
    await page.getByLabel("비밀번호", { exact: true }).fill(password);
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await expect(page).toHaveURL(/create\/object/);
    await expect(
      page.getByText("앞에서 선택한 사진 1장이 준비되어 있습니다."),
    ).toBeVisible();
    // A disposable order fixture tests review/authorization only. No provider payment is made.
    if (process.env.TEST_EDUCATION_MODE === "true") {
      await page.goto("/billing");
      await expect(
        page.getByRole("heading", { name: "이용 안내" }),
      ).toBeVisible();
      await expect(page.getByLabel("출금 요청 금액")).not.toBeVisible();
      for (const route of ["orders", "payouts"]) {
        const response = await page.request.post(`/api/${route}`, {
          headers: { origin: baseURL! },
          data: {},
        });
        expect(response.status()).toBe(403);
        expect((await response.json()).code).toBe("NONCOMMERCIAL_ONLY");
      }
    } else {
      const orderId = randomUUID();
      const fixtureProject = randomUUID();
      const { error: fixtureError } = await admin.from("projects").insert({
        id: fixtureProject,
        owner_id: data.user!.id,
        name: "Refund review fixture",
        mode: "object",
      });
      if (fixtureError) throw fixtureError;
      const { error: orderError } = await admin.from("orders").insert({
        id: orderId,
        buyer_id: data.user!.id,
        kind: "generation",
        project_id: fixtureProject,
        project_revision: 0,
        image_count: 1,
        mode: "object",
        amount: 1000,
        status: "paid",
        idempotency_key: randomUUID(),
      });
      if (orderError) throw orderError;
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto("/billing");
      await page.getByLabel("환불 검토할 주문").selectOption(orderId);
      await page
        .getByLabel("환불 요청 사유")
        .fill("브라우저 테스트 환불 검토 사유");
      await page
        .getByRole("button", { name: "환불 검토 요청", exact: true })
        .click();
      await expect(page.getByRole("status")).toContainText(
        "환불 검토 요청을 접수했습니다",
      );
      expect(
        (
          await page.request.post(
            `/api/orders/${randomUUID()}/refund-request`,
            {
              headers: { origin: baseURL! },
              data: { reason: "다른 주문 접근 시도" },
            },
          )
        ).status(),
      ).toBe(404);
      expect(
        (
          await page.request.post("/api/admin/refund", {
            headers: { origin: baseURL! },
            data: { order_id: orderId, reason: "비관리자 환불 시도" },
          })
        ).status(),
      ).toBe(404);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await admin.from("orders").delete().eq("id", orderId);
      await admin.from("projects").delete().eq("id", fixtureProject);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/create");
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
    await page
      .getByRole("button", { name: "선택한 사진으로 계속하기" })
      .click();
    await expect(
      page.getByText("앞에서 선택한 사진 1장이 준비되어 있습니다."),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "선택한 사진 업로드", exact: true })
      .click();
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
    await expect(page).toHaveURL(`${baseURL}/`);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  } finally {
    // Disposable test data only. Orders and GPU outputs are never created by this test.
    const uid = data.user!.id;
    await admin.from("audit_logs").delete().eq("actor_id", uid);
    await admin.from("orders").delete().eq("buyer_id", uid);
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
    const { error: deleteError } = await admin.auth.admin.deleteUser(uid);
    if (deleteError) throw deleteError;
  }
});
