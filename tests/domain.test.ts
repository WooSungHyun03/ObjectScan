import { describe, it, expect } from "vitest";
import {
  routeModel,
  pricingTier,
  selectionSchema,
  assertTransition,
  generationGate,
  safeObjectPath,
  platformFee,
  representativeViewCounts,
} from "@objectscan/shared";
describe("independent dual-workflow contract", () => {
  it.each([1, 4, 20, 21, 40, 41, 60, 61, 100, 200])(
    "routes uploaded count %i and prices separately",
    (n) => {
      expect(routeModel("object", n)).toBe(
        n <= 20 ? "pixal3d" : "object_aware_loss",
      );
      expect(routeModel("scene", n)).toBe("gaussian_wrapping");
      expect(pricingTier(n).lower).toBe(Math.floor((n - 1) / 20) * 20 + 1);
    },
  );
  it.each([0, -1, 201, 1.5, NaN])("rejects invalid count %s", (n) =>
    expect(() => pricingTier(n)).toThrow(),
  );
  it("rejects out-of-image boxes", () => {
    expect(
      selectionSchema.safeParse({
        kind: "box",
        x: 0.8,
        y: 0.2,
        width: 0.4,
        height: 0.4,
      }).success,
    ).toBe(false);
  });
  it("does not allow queued to complete or terminal replay", () => {
    expect(() => assertTransition("queued", "completed")).toThrow();
    expect(() => assertTransition("completed", "preflight")).toThrow();
  });
  it("requires actual model validation even with live worker heartbeat", () => {
    const gate = generationGate({
      mode: "object",
      count: 4,
      included: 4,
      capture: "camera_orbit",
      masksReviewed: true,
      posesValid: true,
      selected: 4,
      realGpuValidated: false,
      workerOnline: true,
      availableModels: ["pixal3d"],
    });
    expect(gate.errors).toContain("REAL_GPU_NOT_VALIDATED");
  });
  it("scene bypasses mask requirement while object never does", () => {
    const base = {
      count: 21,
      included: 21,
      capture: "camera_orbit" as const,
      masksReviewed: false,
      posesValid: true,
      selected: 21,
      realGpuValidated: true,
      workerOnline: true,
      availableModels: ["gaussian_wrapping", "object_aware_loss"] as const,
      validatedProfiles: [
        {
          model: "gaussian_wrapping" as const,
          min_images: 20,
          max_images: 200,
        },
        {
          model: "object_aware_loss" as const,
          min_images: 21,
          max_images: 200,
        },
      ],
    };
    expect(
      generationGate({
        ...base,
        availableModels: [...base.availableModels],
        mode: "scene",
      }).allowed,
    ).toBe(true);
    expect(
      generationGate({
        ...base,
        availableModels: [...base.availableModels],
        mode: "object",
      }).errors,
    ).toContain("MASK_REVIEW_REQUIRED");
  });
  it("does not pretend all 20 uploaded views are model inputs", () =>
    expect(representativeViewCounts(20)).toEqual([2, 4, 6, 8]));
  it("rejects traversal and cross-owner storage paths", () => {
    expect(safeObjectPath("u/p/../private", "u/p")).toBe(false);
    expect(safeObjectPath("v/p/file.glb", "u/p")).toBe(false);
    expect(safeObjectPath("u/p/file.glb", "u/p")).toBe(true);
  });
  it("calculates fee in integer minor currency units", () => {
    expect(platformFee(10001, 1250)).toBe(1250);
    expect(() => platformFee(-1, 1000)).toThrow();
  });
});

it("single-image validation never authorizes multi-view generation", () => {
  const base = {
    mode: "object" as const,
    count: 4,
    included: 4,
    capture: "camera_orbit" as const,
    masksReviewed: true,
    posesValid: true,
    selected: 4,
    realGpuValidated: true,
    workerOnline: true,
    availableModels: ["pixal3d" as const],
    validatedProfiles: [
      { model: "pixal3d" as const, min_images: 1, max_images: 1 },
    ],
  };
  expect(generationGate(base).errors).toContain("INPUT_PROFILE_NOT_VALIDATED");
  expect(
    generationGate({ ...base, count: 1, included: 1, selected: 1 }).allowed,
  ).toBe(true);
});

it("qualification profile never authorizes another customer", () => {
  const input = {
    mode: "object" as const,
    count: 1,
    included: 1,
    capture: "camera_orbit" as const,
    masksReviewed: true,
    posesValid: false,
    selected: 1,
    realGpuValidated: true,
    workerOnline: true,
    availableModels: ["pixal3d" as const],
    validatedProfiles: [
      {
        model: "pixal3d" as const,
        min_images: 1,
        max_images: 1,
        owner_ids: ["fixture-owner"],
      },
    ],
  };
  expect(generationGate({ ...input, ownerId: "fixture-owner" }).allowed).toBe(
    true,
  );
  expect(generationGate({ ...input, ownerId: "other-owner" }).allowed).toBe(
    false,
  );
  expect(generationGate(input).allowed).toBe(false);
});

it("listing license is explicit and publication rejects unsupported rights and missing consent", async () => {
  const { listingInput } = await import("../packages/shared/src/index");
  const fixture = {
    title: "검증용",
    description: "저작자와 원본 링크",
    category: "objects",
    price: 1000,
    consent: true,
  };
  expect(listingInput.parse(fixture).license).toBe("standard");
  expect(listingInput.parse({ ...fixture, license: "cc-by-4.0" }).license).toBe(
    "cc-by-4.0",
  );
  expect(
    listingInput.safeParse({ ...fixture, license: "any-rights" }).success,
  ).toBe(false);
  expect(listingInput.safeParse({ ...fixture, consent: false }).success).toBe(
    false,
  );
});
