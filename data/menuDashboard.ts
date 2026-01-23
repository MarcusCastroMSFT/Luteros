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
  newsletter: SidebarDocument[];
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
      url: "/admin",
      icon: "IconDashboard",
    },
    {
      title: "Cursos",
      url: "/admin/courses",
      icon: "IconListDetails",
    },
    {
      title: "Artigos",
      url: "/admin/articles",
      icon: "IconReport",
    },
    {
      title: "Produtos",
      url: "/admin/products",
      icon: "IconPackage",
    },
    {
      title: "Parceiros",
      url: "/admin/partners",
      icon: "IconBuildingStore",
    },
    {
      title: "Eventos",
      url: "/admin/events",
      icon: "IconCalendarEvent",
    },
    {
      title: "Comunidade",
      url: "/admin/community",
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
  navSecondary: [],
  newsletter: [
    {
      name: "Inscritos",
      url: "/admin/newsletter",
      icon: "IconUsers",
    },
    {
      name: "Campanhas",
      url: "/admin/newsletter/campaigns",
      icon: "IconSend",
    },
  ],
  documents: [
    {
      name: "Usuários",
      url: "/admin/users",
      icon: "IconUsers",
    },
    {
      name: "E-mails do Sistema",
      url: "/admin/system-emails",
      icon: "IconMail",
    },
    {
      name: "Agents AI",
      url: "/admin/word-assistant",
      icon: "IconRobot",
    },
  ],
};
