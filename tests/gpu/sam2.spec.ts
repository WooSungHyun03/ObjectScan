import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
process.loadEnvFile(".env.test.local");
if (new URL(process.env.TEST_SUPABASE_URL!).hostname !== "127.0.0.1")
  throw Error("Local GPU integration only");
test("browser → selection → queue → actual SAM2 CUDA → validated private mask → human review", async ({
  page,
}) => {
  const admin = createClient(
      process.env.TEST_SUPABASE_URL!,
      process.env.TEST_SERVICE_KEY!,
      { auth: { persistSession: false } },
    ),
    email = `gpu-${randomUUID()}@objectscan.test`,
    password = `Gpu-${randomUUID()}!`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  const uid = data.user!.id;
  let pid = "";
  try {
    await page.goto("/login");
    await page.getByRole("textbox", { name: "이메일" }).fill(email);
    await page.getByLabel("비밀번호", { exact: true }).fill(password);
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await expect(page).toHaveURL(/dashboard/);
    await page.goto("/reconstruct/new?mode=object");
    const buffer = await sharp("apps/web/public/demo/shoe.png")
      .extract({ left: 80, top: 0, width: 520, height: 370 })
      .jpeg()
      .toBuffer();
    await page.locator("input[type=file]").setInputFiles({
      name: "licensed-shoe.jpg",
      mimeType: "image/jpeg",
      buffer,
    });
    await expect(page.getByText(/업로드 1장/)).toBeVisible();
    const projects = await (await page.request.get("/api/projects")).json();
    pid = projects[0].id;
    await page.getByRole("button", { name: "다음 단계", exact: true }).click();
    await page.getByText("키보드로 선택 영역 입력", { exact: true }).click();
    for (const [name, value] of [
      ["가로 위치", ".15"],
      ["세로 위치", ".05"],
      ["너비", ".8"],
      ["높이", ".88"],
    ])
      await page.getByLabel(name, { exact: true }).fill(value);
    await page.getByRole("button", { name: "선택 저장", exact: true }).click();
    await expect(
      page.getByText("선택 영역을 저장했습니다.", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "선택 영역 분석", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "마스크 승인", exact: true }),
    ).toBeVisible({ timeout: 120000 });
    await page
      .getByRole("button", { name: "마스크 승인", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "검토 완료", exact: true }),
    ).toBeVisible();
    const result = await (
      await page.request.get(`/api/projects/${pid}`)
    ).json();
    expect(result.images[0].mask_reviewed).toBe(true);
    expect(result.jobs[0].state).toBe("completed");
    const mask = await page.request.get(result.images[0].mask_url);
    expect(mask.ok()).toBe(true);
    expect((await sharp(await mask.body()).metadata()).width).toBe(520);
    await page.screenshot({
      path: "artifacts/sam2-browser-reviewed.png",
      fullPage: true,
    });
    const health = await (await page.request.get("/api/health")).json();
    expect(health.real_gpu_validated).toBe(false);
  } finally {
    if (pid) {
      const { data: jobs } = await admin
        .from("jobs")
        .select("id,state")
        .eq("project_id", pid);
      for (const j of jobs ?? [])
        if (!["completed", "failed", "cancelled"].includes(j.state))
          await admin
            .from("jobs")
            .update({ state: "cancelled" })
            .eq("id", j.id);
      const { data: slot } = await admin
        .from("worker_slot")
        .select("job_id")
        .eq("id", 1)
        .single();
      if (!jobs?.some((j) => j.id === slot?.job_id)) {
        const { data: images } = await admin
            .from("project_images")
            .select("original_path,normalized_path")
            .eq("project_id", pid),
          { data: masks } = await admin
            .from("object_masks")
            .select("storage_path")
            .eq("project_id", pid);
        const keys = [
          ...(images ?? []).flatMap((i) => [
            i.original_path,
            i.normalized_path,
          ]),
          ...(masks ?? []).map((m) => m.storage_path),
        ].filter(Boolean);
        if (keys.length) await admin.storage.from("project-files").remove(keys);
        await admin.storage.from("original-uploads").remove(keys);
        await admin.from("object_masks").delete().eq("project_id", pid);
        for (const j of jobs ?? [])
          await admin.from("job_events").delete().eq("job_id", j.id);
        await admin.from("jobs").delete().eq("project_id", pid);
        await admin.from("project_images").delete().eq("project_id", pid);
        await admin.from("projects").delete().eq("id", pid);
        await admin.auth.admin.deleteUser(uid);
      }
    } else await admin.auth.admin.deleteUser(uid);
  }
});
