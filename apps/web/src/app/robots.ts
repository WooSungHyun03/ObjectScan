import type { MetadataRoute } from "next";
import { serviceOrigin } from "@/lib/service-origin";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      ...(process.env.VERCEL_ENV === "preview"
        ? { disallow: "/" }
        : {
            allow: "/",
            disallow: [
              "/api/",
              "/projects/",
              "/billing",
              "/checkout/",
              "/settings",
            ],
          }),
    },
    sitemap: serviceOrigin() + "/sitemap.xml",
  };
}
