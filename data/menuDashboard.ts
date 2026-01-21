// Dashboard Sidebar Data
export interface SidebarUser {
  name: string;
  email: string;
  avatar: string;
}

export interface SidebarNavItem {
  title: string;
  url: string;
  icon: string;
  items?: {
    title: string;
    url: string;
  }[];
  isActive?: boolean;
}

export interface SidebarDocument {
  name: string;
  url: string;
  icon: string;
}

export interface SidebarData {
  user: SidebarUser;
  navMain: SidebarNavItem[];
  navClouds: SidebarNavItem[];
  navSecondary: SidebarNavItem[];
  documents: SidebarDocument[];
}

export const sidebarData: SidebarData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: "IconDashboard",
    },
    {
      title: "Cursos",
      url: "/dashboard/courses",
      icon: "IconListDetails",
    },
    {
      title: "Artigos",
      url: "/dashboard/articles",
      icon: "IconReport",
    },
    {
      title: "Produtos",
      url: "/dashboard/products",
      icon: "IconPackage",
    },
    {
      title: "Parceiros",
      url: "/dashboard/partners",
      icon: "IconBuildingStore",
    },
    {
      title: "Eventos",
      url: "/dashboard/events",
      icon: "IconCalendarEvent",
    },
    {
      title: "Comunidade",
      url: "/dashboard/community",
      icon: "IconDatabase",
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: "IconCamera",
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: "IconFileDescription",
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: "IconFileAi",
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: "IconSettings",
    },
    {
      title: "Get Help",
      url: "/dashboard/help",
      icon: "IconHelp",
    },
    {
      title: "Search",
      url: "/dashboard/search",
      icon: "IconSearch",
    },
  ],
  documents: [
    {
      name: "Usuários",
      url: "/dashboard/users",
      icon: "IconUsers",
    },
    {
      name: "Relatórios",
      url: "/dashboard/reports",
      icon: "IconReport",
    },
    {
      name: "Newsletter",
      url: "/dashboard/newsletter",
      icon: "IconMail",
    },
    {
      name: "Agents AI",
      url: "/dashboard/word-assistant",
      icon: "IconRobot",
    },
  ],
};
