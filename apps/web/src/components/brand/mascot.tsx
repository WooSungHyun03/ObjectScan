import Image from "next/image";
import { mascots } from "@/lib/brand/mascot-manifest";
export function BrandMascot({
  pose = "wave",
  className = "",
  decorative = false,
  priority = false,
}: {
  pose?: keyof typeof mascots;
  className?: string;
  decorative?: boolean;
  priority?: boolean;
}) {
  const m = mascots[pose];
  return (
    <Image
      className={`brand-mascot ${className}`}
      src={m.src}
      width={m.width}
      height={m.height}
      alt={decorative ? "" : m.alt}
      sizes="(max-width: 767px) 120px, 160px"
      priority={priority}
    />
  );
}
