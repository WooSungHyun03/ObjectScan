import type { ImgHTMLAttributes } from "react";
// Test-only stand-in for next/image: a plain img (no optimizer server).
export default function Image({
  priority,
  alt,
  ...rest
}: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean; alt: string }) {
  void priority;
  // eslint-disable-next-line @next/next/no-img-element -- the adapter's whole job is to replace next/image
  return <img alt={alt} {...rest} />;
}
