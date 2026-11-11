import { expect, test } from "vitest";
import { customerText, customerError } from "../apps/web/src/lib/customer-copy";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const forbidden =
  /Pixal3D|SAM2|Object[- ]Aware Loss|Gaussian Wrapping|COLMAP|TSDF|2DGS/i;
test("technical worker messages and model failures have Korean customer copy", () => {
  for (const input of [
    "SAM2 선택 완료",
    "COLMAP 정합 처리",
    "Pixal3D 실행",
    "Object-Aware Loss 완료",
    "Gaussian Wrapping 실패",
    "CUDA out of memory",
    "Traceback /home/user/run.py",
  ])
    expect(customerText(input)).not.toMatch(forbidden);
  expect(customerError("GPU_OOM")).toContain("사진을 줄이");
  expect(customerError("UNKNOWN_INTERNAL")).toMatch(/[가-힣]/);
});
test("customer TSX surfaces contain no algorithm names; required notices isolated", () => {
  function walk(p: string) {
    return readdirSync(p, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(join(p, e.name)) : [join(p, e.name)],
    );
  }
  for (const f of [
    ...walk("apps/web/src/app"),
    ...walk("apps/web/src/components"),
  ].filter(
    (f) =>
      f.endsWith(".tsx") &&
      !f.includes("/legal/opensource/") &&
      !f.endsWith("admin-panel.tsx"),
  )) {
    expect(readFileSync(f, "utf8"), f).not.toMatch(forbidden);
  }
});

test("authentication failures have actionable Korean messages", () => {
  expect(
    customerError("invalid_credentials", "Invalid login credentials"),
  ).toContain("이메일 또는 비밀번호");
  expect(customerError("email_not_confirmed", "Email not confirmed")).toContain(
    "가입 확인 이메일",
  );
  expect(customerError(undefined, "Failed to fetch")).toMatch(/[가-힣]/);
});
