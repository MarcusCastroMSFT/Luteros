import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  className?: string;
  iconSize?: "sm" | "md" | "lg" | "xl";
  textSize?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  asLink?: boolean;
}

const iconSizes = {
  sm: { width: 80, height: 80 },
  md: { width: 120, height: 120 },
  lg: { width: 160, height: 160 },
  xl: { width: 200, height: 200 }
};

export function Logo({ 
  className = "", 
  iconSize = "md",
  asLink = false
}: LogoProps) {
  const content = (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/images/logo/luteros-light.svg"
        alt="Luteros"
        width={iconSizes[iconSize].width}
        height={iconSizes[iconSize].height}
        className="object-contain"
      />
    </div>
  );

  if (asLink) {
    return (
      <Link href="/" className="flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
