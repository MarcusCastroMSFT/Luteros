export interface MenuSection {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}

export interface NavigationMenuItem {
  title: string;
  href?: string;
  description?: string;
  items?: {
    title: string;
    href: string;
    description: string;
  }[];
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
}

export const contactInfo: ContactInfo = {
  phone: "+1 (555) 123-4567",
  email: "suporte@lutteros.com.br",
  address: "58 Howard Street #2 San Francisco"
};

export const navigationMenu: NavigationMenuItem[] = [
  {
    title: "Início",
    href: "/"
  },
  {
    title: "Páginas",
    items: [
      {
        title: "Sobre Nós",
        href: "/about",
        description: "Saiba mais sobre nossa missão e equipe."
      },
      {
        title: "Contato",
        href: "/contact",
        description: "Entre em contato com nossa equipe de suporte."
      },
      {
        title: "FAQ",
        href: "/faq",
        description: "Perguntas frequentes e suporte."
      }
    ]
  },
  {
    title: "Eventos",
    href: "/events"
  },
  {
    title: "Artigos",
    href: "/articles"
  },
  {
    title: "Produtos",
    href: "/products"
  }
];

export const footerMenu: MenuSection[] = [
  {
    title: "Empresa",
    links: [
      { label: "Sobre", href: "/about" },
      { label: "Eventos", href: "/events" },
      { label: "Artigos", href: "/articles" }
    ]
  },
  {
    title: "Links Úteis",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Central de Ajuda", href: "/help" },
      { label: "Termos", href: "/terms" },
      { label: "Privacidade", href: "/privacy" }
    ]
  }
];

export interface SocialLink {
  name: string;
  href: string;
  icon: string;
}

export const socialLinks: SocialLink[] = [
  { name: "Instagram", href: "https://www.instagram.com/lutteros", icon: "instagram" }
];

export interface AppLink {
  name: string;
  href: string;
  platform: "apple" | "google";
}

export const appLinks: AppLink[] = [
  { name: "Baixe na Apple Store", href: "#", platform: "apple" },
  { name: "Baixe no Google Play", href: "#", platform: "google" }
];