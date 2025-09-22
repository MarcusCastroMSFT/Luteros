import Link from "next/link";
import { Mail } from "lucide-react";
import { footerMenu, contactInfo } from "@/data/menu";
import { SocialLinks } from "@/components/social-links";
import { AppLinks } from "@/components/app-links";
import { Subscribe } from "@/components/subscribe";
import { Logo } from "@/components/common/logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-[1428px] mx-auto px-6 sm:px-8 lg:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Logo and Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center">
              <Logo iconSize="xl" textSize="lg" showText asLink />
            </div>
            
            <div className="space-y-3 text-sm text-text-primary">
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-text-primary" />
                <span>{contactInfo.email}</span>
              </div>
            </div>

            <SocialLinks />
          </div>

          {/* Menu Sections */}
          {footerMenu.map((section, index) => (
            <div key={section.title} className={`space-y-4 ${index === 0 ? 'lg:ml-8' : ''}`}>
              <h3 className="text-lg font-semibold text-text-primary">{section.title}</h3>
              <ul className="space-y-3">
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
          <div className="lg:col-span-2 space-y-8">
            <Subscribe />
            <AppLinks />
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-text-secondary">
            © {currentYear} Luteros. Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}
