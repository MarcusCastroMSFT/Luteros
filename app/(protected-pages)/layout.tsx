'use client';

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

// Allowed roles for dashboard access
const ALLOWED_ROLES = ['ADMIN', 'INSTRUCTOR'] as const;

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, userProfile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Client-side redirect fallback (middleware handles server-side protection)
    // This catches edge cases where client-side auth state differs from server
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    // Check if user has an allowed role (admin or instructor)
    if (!isLoading && user && userProfile) {
      const userRole = userProfile.role || 'STUDENT';
      if (!ALLOWED_ROLES.includes(userRole as typeof ALLOWED_ROLES[number])) {
        // Redirect students and unauthorized users to home page
        router.push('/');
      }
    }
  }, [user, userProfile, isLoading, router]);

  // Show loading state while checking authentication and role
  if (isLoading || (user && !userProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render content if user doesn't have permission
  if (!user || !userProfile) {
    return null;
  }

  const userRole = userProfile.role || 'STUDENT';
  if (!ALLOWED_ROLES.includes(userRole as typeof ALLOWED_ROLES[number])) {
    return null;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user} />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
