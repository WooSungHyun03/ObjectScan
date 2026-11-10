import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { randomUUID, createHash } from "node:crypto";
import sharp from "sharp";
process.loadEnvFile(".env.test.local");
if (new URL(process.env.TEST_SUPABASE_URL!).hostname !== "127.0.0.1")
  throw Error("Local disposable GPU viewer fixtures only");

test("actual offline GPU GLB: private viewer/download and isolated marketplace moderation", async ({
  page,
  browser,
}) => {
  const file = process.env.OBJECTSCAN_VALIDATE_GLB;
  if (!file)
    throw Error(
      "OBJECTSCAN_VALIDATE_GLB must point to an actual adapter mesh.glb",
    );
  const manifest = JSON.parse(
    await readFile(join(dirname(file), "manifest.json"), "utf8"),
  );
  const imageIds = manifest.images.map(() => randomUUID()) as string[];
  const outputName = manifest.model === "pixal3d" ? "pixal" : manifest.model;
  const result = JSON.parse(
    await readFile(join(dirname(file), "result.json"), "utf8"),
  );
  const semantic = JSON.parse(
    await readFile(join(dirname(file), "semantic-validation.json"), "utf8"),
  );
  const bytes = await readFile(file),
    previewBytes = await readFile(join(dirname(file), "preview.glb")).catch(
      (error) => {
        if (
          process.env.OBJECTSCAN_GPU_VIEWER_ONLY === "1" &&
          error.code === "ENOENT"
        )
          return null;
        throw error;
      },
    ),
    sha = createHash("sha256").update(bytes).digest("hex");
  expect(result.quality.real_gpu).toBe(true);
  expect(sha).toBe(semantic.sha256);
  const db = createClient(
    process.env.TEST_SUPABASE_URL!,
    process.env.TEST_SERVICE_KEY!,
    { auth: { persistSession: false } },
  );
  const email = `mesh-${randomUUID()}@objectscan.test`,
    password = `Mesh-${randomUUID()}!`,
    pid = randomUUID(),
    job = randomUUID(),
    asset = randomUUID();
  const created = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (created.error) throw created.error;
  const uid = created.data.user!.id,
    path = `${uid}/${pid}/${job}/mesh.glb`,
    originalPaths = imageIds.map((id) => `${uid}/${pid}/${id}/original.jpg`),
    normalizedPaths = imageIds.map(
      (id) => `${uid}/${pid}/${id}/normalized.jpg`,
    ),
    maskPaths = imageIds.map((id) => `${uid}/${pid}/${id}/mask-r0.png`);
  const previewPath = `${uid}/${pid}/${job}/preview.glb`,
    listingTitle = `내부 검증용 · 판매하지 않음 ${asset.slice(0, 8)}`;
  let listingId = "";
  const check = (r: { error: unknown }) => {
    if (r.error) throw r.error;
  };
  try {
    // Import a genuine offline benchmark result for viewer QA. No queue/payment
    // completion is simulated, and this does not validate the paid web flow.
    check(
      await db.from("projects").insert({
        id: pid,
        owner_id: uid,
        name: `실GPU 실험 · ${manifest.model} · ${manifest.input_image_count}장`,
        mode: manifest.mode,
        status: "completed",
        input_image_count: manifest.input_image_count,
      }),
    );
    check(
      await db.from("project_images").insert(
        await Promise.all(
          manifest.images.map(
            async (ref: { image_id: string }, index: number) => {
              const sourceId = ref.image_id;
              const imageId = imageIds[index],
                originalPath = originalPaths[index],
                normalizedPath = normalizedPaths[index],
                maskPath = maskPaths[index];
              const input = await readFile(
                join(dirname(file), "images", `${sourceId}.jpg`),
              );
              const mask =
                manifest.mode === "object"
                  ? await readFile(
                      join(dirname(file), "masks", `${sourceId}.png`),
                    )
                  : null;
              const metadata = await sharp(input).metadata();
              check(
                await db.storage
                  .from("original-uploads")
                  .upload(originalPath, input, { contentType: "image/jpeg" }),
              );
              check(
                await db.storage
                  .from("project-files")
                  .upload(normalizedPath, input, { contentType: "image/jpeg" }),
              );
              if (mask)
                check(
                  await db.storage
                    .from("project-files")
                    .upload(maskPath, mask, { contentType: "image/png" }),
                );
              return {
                id: imageId,
                project_id: pid,
                owner_id: uid,
                filename: `실GPU 입력 ${index + 1} · ${manifest.model}.jpg`,
                position: index,
                mime: "image/jpeg",
                size_bytes: input.length,
                width: metadata.width,
                height: metadata.height,
                original_path: originalPath,
                normalized_path: normalizedPath,
                status: "verified",
                sha256: createHash("sha256").update(input).digest("hex"),
              };
            },
          ),
        ),
      ),
    );
    check(
      await db.from("jobs").insert({
        id: job,
        project_id: pid,
        owner_id: uid,
        kind: "generation",
        model: manifest.model,
        state: "completed",
        progress: 100,
        project_revision: 0,
        idempotency_key: randomUUID(),
      }),
    );
    check(
      await db.storage
        .from("job-results")
        .upload(path, bytes, { contentType: "model/gltf-binary" }),
    );
    if (previewBytes)
      check(
        await db.storage.from("job-results").upload(previewPath, previewBytes, {
          contentType: "model/gltf-binary",
        }),
      );
    check(
      await db.from("artifacts").insert({
        id: asset,
        project_id: pid,
        owner_id: uid,
        job_id: job,
        name: "Offline GPU benchmark import; paid pipeline unverified",
        storage_path: path,
        preview_path: null,
        quality: {
          ...result.quality,
          execution_profile: result.execution_profile,
        },
      }),
    );
    await page.goto("/login");
    await page.getByRole("textbox", { name: "이메일" }).fill(email);
    await page.getByLabel("비밀번호", { exact: true }).fill(password);
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await expect(page).toHaveURL(/dashboard/);
    await page.goto(`/projects/${pid}`);
    await expect(
      page
        .locator("dl > div")
        .filter({ has: page.getByText("사용할 사진", { exact: true }) })
        .locator("dd"),
    ).toHaveText(`${manifest.input_image_count}장`);
    await expect(page.locator('canvas[data-model-loaded="true"]')).toBeVisible({
      timeout: 90000,
    });
    await expect(
      page.getByRole("button", { name: "GLB 다운로드", exact: true }),
    ).toBeEnabled();
    await page.screenshot({
      path: `artifacts/${outputName}-actual-viewer.png`,
      fullPage: true,
    });
    const signed = await page.request.get(`/api/assets/${asset}/download`);
    expect(signed.ok()).toBe(true);
    const fetched = await page.request.get((await signed.json()).url);
    expect(fetched.ok()).toBe(true);
    expect(
      createHash("sha256")
        .update(await fetched.body())
        .digest("hex"),
    ).toBe(sha);
    const anon = await browser.newContext();
    try {
      expect(
        (
          await anon.request.get(
            `http://127.0.0.1:3000/api/assets/${asset}/download`,
          )
        ).status(),
      ).toBe(401);
    } finally {
      await anon.close();
    }
    expect(
      (await (await page.request.get("/api/health")).json()).real_gpu_validated,
    ).toBe(false);
    if (process.env.OBJECTSCAN_GPU_VIEWER_ONLY === "1") return;
    if (!previewBytes)
      throw Error("Validated public preview required for moderation test");
    // Nonbinding disposable local consent/price fixture: no Internet listing,
    // provider checkout, real charge or commercial-rights approval is asserted.
    await page
      .getByRole("button", { name: "에셋 마켓 게시 신청", exact: true })
      .click();
    await page.getByLabel("제목", { exact: true }).fill(listingTitle);
    await page
      .getByLabel("설명", { exact: true })
      .fill("내부 로컬 검증만 수행합니다. 실제 판매 상품이 아닙니다.");
    await page.getByLabel("판매 가격 (원)", { exact: true }).fill("1000");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "검토 요청", exact: true }).click();
    await expect(
      page.locator(".publish-form").getByRole("alert"),
    ).toContainText("공개용 경량 미리보기 검증이 필요합니다.");
    check(
      await db
        .from("artifacts")
        .update({ preview_path: previewPath })
        .eq("id", asset),
    );
    await page.getByRole("button", { name: "검토 요청", exact: true }).click();
    await expect
      .poll(async () => {
        const { data } = await db
          .from("marketplace_listings")
          .select("id,status")
          .eq("artifact_id", asset)
          .maybeSingle();
        listingId = data?.id ?? "";
        return data?.status;
      })
      .toBe("pending");
    check(await db.from("profiles").update({ role: "admin" }).eq("id", uid));
    await page.goto("/admin");
    await page
      .locator(".admin-row")
      .filter({ hasText: listingTitle })
      .getByRole("button", { name: "승인", exact: true })
      .click();
    await expect
      .poll(async () => {
        const { data } = await db
          .from("marketplace_listings")
          .select("status")
          .eq("id", listingId)
          .single();
        return data?.status;
      })
      .toBe("approved");
    const publicContext = await browser.newContext();
    try {
      const response = await publicContext.request.get(
        `http://127.0.0.1:3000/api/listings/${listingId}`,
      );
      expect(response.ok()).toBe(true);
      const listing = await response.json();
      const preview = await publicContext.request.get(listing.preview_url);
      expect(preview.ok()).toBe(true);
      expect(
        createHash("sha256")
          .update(await preview.body())
          .digest("hex"),
      ).toBe(createHash("sha256").update(previewBytes).digest("hex"));
      expect(
        (
          await publicContext.request.get(
            `http://127.0.0.1:3000/api/assets/${asset}/download`,
          )
        ).status(),
      ).toBe(401);
      const publicPage = await publicContext.newPage();
      await publicPage.goto(`http://127.0.0.1:3000/marketplace/${listingId}`);
      await expect(
        publicPage.getByRole("heading", { name: listingTitle, exact: true }),
      ).toBeVisible();
      await expect(
        publicPage.locator('canvas[data-model-loaded="true"]'),
      ).toBeVisible();
      await expect(
        publicPage.getByRole("button", {
          name: "결제 제공사 연결 대기",
          exact: true,
        }),
      ).toBeDisabled();
      await publicPage.screenshot({
        path: `artifacts/${outputName}-public-preview.png`,
        fullPage: true,
      });
    } finally {
      await publicContext.close();
    }
  } finally {
    const { data: fixtureListings } = await db
      .from("marketplace_listings")
      .select("id")
      .eq("artifact_id", asset);
    for (const fixture of fixtureListings ?? []) {
      await db.storage
        .from("market-previews")
        .remove([`approved/${fixture.id}/preview.glb`]);
      check(
        await db.from("marketplace_listings").delete().eq("id", fixture.id),
      );
    }
    await db.storage.from("job-results").remove([path, previewPath]);
    await db.storage.from("original-uploads").remove(originalPaths);
    await db.storage
      .from("project-files")
      .remove([...normalizedPaths, ...maskPaths]);
    await db.from("artifacts").delete().eq("id", asset);
    await db.from("job_events").delete().eq("job_id", job);
    await db.from("jobs").delete().eq("id", job);
    await db.from("project_images").delete().eq("project_id", pid);
    await db.from("projects").delete().eq("id", pid);
    check(await db.from("audit_logs").delete().eq("actor_id", uid));
    check(await db.auth.admin.deleteUser(uid));
  }
});
