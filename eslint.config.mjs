import next from "eslint-config-next/core-web-vitals";
import ts from "eslint-config-next/typescript";
export default [
  ...next,
  ...ts,
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "artifacts/**",
      "**/next-env.d.ts",
      "supabase/.temp/**",
    ],
  },
  {
    settings: { next: { rootDir: "apps/web/" } },
    rules: { "react-hooks/set-state-in-effect": "warn" },
  },
];
