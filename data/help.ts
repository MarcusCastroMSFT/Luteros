import type { 
  HelpArticle, 
  HelpCategory, 
  PopularArticle, 
  QuickAction 
} from '@/types/help';

// Help articles data - this would typically come from a database
export const helpArticles: Record<string, HelpArticle> = {
  'create-account': {
    slug: 'create-account',
    title: 'Como criar sua conta na lutteros',
    description: 'Guia passo a passo para se registrar na plataforma e começar sua jornada de aprendizado',
    category: 'Primeiros Passos',
    readTime: '3 min',
    lastUpdated: '15 de setembro, 2025',
    isPopular: true,
    difficulty: 'easy',
    relatedArticles: ['first-steps', 'profile-setup', 'privacy-settings']
  },
  'first-steps': {
    slug: 'first-steps',
    title: 'Seus primeiros passos na lutteros',
    description: 'Guia completo para navegar pela plataforma e aproveitar todos os recursos disponíveis',
    category: 'Primeiros Passos',
    readTime: '5 min',
    lastUpdated: '12 de setembro, 2025',
    isPopular: true,
    difficulty: 'easy',
    relatedArticles: ['create-account', 'profile-setup', 'community-guidelines']
  },
  'book-consultation': {
    slug: 'book-consultation',
    title: 'Como agendar uma consulta',
    description: 'Processo completo de agendamento com especialistas credenciados da lutteros',
    category: 'Consultas e Especialistas',
    readTime: '6 min',
    lastUpdated: '10 de setembro, 2025',
    isPopular: true,
    difficulty: 'medium',
    relatedArticles: ['prepare-consultation', 'video-consultation', 'cancel-reschedule']
  },
  'profile-setup': {
    slug: 'profile-setup',
    title: 'Configurando seu perfil',
    description: 'Como personalizar suas informações e preferências na plataforma',
    category: 'Primeiros Passos',
    readTime: '4 min',
    lastUpdated: '14 de setembro, 2025',
    isPopular: false,
    difficulty: 'easy',
    relatedArticles: ['create-account', 'privacy-settings', 'first-steps']
  },
  'privacy-settings': {
    slug: 'privacy-settings',
    title: 'Configurações de privacidade',
    description: 'Controle quem vê suas informações e como seus dados são utilizados',
    category: 'Primeiros Passos',
    readTime: '3 min',
    lastUpdated: '13 de setembro, 2025',
    isPopular: false,
    difficulty: 'easy',
    relatedArticles: ['profile-setup', 'community-guidelines', 'create-account']
  },
  'community-guidelines': {
    slug: 'community-guidelines',
    title: 'Diretrizes da comunidade',
    description: 'Regras para uma convivência respeitosa e segura',
    category: 'Usando a Plataforma',
    readTime: '4 min',
    lastUpdated: '05 de setembro, 2025',
    isPopular: true,
    difficulty: 'easy',
    relatedArticles: ['first-steps', 'privacy-settings']
  },
  'prepare-consultation': {
    slug: 'prepare-consultation',
    title: 'Preparando-se para a consulta',
    description: 'Dicas para aproveitar melhor seu tempo com o especialista',
    category: 'Consultas e Especialistas',
    readTime: '4 min',
    lastUpdated: '08 de setembro, 2025',
    isPopular: false,
    difficulty: 'medium',
    relatedArticles: ['book-consultation', 'video-consultation']
  },
  'video-consultation': {
    slug: 'video-consultation',
    title: 'Consultas por videochamada',
    description: 'Guia técnico para consultas online',
    category: 'Consultas e Especialistas',
    readTime: '3 min',
    lastUpdated: '06 de setembro, 2025',
    isPopular: false,
    difficulty: 'medium',
    relatedArticles: ['book-consultation', 'prepare-consultation']
  },
  'cancel-reschedule': {
    slug: 'cancel-reschedule',
    title: 'Cancelar ou reagendar consulta',
    description: 'Como alterar horários e política de cancelamento',
    category: 'Consultas e Especialistas',
    readTime: '2 min',
    lastUpdated: '04 de setembro, 2025',
    isPopular: false,
    difficulty: 'easy',
    relatedArticles: ['book-consultation', 'prepare-consultation']
  },
  'courses-access': {
    slug: 'courses-access',
    title: 'Acessando cursos e conteúdos',
    description: 'Como navegar pelos materiais educativos disponíveis na plataforma',
    category: 'Usando a Plataforma',
    readTime: '5 min',
    lastUpdated: '07 de setembro, 2025',
    isPopular: false,
    difficulty: 'easy',
    relatedArticles: ['first-steps', 'mobile-app']
  },
  'mobile-app': {
    slug: 'mobile-app',
    title: 'Usando no celular',
    description: 'Guia para a versão mobile da plataforma',
    category: 'Usando a Plataforma',
    readTime: '3 min',
    lastUpdated: '03 de setembro, 2025',
    isPopular: false,
    difficulty: 'easy',
    relatedArticles: ['courses-access', 'notifications']
  },
  'notifications': {
    slug: 'notifications',
    title: 'Gerenciando notificações',
    description: 'Como controlar alertas e lembretes da plataforma',
    category: 'Usando a Plataforma',
    readTime: '2 min',
    lastUpdated: '02 de setembro, 2025',
    isPopular: false,
    difficulty: 'easy',
    relatedArticles: ['mobile-app', 'privacy-settings']
  },
  'subscription-plans': {
    slug: 'subscription-plans',
    title: 'Planos de assinatura',
    description: 'Entenda os diferentes planos disponíveis e suas vantagens',
    category: 'Conta e Pagamentos',
    readTime: '4 min',
    lastUpdated: '09 de setembro, 2025',
    isPopular: false,
    difficulty: 'easy',
    relatedArticles: ['payment-methods', 'billing-issues']
  },
  'payment-methods': {
    slug: 'payment-methods',
    title: 'Formas de pagamento',
    description: 'Cartões, PIX, boleto e outras opções de pagamento aceitas',
    category: 'Conta e Pagamentos',
    readTime: '3 min',
    lastUpdated: '11 de setembro, 2025',
    isPopular: false,
    difficulty: 'easy',
    relatedArticles: ['subscription-plans', 'billing-issues']
  },
  'billing-issues': {
    slug: 'billing-issues',
    title: 'Problemas com cobrança',
    description: 'Soluções para questões de faturamento e cobranças incorretas',
    category: 'Conta e Pagamentos',
    readTime: '5 min',
    lastUpdated: '01 de setembro, 2025',
    isPopular: false,
    difficulty: 'medium',
    relatedArticles: ['payment-methods', 'cancel-subscription']
  },
  'cancel-subscription': {
    slug: 'cancel-subscription',
    title: 'Cancelar assinatura',
    description: 'Como cancelar sua assinatura e política de reembolso',
    category: 'Conta e Pagamentos',
    readTime: '3 min',
    lastUpdated: '30 de agosto, 2025',
    isPopular: false,
    difficulty: 'easy',
    relatedArticles: ['subscription-plans', 'billing-issues']
  }
};

