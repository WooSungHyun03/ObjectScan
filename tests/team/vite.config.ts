// Team-only fixture shell: renders real app components with no keys/DB/GPU/PG.
// Not part of the Next build, routes or auth; next/* is swapped for adapters.
import { defineConfig } from "vite";
import tailwind from "@tailwindcss/postcss";

const at = (p: string) => new URL(p, import.meta.url).pathname;

export default defineConfig({
  root: at("./fixture"),
  publicDir: at("../../apps/web/public"),
  css: { postcss: { plugins: [tailwind({ base: at("../../apps/web") })] } },
  resolve: {
    alias: {
      "next/navigation": at("./adapters/next-navigation.ts"),
      "next/link": at("./adapters/next-link.tsx"),
      "next/image": at("./adapters/next-image.tsx"),
      "@objectscan/shared": at("../../packages/shared/src/index.ts"),
      "@": at("../../apps/web/src"),
    },
  },
  server: { host: "127.0.0.1", port: 4317, strictPort: true },
});
