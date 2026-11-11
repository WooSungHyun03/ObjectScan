import type { NextConfig } from "next";
const config: NextConfig = {
  distDir: process.env.OBJECTSCAN_DIST_DIR ?? ".next",
  transpilePackages: ["@objectscan/shared", "@objectscan/mesh-editor"],
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: "1mb" } },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default config;
