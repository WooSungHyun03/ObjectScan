// Derived from supplied source assets; preserve originals.
export const mascots = {
  wave: {
    src: "/brand/mascot/wave.webp",
    width: 800,
    height: 800,
    alt: "빨간 모자와 파란 코트를 입고 손을 흔드는 ObjectScan 곰",
    placement: "hero",
    source_sha256:
      "5a35aaf0eb6e07f5dbc2c1f7ae1d4ab60cfd5e394db0b5f925684b7de479edb2",
  },
  jump: {
    src: "/brand/mascot/jump.webp",
    width: 480,
    height: 480,
    alt: "두 손을 들고 기뻐하는 ObjectScan 곰",
    placement: "success",
    source_sha256:
      "5b6c5a30ee74bd77c485779b5cff688819f129f7c4b6fd4a5ac4fca6d8b44c51",
  },
  work: {
    src: "/brand/mascot/work.webp",
    width: 400,
    height: 400,
    alt: "노트북으로 작업하는 ObjectScan 곰",
    placement: "upload-empty",
    source_sha256:
      "36d111809046f09da8f9ff9795d08ec7e237cc540577ca7ffb7bd32eac744599",
  },
  front: {
    src: "/brand/mascot/front.webp",
    width: 400,
    height: 400,
    alt: "정면을 바라보는 ObjectScan 곰",
    placement: "empty-state",
    source_sha256:
      "c8d5dfb713ced6add27f09f28c0ef8f4280ea45e68d54a1bb12faa72121c1b72",
  },
  avatar: {
    src: "/brand/mascot/avatar.webp",
    width: 160,
    height: 160,
    alt: "ObjectScan 곰 얼굴",
    placement: "brand",
    source_sha256:
      "dc382727f3e9513591304b11429e3be32bc06a41c351c2e5d2aef96fedfd1bdc",
  },
} as const;