// Help categories for the main help page
export const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Primeiros Passos',
    description: 'Tudo que você precisa saber para começar na lutteros',
    icon: 'Book',
    articles: [
      {
        id: 'create-account',
        title: 'Como criar sua conta',
        description: 'Passo a passo para se registrar na plataforma',
        readTime: '3 min',
        isPopular: true,
        href: '/help/create-account'
      },
      {
        id: 'first-steps',
        title: 'Seus primeiros passos na lutteros',
        description: 'Guia completo para navegar pela plataforma',
        readTime: '5 min',
        isPopular: true,
        href: '/help/first-steps'
      },
      {
        id: 'profile-setup',
        title: 'Configurando seu perfil',
        description: 'Como personalizar suas informações e preferências',
        readTime: '4 min',
        href: '/help/profile-setup'
      },
      {
        id: 'privacy-settings',
        title: 'Configurações de privacidade',
        description: 'Controle quem vê suas informações',
        readTime: '3 min',
        href: '/help/privacy-settings'
      }
    ]
  },
  {
    id: 'consultations',
    title: 'Consultas e Especialistas',
    description: 'Como agendar e aproveitar melhor suas consultas',
    icon: 'Users',
    articles: [
      {
        id: 'book-consultation',
        title: 'Como agendar uma consulta',
        description: 'Processo completo de agendamento com especialistas',
        readTime: '6 min',
        isPopular: true,
        href: '/help/book-consultation'
      },
      {
        id: 'prepare-consultation',
        title: 'Preparando-se para a consulta',
        description: 'Dicas para aproveitar melhor seu tempo com o especialista',
        readTime: '4 min',
        href: '/help/prepare-consultation'
      },
      {
        id: 'video-consultation',
        title: 'Consultas por videochamada',
        description: 'Guia técnico para consultas online',
        readTime: '3 min',
        href: '/help/video-consultation'
      },
      {
        id: 'cancel-reschedule',
        title: 'Cancelar ou reagendar consulta',
        description: 'Como alterar horários e política de cancelamento',
        readTime: '2 min',
        href: '/help/cancel-reschedule'
      }
    ]
  },
  {
    id: 'platform',
    title: 'Usando a Plataforma',
    description: 'Recursos, ferramentas e funcionalidades disponíveis',
    icon: 'Search',
    articles: [
      {
        id: 'community-guidelines',
        title: 'Diretrizes da comunidade',
        description: 'Regras para uma convivência respeitosa',
        readTime: '4 min',
        isPopular: true,
        href: '/help/community-guidelines'
      },
      {
        id: 'courses-access',
        title: 'Acessando cursos e conteúdos',
        description: 'Como navegar pelos materiais educativos',
        readTime: '5 min',
        href: '/help/courses-access'
      },
      {
        id: 'mobile-app',
        title: 'Usando no celular',
        description: 'Guia para a versão mobile da plataforma',
        readTime: '3 min',
        href: '/help/mobile-app'
      },
      {
        id: 'notifications',
        title: 'Gerenciando notificações',
        description: 'Como controlar alertas e lembretes',
        readTime: '2 min',
        href: '/help/notifications'
      }
    ]
  },
  {
    id: 'account',
    title: 'Conta e Pagamentos',
    description: 'Gerenciamento de conta, assinaturas e cobranças',
    icon: 'CheckCircle',
    articles: [
      {
        id: 'subscription-plans',
        title: 'Planos de assinatura',
        description: 'Entenda os diferentes planos disponíveis',
        readTime: '4 min',
        href: '/help/subscription-plans'
      },
      {
        id: 'payment-methods',
        title: 'Formas de pagamento',
        description: 'Cartões, PIX, boleto e outras opções',
        readTime: '3 min',
        href: '/help/payment-methods'
      },
      {
        id: 'billing-issues',
        title: 'Problemas com cobrança',
        description: 'Soluções para questões de faturamento',
        readTime: '5 min',
        href: '/help/billing-issues'
      },
      {
        id: 'cancel-subscription',
        title: 'Cancelar assinatura',
        description: 'Como cancelar e política de reembolso',
        readTime: '3 min',
        href: '/help/cancel-subscription'
      }
    ]
  }
];

export const popularArticles: PopularArticle[] = [
  {
    title: 'Como criar sua conta',
    href: '/help/create-account',
    views: '12.5k visualizações'
  },
  {
    title: 'Seus primeiros passos na lutteros',
    href: '/help/first-steps',
    views: '8.3k visualizações'
  },
  {
    title: 'Como agendar uma consulta',
    href: '/help/book-consultation',
    views: '7.1k visualizações'
  },
  {
    title: 'Diretrizes da comunidade',
    href: '/help/community-guidelines',
    views: '5.8k visualizações'
  }
];

export const quickActions: QuickAction[] = [
  {
    title: 'Chat ao Vivo',
    description: 'Converse conosco agora',
    icon: 'MessageCircle',
    action: 'chat',
    available: true
  },
  {
    title: 'Email de Suporte',
    description: 'suporte@lutteros.com.br',
    icon: 'Mail',
    action: 'email',
    available: true
  },
  {
    title: 'WhatsApp',
    description: '(11) 9999-9999',
    icon: 'Phone',
    action: 'whatsapp',
    available: true
  }
];