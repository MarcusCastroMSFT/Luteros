import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { socialLinks, type SocialLink } from "@/data/menu";

const iconMap = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
};

interface SocialLinksProps {
  links?: SocialLink[];
  className?: string;
}

export function SocialLinks({ links = socialLinks, className = "" }: SocialLinksProps) {
  return (
    <div className={`flex space-x-4 ${className}`}>
      {links.map((link) => {
        const IconComponent = iconMap[link.icon as keyof typeof iconMap];
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className="text-text-secondary hover:text-primary transition-colors duration-200"
            aria-label={link.name}
          >
            <IconComponent size={20} />
          </Link>
        );
      })}
    </div>
  );
}
