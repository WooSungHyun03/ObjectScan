import { serviceOrigin } from "@/lib/service-origin";
import type { Metadata, Viewport } from "next";
import palette from "@/lib/design-tokens/tokens.json";
import "@fontsource-variable/noto-sans-kr";
import "./globals.css";
import "./studio.css";
import "./design-tokens.css";
import "./premium.css";
import { DesignCapture } from "@/components/design/capture";
export const viewport: Viewport = { themeColor: palette["color-canvas"] };
export const metadata: Metadata = {
  metadataBase: new URL(serviceOrigin()),
  robots:
    process.env.VERCEL_ENV === "preview"
      ? { index: false, follow: false }
      : { index: true, follow: true },
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  manifest: "/manifest.webmanifest",
  title: {
    default: "ObjectScan | 사진으로 시작하는 3D 제작",
    template: "%s · ObjectScan",
  },
  description: "사진 속 물건과 공간을 3D로 준비하는 한국어 제작 서비스.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {process.env.NODE_ENV === "development" && <DesignCapture />}
        <a href="#main" className="skip-link">
          본문으로 건너뛰기
        </a>
        {children}
      </body>
    </html>
  );
}
