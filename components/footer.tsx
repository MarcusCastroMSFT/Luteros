'use client'

import { footerMenu } from "@/data/menu";
import { SocialLinks } from "@/components/social-links";
import { Subscribe } from "@/components/subscribe";
import { Logo } from "@/components/common/logo";
import Link from "next/link";

export function Footer() {
  // Using state-based year to avoid hydration mismatch and prerender issues
  const currentYear = 2026; // Static year for prerender compatibility

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-[1428px] mx-auto px-6 sm:px-8 lg:px-10 py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
          {/* Logo and Contact Info */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1 space-y-3 md:space-y-6 pb-2 md:pb-0">
            <div className="flex items-center">
              <Logo iconSize="lg" textSize="md" showText asLink />
            </div>

            <div className="flex items-center gap-2 text-sm text-text-primary">
              <SocialLinks />
              <Link
                href="https://www.instagram.com/lutteros"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                @lutteros
              </Link>
            </div>
          </div>

          {/* Menu Sections */}
          {footerMenu.map((section, index) => (
            <div key={section.title} className={`space-y-3 md:space-y-4 ${index === 0 ? 'lg:ml-8' : ''}`}>
              <h3 className="text-base md:text-lg font-semibold text-text-primary">{section.title}</h3>
              <ul className="space-y-2 md:space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-primary hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Subscribe Section */}
          <div className="col-span-2 lg:col-span-2 space-y-6 md:space-y-8">
            <Subscribe />
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-200 text-center">
          <p className="text-xs md:text-sm text-text-secondary">
            © {currentYear} lutteros. Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}
