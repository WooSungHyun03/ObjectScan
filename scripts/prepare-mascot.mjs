import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const inventory = JSON.parse(
  readFileSync("docs/EVIDENCE/mascot-inventory.json", "utf8"),
);
const roles = [
  [
    "wave",
    7,
    "빨간 모자와 파란 코트를 입고 손을 흔드는 ObjectScan 곰",
    "hero",
    800,
  ],
  ["jump", 8, "두 손을 들고 기뻐하는 ObjectScan 곰", "success", 480],
  ["work", 9, "노트북으로 작업하는 ObjectScan 곰", "upload-empty", 400],
  ["front", 6, "정면을 바라보는 ObjectScan 곰", "empty-state", 400],
  ["avatar", 11, "ObjectScan 곰 얼굴", "brand", 160],
];
const manifest = {};
for (const [name, index, alt, placement, width] of roles) {
  const asset = inventory[index];
  if (asset.alpha_extrema[0] !== 0) throw Error("Actual alpha required");
  const dest = `apps/web/public/brand/mascot/${name}.webp`;
  await sharp(`/home/m4ml/Desktop/ObjectScan/Mascot/${asset.file}`)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 95 })
    .toFile(dest);
  const m = await sharp(dest).metadata();
  manifest[name] = {
    src: `/brand/mascot/${name}.webp`,
    width: m.width,
    height: m.height,
    alt,
    placement,
    source_sha256: asset.sha256,
  };
}
writeFileSync(
  "apps/web/src/lib/brand/mascot-manifest.ts",
  "// Derived from supplied source assets; preserve originals.\nexport const mascots = " +
    JSON.stringify(manifest, null, 2) +
    " as const;\n",
);
mkdirSync("docs/EVIDENCE", { recursive: true });
writeFileSync(
  "docs/EVIDENCE/mascot-inventory.json",
  JSON.stringify(inventory, null, 2),
);
