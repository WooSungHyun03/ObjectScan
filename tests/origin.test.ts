import { afterEach, expect, test, vi } from "vitest";
import { serviceOrigin } from "../apps/web/src/lib/service-origin";
afterEach(() => vi.unstubAllEnvs());
test("preview callback uses exact deployment origin without replacing production domain", () => {
  vi.stubEnv("VERCEL_ENV", "preview");
  vi.stubEnv("VERCEL_URL", "objectscan-example.vercel.app");
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://be-celeb.org");
  expect(serviceOrigin()).toBe("https://objectscan-example.vercel.app");
});
test("production canonical follows explicit configured origin", () => {
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://objectscan-six.vercel.app/path");
  expect(serviceOrigin()).toBe("https://objectscan-six.vercel.app");
});
