// MOCK: OS-22 integration run over the existing Team fixtures, grouped into the audit's user tasks.
// TEAM_PASS here is UI/local-contract evidence only; real DB/RLS/GPU/PG/deploy stays Owner-only (SERVICE_PENDING).
// Not covered: 3D editor (no Team fixture; its real-browser evidence is the Owner's tests/e2e/editor.spec.ts).
import { test, expect, type Page } from "@playwright/test";
import { checkPage, shooter } from "./check";

const shot = shooter("OS-22");
const pay =
  "&paymentKey=fixture-only&orderId=00000000-0000-4000-8000-000000000001&amount=1000";
type Task = {
  name: string;
  ticket: string;
  url: string;
  ready: (page: Page) => Promise<void>;
};
const tasks: Task[] = [
  {
    name: "1-auth-recovery",
    ticket: "OS-02",
    url: "/?fixture=forgot-link-expired&error=link_expired",
    ready: async (page) => {
      await page
        .getByRole("textbox", { name: "이메일" })
        .fill("keep@objectscan.test");
      await page.getByRole("button", { name: "재설정 이메일 받기" }).click();
      await expect(page.getByRole("status")).toContainText("재설정 안내");
    },
  },
  {
    name: "2-photo-prep",
    ticket: "OS-07",
    url: "/?fixture=draft-diagnostics",
    ready: async (page) => {
      await expect(page.locator('[data-warning="duplicate"]')).toBeVisible();
      await expect(
        page.getByRole("button", { name: "선택한 사진 5장 업로드" }),
      ).toBeEnabled();
    },
  },
  {
    name: "3-mask-recovery",
    ticket: "OS-08",
    url: "/?fixture=mask-analysis-503",
    ready: async (page) => {
      await page
        .getByRole("navigation", { name: "제작 단계" })
        .getByRole("button", { name: /물체 선택/ })
        .click();
      await page.getByRole("button", { name: "선택 영역 분석" }).click();
      await expect(
        page.getByRole("button", { name: "선택 다시 하기" }),
      ).toBeVisible();
    },
  },
  {
    name: "4-job-failure",
    ticket: "OS-12",
    url: "/?fixture=job-failed-retry",
    ready: async (page) => {
      await expect(page.getByRole("heading", { name: "실패" })).toBeVisible();
    },
  },
  {
    name: "5-viewer",
    ticket: "OS-19",
    url: "/?fixture=viewer-model",
    ready: async (page) => {
      await expect(
        page.locator('canvas[data-model-loaded="true"]'),
      ).toBeVisible({ timeout: 30000 });
      await expect(
        page.getByRole("group", { name: "보기 방향" }),
      ).toBeVisible();
    },
  },
  {
    name: "6-market",
    ticket: "OS-18",
    url: "/fixture/market-list",
    ready: async (page) => {
      await expect(page.locator(".listing-card")).toHaveCount(4);
    },
  },
  {
    name: "7-payment-return",
    ticket: "OS-10",
    url: `/?fixture=payment-response-lost${pay}`,
    ready: async (page) => {
      await expect(page.getByRole("status")).toContainText(
        "서비스에 연결하지 못했습니다",
      );
    },
  },
  {
    name: "8-orders-rights",
    ticket: "OS-21",
    url: "/?fixture=billing-orders",
    ready: async (page) => {
      await expect(
        page.getByText("결제 완료 · 테스트 결제").first(),
      ).toBeVisible();
    },
  },
];

for (const task of tasks) {
  test(`OS-22 ${task.name} (${task.ticket}) runs with no keys, DB, GPU or PG`, async ({
    page,
  }, info) => {
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
    expect(
      await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        return (
          !!el && el !== document.body && el.getBoundingClientRect().height > 0
        );
      }),
    ).toBe(true);
    await checkPage(page);
    await shot(page, task.name, info.project.name);
    // No request ever left the local fixture shell (no Supabase, PG, GPU or CDN).
    expect(
      [...hosts].filter((h) => !["127.0.0.1", "localhost"].includes(h)),
    ).toEqual([]);
  });
}

test("OS-22 create entry rejects files above the real 16MB server limit", async ({
  page,
}) => {
  await page.goto("/?fixture=create-entry-limit");
  await page.getByLabel("제작할 사진 선택").setInputFiles({
    name: "too-large.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.alloc(17 * 1024 * 1024),
  });
  await expect(page.getByRole("alert")).toContainText("16MB");
  await expect(
    page.getByRole("link", { name: "선택한 사진으로 계속하기" }),
  ).toHaveCount(0);
});

test("OS-22 OS-01 unsupported generation never starts or shows a charge", async ({
  page,
}) => {
  await page.goto("/?fixture=generation-blocked");
  await expect(
    page.getByRole("button", { name: "크레딧으로 3D 만들기" }),
  ).toBeDisabled();
  await expect(page.getByText("차감 없음", { exact: true })).toBeVisible();
  await checkPage(page);
});
test("OS-22 OS-03 lost generation response reconciles without duplicate POST", async ({
  page,
}) => {
  await page.goto("/?fixture=generation-ambiguous");
  const start = page.getByRole("button", { name: "크레딧으로 3D 만들기" });
  await expect(start).toBeEnabled();
  await start.evaluate((el: HTMLButtonElement) => {
    el.click();
    el.click();
  });
  await page.getByRole("button", { name: "등록된 작업 확인" }).click();
  await expect(page.getByTestId("tracked-job")).toHaveText("new-job");
  const count = await page.evaluate(
    () =>
      (
        window as unknown as { __fixtureCalls: { key: string }[] }
      ).__fixtureCalls.filter(
        (c) => c.key === "POST projects/fixture-project/generate",
      ).length,
  );
  expect(count).toBe(1);
});
test("OS-22 OS-03 failed job read recovers on explicit refresh", async ({
  page,
}) => {
  await page.goto("/?fixture=job-network-recovery");
  await page.getByRole("button", { name: "상태 새로고침" }).click();
  await expect(page.getByRole("heading", { name: "대기 중" })).toBeVisible();
  await checkPage(page);
});
test("OS-22 OS-11 failed deletion preserves the asset and a rights hold stops retry", async ({
  page,
}) => {
  await page.goto("/?fixture=asset-delete-hold");
  const trigger = page.getByRole("button", { name: "MOCK owned 삭제" });
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("button", { name: "삭제 확인", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("확인하지 못했습니다");
  await page.getByRole("button", { name: "다시 시도", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("구매자의 이용 권리");
  await expect(
    page.getByRole("button", { name: "다시 시도", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "닫기", exact: true }).click();
  await expect(page.getByRole("heading", { name: "MOCK owned" })).toBeVisible();
});
