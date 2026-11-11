import type { MetadataRoute } from "next";
import { serviceOrigin } from "@/lib/service-origin";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "/",
    "/create",
    "/pricing",
    "/marketplace",
    "/docs",
    "/support",
    "/terms",
    "/privacy",
  ].map((path) => ({ url: serviceOrigin() + path }));
}
