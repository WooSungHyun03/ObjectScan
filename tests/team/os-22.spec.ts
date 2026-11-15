// MOCK: OS-22 integration run over the existing Team fixtures, grouped into the audit's user tasks.
// TEAM_PASS here is UI/local-contract evidence only; real DB/RLS/GPU/PG/deploy stays Owner-only (SERVICE_PENDING).
// Not covered: 3D editor (no Team fixture; its real-browser evidence is the Owner's tests/e2e/editor.spec.ts).
import { test, expect, type Page } from "@playwright/test";
import { checkPage, shooter } from "./check";

const shot = shooter("OS-22");
const pay = "&paymentKey=fixture-only&orderId=00000000-0000-4000-8000-000000000001&amount=1000";
type Task = { name: string; ticket: string; url: string; ready: (page: Page) => Promise<void>; known?: Parameters<typeof checkPage>[1] };
const tasks: Task[] = [
  {
    name: "1-auth-recovery", ticket: "OS-02", url: "/?fixture=forgot-link-expired&error=link_expired",
    ready: async (page) => {
      await page.getByRole("textbox", { name: "이메일" }).fill("keep@objectscan.test");
      await page.getByRole("button", { name: "재설정 이메일 받기" }).click();
      await expect(page.getByRole("status")).toContainText("재설정 안내");
    },
  },
  {
    name: "2-photo-prep", ticket: "OS-07", url: "/?fixture=draft-diagnostics",
    ready: async (page) => {
      await expect(page.locator('[data-warning="duplicate"]')).toBeVisible();
      await expect(page.getByRole("button", { name: "선택한 사진 5장 업로드" })).toBeEnabled();
    },
  },
  {
    name: "3-mask-recovery", ticket: "OS-08", url: "/?fixture=mask-analysis-503",
    known: { contrastOnly: [".notice", ".mask-card", ".selection-tools"] },
    ready: async (page) => {
      await page.getByRole("navigation", { name: "제작 단계" }).getByRole("button", { name: /물체 선택/ }).click();
      await page.getByRole("button", { name: "선택 영역 분석" }).click();
      await expect(page.getByRole("button", { name: "선택 다시 하기" })).toBeVisible();
    },
  },
  {
    name: "4-job-failure", ticket: "OS-12", url: "/?fixture=job-failed-retry",
    known: { contrastExclude: [".job-tracker"] },
    ready: async (page) => {
      await expect(page.getByRole("heading", { name: "실패" })).toBeVisible();
    },
  },
  {
    name: "5-viewer", ticket: "OS-19", url: "/?fixture=viewer-model",
    ready: async (page) => {
      await expect(page.locator('canvas[data-model-loaded="true"]')).toBeVisible({ timeout: 30000 });
      await expect(page.getByRole("group", { name: "보기 방향" })).toBeVisible();
    },
  },
  {
    name: "6-market", ticket: "OS-18", url: "/fixture/market-list",
    known: { contrastExclude: [".project-info > p"] },
    ready: async (page) => {
      await expect(page.locator(".listing-card")).toHaveCount(4);
    },
  },
  {
    name: "7-payment-return", ticket: "OS-10", url: `/?fixture=payment-response-lost${pay}`,
    ready: async (page) => {
      await expect(page.getByRole("status")).toContainText("서비스에 연결하지 못했습니다");
    },
  },
  {
    name: "8-orders-rights", ticket: "OS-21", url: "/?fixture=billing-orders",
    known: { contrastExclude: [".project-info > p", ".workspace-notice"] },
    ready: async (page) => {
      await expect(page.getByText("결제 완료 · 테스트 결제").first()).toBeVisible();
    },
  },
];

for (const task of tasks) {
  test(`OS-22 ${task.name} (${task.ticket}) runs with no keys, DB, GPU or PG`, async ({ page }, info) => {
    const hosts = new Set<string>();
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (u.protocol.startsWith("http")) hosts.add(u.hostname); // blob:/data: from the GLB loader stay local
    });
    await page.goto(task.url);
    await task.ready(page);
    // Keyboard: the first Tab lands on a visible control.
    await page.locator("body").focus();
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return !!el && el !== document.body && el.getBoundingClientRect().height > 0;
    })).toBe(true);
    await checkPage(page, task.known);
    await shot(page, task.name, info.project.name);
    // No request ever left the local fixture shell (no Supabase, PG, GPU or CDN).
    expect([...hosts].filter((h) => !["127.0.0.1", "localhost"].includes(h))).toEqual([]);
  });
}
