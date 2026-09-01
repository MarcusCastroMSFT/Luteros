import Link from "next/link";
import Image from "next/image";
import { getLogoLayout, type LogoSize } from "@/lib/logo-layout";

interface LogoProps {
  className?: string;
  iconSize?: LogoSize;
  textSize?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  asLink?: boolean;
  /** When asLink is true, open the home page in a new tab. */
  newTab?: boolean;
}

export function Logo({
  className = "",
  iconSize = "md",
  asLink = false,
  newTab = false,
}: LogoProps) {
  const layout = getLogoLayout(iconSize);
  const content = (
    <div
      className={`relative shrink-0 overflow-hidden ${className}`}
      style={{
        width: layout.viewportWidth,
        height: layout.viewportHeight,
      }}
    >
      <Image
        src="/images/logo/lutteros-logo.svg"
        alt="lutteros"
        width={layout.canvasSize}
        height={layout.canvasSize}
        className="absolute left-0 max-w-none object-contain"
        style={{ top: layout.offsetTop }}
      />
    </div>
  );

  if (asLink) {
    return (
      <Link
        href="/"
        aria-label="lutteros — Página inicial"
        className="inline-flex shrink-0 items-center"
        style={{
          width: layout.viewportWidth,
          height: layout.viewportHeight,
        }}
        {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {content}
      </Link>
    );
  }

  return content;
}
