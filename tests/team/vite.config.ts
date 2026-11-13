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
    // Array form: the exact supabase client match must win over the "@" prefix.
    alias: [
      { find: /^@\/lib\/supabase\/client$/, replacement: at("./adapters/supabase-client.ts") },
      { find: "next/navigation", replacement: at("./adapters/next-navigation.ts") },
      { find: "next/link", replacement: at("./adapters/next-link.tsx") },
      { find: "next/image", replacement: at("./adapters/next-image.tsx") },
      { find: "@objectscan/shared", replacement: at("../../packages/shared/src/index.ts") },
      { find: "@", replacement: at("../../apps/web/src") },
    ],
  },
  server: { host: "127.0.0.1", port: 4317, strictPort: true },
});
