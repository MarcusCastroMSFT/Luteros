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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavUser user={processedData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
