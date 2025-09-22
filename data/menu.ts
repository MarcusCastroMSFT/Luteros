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
  email: "support@lutteros.com",
  address: "58 Howard Street #2 San Francisco"
};

export const navigationMenu: NavigationMenuItem[] = [
  {
    title: "Home",
    items: [
      {
        title: "Homepage",
        href: "/",
        description: "Discover our featured courses and latest updates."
      },
      {
        title: "About Us",
        href: "/about",
        description: "Learn more about our mission and team."
      },
      {
        title: "Contact",
        href: "/contact",
        description: "Get in touch with our support team."
      }
    ]
  },
  {
    title: "Cursos",
    href: "/courses"
  },
  {
    title: "Pages",
    items: [
      {
        title: "Instructors",
        href: "/instructors",
        description: "Meet our expert teaching team."
      },
      {
        title: "Testimonials",
        href: "/testimonials",
        description: "Success stories from our students."
      },
      {
        title: "Pricing",
        href: "/pricing",
        description: "Find the perfect plan for your learning journey."
      },
      {
        title: "FAQ",
        href: "/faq",
        description: "Frequently asked questions and support."
      },
      {
        title: "Careers",
        href: "/careers",
        description: "Join our growing team of educators."
      },
      {
        title: "Partnerships",
        href: "/partnerships",
        description: "Corporate training and educational partnerships."
      }
    ]
  },
  {
    title: "Eventos",
    href: "/events"
  },
  {
    title: "Comunidade",
    href: "/community"
  },
  {
    title: "Blog",
    href: "/blog"
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
      { label: "Cursos", href: "/courses" },
      { label: "Eventos", href: "/events" },
      { label: "Comunidade", href: "/community" },
      { label: "Especialistas", href: "/specialists" },
      { label: "Blog", href: "/blog" }
    ]
  },
  {
    title: "Links Úteis",
    links: [
      { label: "Testemunhos", href: "/testimonials" },
      { label: "Preços", href: "/pricing" },
      { label: "FAQs", href: "/faqs" },
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
  { name: "Facebook", href: "#", icon: "facebook" },
  { name: "Twitter", href: "#", icon: "twitter" },
  { name: "Instagram", href: "#", icon: "instagram" },
  { name: "LinkedIn", href: "#", icon: "linkedin" }
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