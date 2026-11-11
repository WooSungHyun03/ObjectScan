import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
process.loadEnvFile(".env.test.local");
if (new URL(process.env.TEST_SUPABASE_URL!).hostname !== "127.0.0.1")
  throw Error("Local GPU integration only");
test("single photo → reviewed SAM2 → actual RTX4080 reconstruction → private textured GLB → download/reopen", async ({
  page,
}) => {
  test.skip(
    process.env.OBJECTSCAN_FULL_GPU !== "1",
    "Explicit real GPU run only",
  );
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
  console.log("fixture created");
  test.setTimeout(1800000);
  test.skip(
    process.env.OBJECTSCAN_FULL_GPU !== "1",
    "Explicit real GPU run only",
  );
  const configs = await admin
    .from("app_config")
    .select("key,value")
    .in("key", ["validated_models", "validated_profiles"]);
  await admin.from("app_config").upsert([
    { key: "validated_models", value: ["pixal3d"] },
    {
      key: "validated_profiles",
      value: [{ model: "pixal3d", min_images: 1, max_images: 1 }],
    },
  ]);
  await admin.from("credit_wallets").insert({ user_id: uid, balance: 10 });
  await admin
    .from("wallet_entries")
    .insert({ user_id: uid, kind: "trial", credits: 10 });
  await admin
    .from("generation_credit_rates")
    .upsert({ mode: "object", min_images: 1, credits: 1, enabled: true });
  let pid = "";
  try {
    await page.goto("/login");
    console.log("login page");
    await page.getByRole("textbox", { name: "이메일" }).fill(email);
    await page.getByLabel("비밀번호", { exact: true }).fill(password);
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await expect(page).toHaveURL(/dashboard/);
    console.log("logged in");
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
    expect(health.real_gpu_validated).toBe(true);
    console.log("real SAM2 mask approved");
    await page.getByRole("button", { name: "다음 단계", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "크레딧으로 3D 만들기", exact: true }),
    ).toBeEnabled();
    await page
      .getByRole("button", { name: "크레딧으로 3D 만들기", exact: true })
      .click();
    console.log("generation queued");
    let job:
      | { id: string; kind: string; state: string; error_code?: string }
      | undefined;
    const deadline = Date.now() + 1500000;
    while (Date.now() < deadline) {
      const d = await (await page.request.get(`/api/projects/${pid}`)).json();
      job = d.jobs.find((j: { kind: string }) => j.kind === "generation");
      if (job?.state === "failed")
        throw Error("Actual GPU failure: " + job.error_code);
      if (job?.state === "completed") break;
      await new Promise((r) => setTimeout(r, 5000));
    }
    expect(job?.state).toBe("completed");
    const detail = await (
      await page.request.get(`/api/projects/${pid}`)
    ).json();
    expect(detail.artifacts.length).toBe(1);
    const artifact = detail.artifacts[0];
    const dl = await page.request.get(`/api/assets/${artifact.id}/download`);
    expect(dl.ok()).toBe(true);
    const link = await dl.json();
    const mesh = await page.request.get(link.url);
    expect(mesh.ok()).toBe(true);
    const bytes = await mesh.body();
    expect(bytes.subarray(0, 4).toString()).toBe("glTF");
    const parsed = JSON.parse(
      bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString(),
    );
    expect(parsed.meshes[0].primitives[0].attributes.TEXCOORD_0).toBeDefined();
    expect(parsed.images.length).toBeGreaterThan(0);
    await page.goto(`/projects/${pid}`);
    await page
      .locator('canvas[data-model-loaded="true"]')
      .waitFor({ timeout: 90000 });
    await page.screenshot({
      path: "artifacts/launch-v5/real-generation-desktop.png",
      fullPage: true,
    });
    const wallet = await (await page.request.get("/api/wallet")).json();
    expect(Number(wallet.balance)).toBe(9);
    const { writeFileSync } = await import("node:fs");
    writeFileSync(
      "artifacts/launch-v5/gpu-web-report.json",
      JSON.stringify(
        {
          passed: true,
          job_id: job.id,
          artifact_id: artifact.id,
          bytes: bytes.length,
          scope:
            "actual local private upload/SAM2/credit debit/CUDA/GLB/viewer/download/reopen; trial credit fixture, no payment",
          job,
        },
        null,
        2,
      ),
    );
  } finally {
    await admin.from("app_config").upsert(configs.data ?? []);
    await admin
      .from("generation_credit_rates")
      .delete()
      .eq("mode", "object")
      .eq("min_images", 1);
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
        const { data: assets } = await admin
          .from("artifacts")
          .select("id,storage_path,preview_path")
          .eq("project_id", pid);
        for (const a of assets ?? []) {
          await admin.storage
            .from("project-files")
            .remove([a.storage_path, a.preview_path].filter(Boolean));
          await admin.from("asset_versions").delete().eq("artifact_id", a.id);
        }
        await admin.from("artifacts").delete().eq("project_id", pid);
        await admin.from("wallet_entries").delete().eq("user_id", uid);
        await admin.from("credit_wallets").delete().eq("user_id", uid);
        await admin.from("jobs").delete().eq("project_id", pid);
        await admin.from("project_images").delete().eq("project_id", pid);
        await admin.from("projects").delete().eq("id", pid);
        await admin.auth.admin.deleteUser(uid);
      }
    } else await admin.auth.admin.deleteUser(uid);
  }
});
