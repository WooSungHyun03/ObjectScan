// Camera directions for the viewer's preset buttons. "Front" is the model
// file's +Z axis (glTF convention) as displayed, not a detected object front.
export type ViewPreset = "front" | "back" | "left" | "right";
export const viewLabels: Record<ViewPreset, string> = {
  front: "앞",
  back: "뒤",
  left: "왼쪽",
  right: "오른쪽",
};
const base: Record<ViewPreset, [number, number]> = {
  front: [0, 1],
  back: [0, -1],
  left: [-1, 0],
  right: [1, 0],
};
// Unit [x, y, z] from the target toward the camera, following the model's display yaw.
export function viewDirection(
  view: ViewPreset,
  yaw = 0,
): [number, number, number] {
  const [x, z] = base[view],
    c = Math.cos(yaw),
    s = Math.sin(yaw);
  return [x * c + z * s, 0, -x * s + z * c];
}
