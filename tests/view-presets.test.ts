import { expect, test } from "vitest";
import { viewDirection } from "@/features/viewer/view-presets";
const close = (a: number[], b: number[]) =>
  a.forEach((v, i) => expect(v).toBeCloseTo(b[i], 6));
test("viewDirection maps presets to file axes and follows the display yaw", () => {
  close(viewDirection("front"), [0, 0, 1]);
  close(viewDirection("back"), [0, 0, -1]);
  close(viewDirection("left"), [-1, 0, 0]);
  close(viewDirection("right"), [1, 0, 0]);
  // Same rotation three.js applies to a child of a group with rotation.y = yaw.
  close(viewDirection("front", Math.PI / 2), [1, 0, 0]);
  close(viewDirection("right", Math.PI / 2), [0, 0, -1]);
  for (const v of ["front", "back", "left", "right"] as const)
    expect(Math.hypot(...viewDirection(v, 0.2))).toBeCloseTo(1, 9);
});
