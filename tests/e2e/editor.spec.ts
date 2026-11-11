import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { randomUUID, createHash } from "node:crypto";
import { existsSync } from "node:fs";
if (existsSync(".env.test.local")) process.loadEnvFile(".env.test.local");
async function rendered(page: import("@playwright/test").Page) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const box = document.querySelector<HTMLElement>(
          ".editor-canvas[data-editor-source]",
        );
        const canvas = box?.querySelector("canvas");
        return Boolean(
          box?.dataset.editorSource &&
          canvas?.getAttribute("data-editor-source") ===
            box.dataset.editorSource,
        );
      }),
    )
    .toBe(true);
}
test("editor transforms, undo/redo, simplify and real GLB download roundtrip", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto("/demo/edit");
  await expect(page.getByTestId("editor-triangles")).toHaveText("22,700");
  await expect(page.locator('canvas[data-editor-loaded="true"]')).toBeVisible();
  await page.getByRole("button", { name: "부품 1", exact: true }).click();
  await page.getByLabel("위치 X", { exact: true }).fill("0.5");
  await page.getByRole("button", { name: "수치 적용", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "실행 취소", exact: true }),
  ).toBeEnabled();
  await expect(page.getByLabel("위치 X", { exact: true })).toHaveValue("0.5");
  await page.getByRole("button", { name: "실행 취소", exact: true }).click();
  await expect(page.getByLabel("위치 X", { exact: true })).toHaveValue("0");
  await page.getByRole("button", { name: "다시 실행", exact: true }).click();
  await expect(page.getByLabel("위치 X", { exact: true })).toHaveValue("0.5");
  await page.getByText("모델 가볍게 만들기", { exact: true }).click();
  await page
    .getByRole("button", { name: "폴리곤 줄이기", exact: true })
    .click();
  await expect
    .poll(async () =>
      Number(
        (await page.getByTestId("editor-triangles").innerText()).replaceAll(
          ",",
          "",
        ),
      ),
    )
    .toBeLessThan(22700);
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "내려받기", exact: true }).click();
  const d = await downloaded;
  expect(d.suggestedFilename()).toContain("편집본.glb");
  const saved = await d.path();
  expect(saved).toBeTruthy();
  page.on("dialog", (dialog) => dialog.accept());
  await page.locator("input[type=file]").setInputFiles(saved!);
  await expect(page.getByTestId("editor-triangles")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "실행 취소", exact: true }),
  ).toBeDisabled();
  await expect(page.getByText("포함됨", { exact: true })).toBeVisible();
  await rendered(page);
  await page.screenshot({
    path: "artifacts/mascot-redesign/editor-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "편집 옵션 열기" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await rendered(page);
  await page.screenshot({
    path: "artifacts/mascot-redesign/editor-mobile.png",
    fullPage: true,
  });
});
test("private source stays immutable; actual saved versions reopen and deny another identity", async ({
  page,
}) => {
  test.skip(!process.env.TEST_SERVICE_KEY, "Needs isolated local Supabase");
  test.setTimeout(120000);
  if (
    !["127.0.0.1", "localhost"].includes(
      new URL(process.env.TEST_SUPABASE_URL!).hostname,
    )
  )
    throw Error("Local fixture only");
  const admin = createClient(
      process.env.TEST_SUPABASE_URL!,
      process.env.TEST_SERVICE_KEY!,
      { auth: { persistSession: false } },
    ),
    email = `editor-${randomUUID()}@objectscan.test`,
    password = `Test-${randomUUID()}!`,
    uids: string[] = [];
  const project = randomUUID(),
    job = randomUUID(),
    asset = randomUUID();
  let path = "";
  const check = (e: { message: string } | null) => {
    if (e) throw Error(e.message);
  };
  try {
    for (let i = 0; i < 2; i++) {
      const r = await admin.auth.admin.createUser({
        email: i ? `other-${randomUUID()}@objectscan.test` : email,
        password,
        email_confirm: true,
      });
      check(r.error);
      uids.push(r.data.user!.id);
    }
    path = `${uids[0]}/${project}/manual-editor-fixture.glb`;
    const source = await readFile("apps/web/public/demo/shoe.glb");
    check(
      (
        await admin.storage
          .from("job-results")
          .upload(path, source, { contentType: "model/gltf-binary" })
      ).error,
    );
    check(
      (
        await admin.from("projects").insert({
          id: project,
          owner_id: uids[0],
          name: "편집 검증용 공개 예시",
          mode: "object",
          status: "completed",
        })
      ).error,
    );
    check(
      (
        await admin.from("jobs").insert({
          id: job,
          project_id: project,
          owner_id: uids[0],
          kind: "generation",
          model: "pixal3d",
          state: "completed",
          project_revision: 0,
          idempotency_key: randomUUID(),
        })
      ).error,
    );
    check(
      (
        await admin.from("artifacts").insert({
          id: asset,
          project_id: project,
          owner_id: uids[0],
          job_id: job,
          name: "편집 검증용 · 생성 결과 아님",
          storage_path: path,
          quality: { fixture: true },
        })
      ).error,
    );
    await page.goto("/login");
    await page.getByRole("textbox", { name: "이메일" }).fill(email);
    await page.getByLabel("비밀번호", { exact: true }).fill(password);
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await page.waitForURL("**/dashboard");
    await page.goto(`/projects/${project}/edit`);
    await expect(page.getByTestId("editor-triangles")).toBeVisible();
    await page.getByRole("button", { name: "부품 1", exact: true }).click();
    await page.getByLabel("크기 X", { exact: true }).fill("1.2");
    await page.getByRole("button", { name: "수치 적용", exact: true }).click();
    await page
      .getByRole("button", { name: "새 버전 저장", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText(
      "새 버전을 저장했습니다",
    );
    const versions = await admin
      .from("artifact_versions")
      .select("*")
      .eq("artifact_id", asset);
    check(versions.error);
    expect(versions.data).toHaveLength(1);
    expect(versions.data![0].status).toBe("ready");
    expect(versions.data![0].version_number).toBe(1);
    const v = versions.data![0];
    const original = await admin.storage.from("job-results").download(path);
    check(original.error);
    expect(
      createHash("sha256")
        .update(new Uint8Array(await original.data!.arrayBuffer()))
        .digest("hex"),
    ).toBe(createHash("sha256").update(source).digest("hex"));
    await page.getByText("저장한 버전", { exact: true }).click();
    await page.getByRole("button", { name: /버전 1/ }).click();
    await expect(page.getByTestId("editor-triangles")).toBeVisible();
    await page.getByRole("button", { name: "부품 1", exact: true }).click();
    await expect(page.getByLabel("크기 X", { exact: true })).toHaveValue("1.2");
    const other = createClient(
      process.env.TEST_SUPABASE_URL!,
      process.env.TEST_SUPABASE_KEY!,
      { auth: { persistSession: false } },
    );
    const email2 = (await admin.auth.admin.getUserById(uids[1])).data.user!
      .email!;
    check(
      (await other.auth.signInWithPassword({ email: email2, password })).error,
    );
    expect(
      (await other.from("artifact_versions").select("id").eq("id", v.id)).data,
    ).toEqual([]);
    expect(
      (await other.storage.from("asset-versions").download(v.storage_path))
        .error,
    ).toBeTruthy();
    const anon = await page.request.get(
      `/api/assets/${asset}/versions/${v.id}`,
    );
    expect(anon.ok()).toBe(true);
    await rendered(page);
    await page.screenshot({
      path: "artifacts/mascot-redesign/editor-private-version.png",
      fullPage: true,
    });
  } finally {
    const vs = await admin
      .from("artifact_versions")
      .select("storage_path")
      .eq("artifact_id", asset);
    if (vs.data?.length)
      await admin.storage
        .from("asset-versions")
        .remove(vs.data.map((v) => v.storage_path));
    await admin.from("artifact_versions").delete().eq("artifact_id", asset);
    await admin.from("audit_logs").delete().in("actor_id", uids);
    await admin.from("artifacts").delete().eq("id", asset);
    await admin.from("job_events").delete().eq("job_id", job);
    await admin.from("jobs").delete().eq("id", job);
    await admin.from("projects").delete().eq("id", project);
    if (path) await admin.storage.from("job-results").remove([path]);
    for (const id of uids) await admin.auth.admin.deleteUser(id);
  }
});

test("optional actual large artifact shows display LOD but downloads full edited geometry", async ({
  page,
}) => {
  test.skip(
    !process.env.OBJECTSCAN_EDITOR_LARGE_GLB,
    "Separate private large-artifact check",
  );
  test.setTimeout(120000);
  await page.goto("/demo/edit");
  await expect(page.getByTestId("editor-triangles")).toBeVisible();
  const writes: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST" && r.url().includes("/api/"))
      writes.push(r.url());
  });
  await page
    .locator("input[type=file]")
    .setInputFiles(process.env.OBJECTSCAN_EDITOR_LARGE_GLB!);
  await expect(page.getByTestId("editor-triangles")).toHaveText("996,087", {
    timeout: 90000,
  });
  await expect(page.getByText(/작업용 경량 미리보기/)).toBeVisible();
  await expect(page.locator('canvas[data-editor-loaded="true"]')).toBeVisible();
  const waiting = page.waitForEvent("download");
  await page.getByRole("button", { name: "내려받기", exact: true }).click();
  const download = await waiting;
  const file = await readFile((await download.path())!);
  expect(file.length).toBeGreaterThan(40000000);
  expect(writes).toEqual([]);
  await rendered(page);
  await page.screenshot({
    path: "artifacts/mascot-redesign/editor-real-large.png",
    fullPage: true,
  });
});
