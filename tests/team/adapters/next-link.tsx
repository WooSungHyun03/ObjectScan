import type { AnchorHTMLAttributes } from "react";
// Test-only stand-in for next/link: a plain anchor.
export default function Link({
  href,
  prefetch,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  prefetch?: boolean;
}) {
  void prefetch;
  return <a href={href} {...rest} />;
}
