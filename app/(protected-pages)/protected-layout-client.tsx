'use client';

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

interface SidebarUser {
  id: string;
  email?: string;
  fullName?: string | null;
  displayName?: string | null;
  avatar?: string | null;
}

interface Props {
  user: SidebarUser;
  children: React.ReactNode;
}

export function ProtectedLayoutClient({ user, children }: Props) {
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
