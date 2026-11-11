"use client";
import { useEffect } from "react";
export function DesignCapture() {
  useEffect(() => {
    if (!location.hash.includes("figmacapture=")) return;
    const s = document.createElement("script");
    s.src = "https://mcp.figma.com/mcp/html-to-design/capture.js";
    s.async = true;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);
  return null;
}
