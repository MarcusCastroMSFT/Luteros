export interface PricingFeature {
  id: string;
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  currency: string;
  popular?: boolean;
  features: PricingFeature[];
  buttonText: string;
  buttonVariant: 'outline' | 'filled';
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Gratuito',
    description: 'Perfeito para começar sua jornada de aprendizado',
    price: {
      monthly: 0,
      yearly: 0,
    },
    currency: 'R$',
    features: [
      {
        id: 'free-articles',
        text: 'Acesso a artigos básicos',
        included: true,
      },
      {
        id: 'free-courses',
        text: 'Cursos introdutórios selecionados',
        included: true,
      },
      {
        id: 'community-basic',
        text: 'Participação limitada na comunidade',
        included: true,
      },
      {
        id: 'premium-articles',
        text: 'Artigos premium e exclusivos',
        included: false,
      },
      {
        id: 'all-courses',
        text: 'Acesso completo a todos os cursos',
        included: false,
      },
      {
        id: 'events-access',
        text: 'Participação em eventos e webinars',
        included: false,
      },
      {
        id: 'priority-support',
        text: 'Suporte prioritário',
        included: false,
      },
      {
        id: 'certificates',
        text: 'Certificados de conclusão',
        included: false,
      },
    ],
    buttonText: 'Começar Gratuitamente',
    buttonVariant: 'outline',
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Acesso completo a todo conteúdo e recursos da plataforma',
    price: {
      monthly: 39.90,
      yearly: 399.00, // 10 months price (2 months free)
    },
    currency: 'R$',
    popular: true,
    features: [
      {
        id: 'free-articles',
        text: 'Acesso a artigos básicos',
        included: true,
      },
      {
        id: 'free-courses',
        text: 'Cursos introdutórios selecionados',
        included: true,
      },
      {
        id: 'community-basic',
        text: 'Participação completa na comunidade',
        included: true,
        highlight: true,
      },
      {
        id: 'premium-articles',
        text: 'Artigos premium e exclusivos',
        included: true,
        highlight: true,
      },
      {
        id: 'all-courses',
        text: 'Acesso completo a todos os cursos',
        included: true,
        highlight: true,
      },
      {
        id: 'events-access',
        text: 'Participação em eventos e webinars',
        included: true,
        highlight: true,
      },
      {
        id: 'priority-support',
        text: 'Suporte prioritário',
        included: true,
        highlight: true,
      },
      {
        id: 'certificates',
        text: 'Certificados de conclusão',
        included: true,
        highlight: true,
      },
    ],
    buttonText: 'Assinar Premium',
    buttonVariant: 'filled',
  },
];

export const pricingFAQ = [
  {
    id: 'cancel-anytime',
    question: 'Posso cancelar a qualquer momento?',
    answer: 'Sim, você pode cancelar sua assinatura a qualquer momento. Não há multas ou taxas de cancelamento.',
  },
  {
    id: 'refund-policy',
    question: 'Qual é a política de reembolso?',
    answer: 'Oferecemos reembolso total em até 7 dias após a compra, sem perguntas.',
  },
  {
    id: 'payment-methods',
    question: 'Quais formas de pagamento são aceitas?',
    answer: 'Aceitamos cartões de crédito, débito, PIX e boleto bancário.',
  },
  {
    id: 'upgrade-downgrade',
    question: 'Posso alterar meu plano depois?',
    answer: 'Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento.',
  },
];

export const yearlyDiscount = {
  percentage: 16.7, // Approximately 2 months free
  description: '2 meses grátis',
};
