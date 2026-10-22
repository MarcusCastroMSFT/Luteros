export type NavIconKey =
  | "courses"
  | "articles"
  | "events"
  | "products"
  | "about"
  | "contact"
  | "faq"
  | "help";

export interface NavLinkItem {
  title: string;
  href: string;
  description: string;
  icon: NavIconKey;
}

/** Main destinations, in order of importance. */
export const primaryNav: NavLinkItem[] = [
  {
    title: "Cursos",
    href: "/courses",
    description: "Aprenda no seu ritmo com especialistas em saúde sexual.",
    icon: "courses",
  },
  {
    title: "Artigos",
    href: "/articles",
    description: "Leituras confiáveis, claras e sem tabu.",
    icon: "articles",
  },
  {
    title: "Eventos",
    href: "/events",
    description: "Encontros, palestras e lives para participar.",
    icon: "events",
  },
  {
    title: "Produtos",
    href: "/products",
    description: "Seleção de parceiros e ofertas para o seu bem-estar.",
    icon: "products",
  },
];

/** Institutional pages, shown in the "Mais" menu. */
export const moreNav: NavLinkItem[] = [
  {
    title: "Sobre nós",
    href: "/about",
    description: "Nossa missão, valores e equipe.",
    icon: "about",
  },
  {
    title: "Contato",
    href: "/contact",
    description: "Fale com a nossa equipe de suporte.",
    icon: "contact",
  },
  {
    title: "Perguntas frequentes",
    href: "/faq",
    description: "Respostas rápidas para as dúvidas mais comuns.",
    icon: "faq",
  },
  {
    title: "Central de Ajuda",
    href: "/help",
    description: "Guias e tutoriais para usar a plataforma.",
    icon: "help",
  },
];

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export const footerColumns: FooterColumn[] = [
  {
    title: "Explorar",
    links: [
      { label: "Cursos", href: "/courses" },
      { label: "Artigos", href: "/articles" },
      { label: "Eventos", href: "/events" },
    ],
  },
  {
    title: "Lutteros",
    links: [
      { label: "Produtos e parceiros", href: "/products" },
      { label: "Sobre nós", href: "/about" },
    ],
  },
  {
    title: "Ajuda",
    links: [
      { label: "Central de Ajuda", href: "/help" },
      { label: "Perguntas frequentes", href: "/faq" },
      { label: "Contato", href: "/contact" },
    ],
  },
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
