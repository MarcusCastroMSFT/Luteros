"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconHelp,
  IconListDetails,
  IconMail,
  IconReport,
  IconRobot,
  IconSearch,
  IconSettings,
  IconUsers,
  IconCalendarEvent,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { Logo } from "@/components/common/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { sidebarData, SidebarData } from "@/data/menuDashboard"

type User = {
  id: string;
  email: string;
  fullName?: string | null;
  displayName?: string | null;
  avatar?: string | null;
}

// Icon mapping to convert string references to actual icons
const iconMap = {
  IconDashboard,
  IconListDetails,
  IconChartBar,
  IconCalendarEvent,
  IconUsers,
  IconCamera,
  IconFileDescription,
  IconFileAi,
  IconSettings,
  IconHelp,
  IconSearch,
  IconDatabase,
  IconReport,
  IconFileWord,
  IconRobot,
  IconMail,
}

// Convert string icon references to actual icon components
const processNavItems = (items: SidebarData['navMain']) => {
  return items.map(item => ({
    ...item,
    icon: iconMap[item.icon as keyof typeof iconMap] || item.icon
  }))
}

const processDocuments = (documents: SidebarData['documents']) => {
  return documents.map(doc => ({
    name: doc.name,
    url: doc.url,
    icon: iconMap[doc.icon as keyof typeof iconMap] || doc.icon
  }))
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: User | null;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const processedData = {
    ...sidebarData,
    navMain: processNavItems(sidebarData.navMain),
    navClouds: processNavItems(sidebarData.navClouds),
    navSecondary: processNavItems(sidebarData.navSecondary),
    documents: processDocuments(sidebarData.documents),
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="p-1.5">
              <Logo 
                iconSize="lg" 
                showText={false} 
                className="flex items-center justify-center"
              />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={processedData.navMain} />
        <NavDocuments items={processedData.documents} />
        <NavSecondary items={processedData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
