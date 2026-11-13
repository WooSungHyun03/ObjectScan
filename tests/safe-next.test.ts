import { expect, test } from "vitest";
import { safeNext } from "@/lib/safe-next";
test("safeNext keeps internal paths and rejects external or malformed ones", () => {
  expect(safeNext("/projects/1?tab=a")).toBe("/projects/1?tab=a");
  expect(safeNext(null)).toBe("/dashboard");
  for (const bad of [
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/a\nb",
    "javascript:alert(1)",
    "",
  ])
    expect(safeNext(bad)).toBe("/dashboard");
  expect(safeNext("https://evil.test", "/reset-password")).toBe(
    "/reset-password",
  );
});
