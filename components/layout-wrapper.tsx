'use client';

import { usePathname } from 'next/navigation';
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/common/scrollToTop";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

// Define route patterns that should use the dashboard layout
const PROTECTED_ROUTES = ['/dashboard'];
const PUBLIC_ROUTES = ['/login', '/register'];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  const isProtected = isProtectedRoute(pathname);
  const isPublic = isPublicRoute(pathname);

  // Dashboard/Protected layout - no header/footer
  if (isProtected) {
    return (
      <main className="min-h-screen">
        {children}
      </main>
    );
  }

  // Public pages (login/register) - minimal layout
  if (isPublic) {
    return (
      <main className="min-h-screen">
        {children}
      </main>
    );
  }

  // Default layout - full site layout with header/footer
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
