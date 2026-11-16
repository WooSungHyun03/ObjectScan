import { expect, test } from "vitest";
import type { Job, ProjectImage } from "@objectscan/shared";
import { maskRecovery } from "@/features/create/mask-recovery";

const im = (id: string, mask_url?: string) =>
  ({ id, mask_url }) as ProjectImage;
const job = (state: Job["state"], kind: Job["kind"] = "masks") =>
  ({ kind, state }) as Job;

test("only the latest mask job decides failure and which photos need a new selection", () => {
  const photos = [im("a", "m"), im("b")];
  expect(maskRecovery(photos, [job("completed")])).toEqual({
    failed: false,
    missing: [photos[1]],
  });
  expect(maskRecovery(photos, [job("failed"), job("completed")])).toEqual({
    failed: true,
    missing: [],
  });
  // A newer poses job does not hide the latest mask result; a running mask job reports nothing yet.
  expect(
    maskRecovery(photos, [job("queued", "poses"), job("failed")]).failed,
  ).toBe(true);
  expect(maskRecovery(photos, [job("running")])).toEqual({
    failed: false,
    missing: [],
  });
  expect(maskRecovery(photos)).toEqual({ failed: false, missing: [] });
});
