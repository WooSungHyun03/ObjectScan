import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const names = [
  "three",
  "@fontsource-variable/noto-sans-kr",
  "@react-three/fiber",
  "@react-three/drei",
  "three-mesh-bvh",
  "@gltf-transform/core",
  "@gltf-transform/functions",
  "@gltf-transform/extensions",
  "meshoptimizer",
  "react",
  "react-dom",
  "next",
  "lucide-react",
  "motion",
  "@supabase/ssr",
  "@supabase/supabase-js",
  "zod",
];
let text =
  "ObjectScan third-party software notices\nGenerated from installed package licenses or documented upstream fallback; original terms apply.\n";
for (const name of names) {
  const dir = join("node_modules", name),
    file = readdirSync(dir).find((f) => /^licen[sc]e(?:\.|$)/i.test(f));
  if (!file && name !== "@react-three/fiber")
    throw Error("Missing actual license for " + name);
  const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  text +=
    `\n\n===== ${name} ${pkg.version} =====\n` +
    readFileSync(
      file ? join(dir, file) : "docs/licenses/react-three-fiber-LICENSE.txt",
      "utf8",
    );
}
mkdirSync("apps/web/public/legal", { recursive: true });
writeFileSync("apps/web/public/legal/third-party-notices.txt", text);
console.log("Collected original license text for", names.length, "packages");
