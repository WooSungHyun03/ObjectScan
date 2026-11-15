import { expect, test } from "vitest";
import {
  importFilename,
  privateImportResultSchema,
  privateImportSessionSchema,
} from "../apps/web/src/components/editor/private-model-import";

test("OS-17 import labels normalize names and reject path or control characters", () => {
  expect(importFilename(" 작업본 ")).toBe("작업본.glb");
  expect(importFilename("모델.GLB")).toBe("모델.GLB");
  for (const value of ["", "../model", "C:\\model", "a\nb", "X".repeat(101)])
    expect(importFilename(value)).toBeUndefined();
});

test("OS-17 success requires valid private project and artifact ids and publish policy", () => {
  expect(
    privateImportResultSchema.safeParse({
      project_id: "//outside.example",
      can_publish: true,
    }).success,
  ).toBe(false);
  expect(
    privateImportSessionSchema.safeParse({
      session_id: null,
      upload_required: true,
    }).success,
  ).toBe(false);
});
