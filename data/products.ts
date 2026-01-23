import { Product } from '@/types/product';

export const sampleProducts: Product[] = [
  {
    id: '1',
    slug: 'suplementos-naturais-gravida',
    title: 'Suplementos Naturais para Gestantes',
    description: 'Linha completa de suplementos naturais desenvolvidos especificamente para gestantes e lactantes. Inclui ácido fólico, ferro, cálcio, ômega-3 e vitaminas essenciais para o desenvolvimento saudável do bebê e bem-estar da mãe.',
    shortDescription: 'Suplementos essenciais para uma gravidez saudável com desconto exclusivo.',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    partner: {
      id: '1',
      name: 'VitaMãe',
      logo: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      website: 'https://vitamae.com.br'
    },
    discount: {
      percentage: 25,
      type: 'percentage',
      originalPrice: 199.90,
      discountedPrice: 149.93
    },
    promoCode: 'lutteros25',
    category: 'Saúde e Bem-estar',
    tags: ['suplementos', 'gravidez', 'vitaminas', 'natural'],
    availability: 'all',
    validUntil: '2025-12-31',
    termsAndConditions: 'Válido para compras acima de R$ 100. Não cumulativo com outras promoções. Válido apenas no site oficial do parceiro.',
    howToUse: [
      'Acesse o site do parceiro através do link fornecido',
      'Adicione os produtos desejados ao carrinho',
      'No checkout, insira o código promocional lutteros25',
      'Confirme o desconto e finalize a compra'
    ],
    features: [
      'Ácido fólico para prevenção de defeitos neurais',
      'Ferro quelado de alta absorção',
      'Cálcio e Vitamina D para ossos fortes',
      'Ômega-3 DHA para desenvolvimento cerebral',
      'Vitaminas do complexo B para energia',
      'Livre de corantes e conservantes artificiais'
    ],
    isActive: true,
    isFeatured: true,
    createdDate: '2025-09-15',
    usageCount: 142,
    maxUsages: 500
  },
  {
    id: '2',
    slug: 'consultas-nutricao-online',
    title: 'Consultas de Nutrição Online',
    description: 'Sessões de consultoria nutricional online com nutricionistas especializados em nutrição materno-infantil. Inclui plano alimentar personalizado, acompanhamento mensal e suporte via WhatsApp.',
    shortDescription: 'Orientação nutricional especializada com desconto para membros.',
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    partner: {
      id: '2',
      name: 'NutriMama Consultoria',
      logo: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      website: 'https://nutrimama.com.br'
    },
    discount: {
      percentage: 30,
      type: 'percentage',
      originalPrice: 150.00,
      discountedPrice: 105.00
    },
    promoCode: 'lutteros30',
    category: 'Consultoria',
    tags: ['nutrição', 'consulta', 'online', 'especialista'],
    availability: 'members',
    validUntil: '2025-11-30',
    termsAndConditions: 'Válido apenas para membros ativos da plataforma. Desconto aplicável na primeira consulta. Agendamento sujeito à disponibilidade.',
    howToUse: [
      'Faça login em sua conta de membro',
      'Acesse o link do parceiro',
      'Selecione o profissional desejado',
      'Agende sua consulta inserindo o código lutteros30',
      'Confirme o agendamento e realize o pagamento'
    ],
    features: [
      'Consulta individual de 60 minutos',
      'Plano alimentar personalizado',
      'Cardápio semanal detalhado',
      'Lista de compras organizada',
      'Suporte via WhatsApp por 7 dias',
      'Material educativo digital'
    ],
    isActive: true,
    isFeatured: true,
    createdDate: '2025-09-10',
    usageCount: 78,
    maxUsages: 200
  },
  {
    id: '3',
    slug: 'roupas-maternidade-amamentacao',
    title: 'Roupas de Maternidade e Amamentação',
    description: 'Coleção completa de roupas para gestantes e lactantes. Inclui blusas de amamentação, vestidos confortáveis, pijamas, sutiãs de amamentação e roupas íntimas especiais.',
    shortDescription: 'Moda prática e confortável para todas as fases da maternidade.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    partner: {
      id: '3',
      name: 'Moda Maternal',
      logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      website: 'https://modamaternal.com.br'
    },
    discount: {
      percentage: 20,
      type: 'percentage',
      originalPrice: 89.90,
      discountedPrice: 71.92
    },
    promoCode: 'MAMAE20',
    category: 'Moda',
    tags: ['roupas', 'maternidade', 'amamentação', 'conforto'],
    availability: 'all',
    validUntil: '2025-10-31',
    termsAndConditions: 'Válido para toda a loja online. Frete grátis para compras acima de R$ 150. Troca garantida em até 30 dias.',
    howToUse: [
      'Navegue pela loja online do parceiro',
      'Escolha as peças desejadas',
      'No carrinho, insira o código MAMAE20',
      'Verifique se o desconto foi aplicado',
      'Complete sua compra'
    ],
    features: [
      'Tecidos naturais e respiráveis',
      'Modelos discretos para amamentação',
      'Variedade de tamanhos e cores',
      'Design moderno e confortável',
      'Fácil manutenção e durabilidade',
      'Desenvolvido por mães para mães'
    ],
    isActive: true,
    isFeatured: false,
    createdDate: '2025-09-08',
    usageCount: 95,
    maxUsages: 300
  },
  {
    id: '4',
    slug: 'curso-preparo-parto',
    title: 'Curso de Preparo para o Parto',
    description: 'Curso online completo de preparação para o parto com obstetras e doulas experientes. Inclui técnicas de respiração, exercícios, plano de parto e acompanhamento psicológico.',
    shortDescription: 'Preparação completa para um parto seguro e consciente.',
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    partner: {
      id: '4',
      name: 'Instituto Nascer',
      logo: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      website: 'https://institutonascer.com.br'
    },
    discount: {
      percentage: 40,
      type: 'percentage',
      originalPrice: 297.00,
      discountedPrice: 178.20
    },
    promoCode: 'NASCERlutteros',
    category: 'Educação',
    tags: ['parto', 'curso', 'preparação', 'nascimento'],
    availability: 'members',
    validUntil: '2025-12-15',
    termsAndConditions: 'Exclusivo para membros. Inclui acesso vitalício ao conteúdo. Certificado de participação incluído.',
    howToUse: [
      'Acesse o site do Instituto Nascer',
      'Faça sua inscrição no curso',
      'Na página de pagamento, insira NASCERlutteros',
      'Complete o pagamento com desconto',
      'Receba acesso imediato por email'
    ],
    features: [
      '12 módulos de aulas gravadas',
      'Lives mensais com especialistas',
      'Grupo privado no Telegram',
      'Material de apoio em PDF',
      'Exercícios práticos semanais',
      'Certificado de conclusão'
    ],
    isActive: true,
    isFeatured: true,
    createdDate: '2025-09-05',
    usageCount: 56,
    maxUsages: 150
  },
  {
    id: '5',
    slug: 'produtos-higiene-bebe',
    title: 'Produtos de Higiene para Bebê',
    description: 'Kit completo de produtos de higiene para bebês com ingredientes naturais e hipoalergênicos. Inclui sabonete líquido, shampoo, creme hidratante, pomada para assaduras e óleo de massagem.',
    shortDescription: 'Cuidados suaves e naturais para a pele delicada do bebê.',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    partner: {
      id: '5',
      name: 'Baby Care Natural',
      logo: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      website: 'https://babycarenatural.com.br'
    },
    discount: {
      percentage: 15,
      type: 'percentage',
      originalPrice: 129.90,
      discountedPrice: 110.42
    },
    promoCode: 'BABY15',
    category: 'Cuidados Infantis',
    tags: ['bebê', 'higiene', 'natural', 'hipoalergênico'],
    availability: 'all',
    validUntil: '2025-11-15',
    termsAndConditions: 'Válido para kits promocionais. Produtos testados dermatologicamente. Garantia de satisfação ou dinheiro de volta.',
    howToUse: [
      'Visite a loja online Baby Care Natural',
      'Selecione o kit de produtos',
      'Adicione ao carrinho',
      'Use o código BABY15 no checkout',
      'Finalize com desconto aplicado'
    ],
    features: [
      'Ingredientes 100% naturais',
      'Livre de parabenos e sulfatos',
      'Testado dermatologicamente',
      'Fragrância suave e hipoalergênica',
      'Embalagens recicláveis',
      'Desenvolvido por pediatras'
    ],
    isActive: true,
    isFeatured: false,
    createdDate: '2025-09-01',
    usageCount: 134,
    maxUsages: 400
  },
  {
    id: '6',
    slug: 'sessoes-fisioterapia-gestante',
    title: 'Sessões de Fisioterapia para Gestantes',
    description: 'Programa de fisioterapia especializada para gestantes focado no alívio de dores, fortalecimento do assoalho pélvico e preparação corporal para o parto. Inclui avaliação inicial e plano personalizado.',
    shortDescription: 'Fisioterapia especializada para o bem-estar durante a gestação.',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    partner: {
      id: '6',
      name: 'FisioMama Clínica',
      logo: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      website: 'https://fisiomama.com.br'
    },
    discount: {
      percentage: 25,
      type: 'percentage',
      originalPrice: 120.00,
      discountedPrice: 90.00
    },
    promoCode: 'FISIO25',
    category: 'Saúde e Bem-estar',
    tags: ['fisioterapia', 'gestante', 'alívio', 'fortalecimento'],
    availability: 'members',
    validUntil: '2025-12-31',
    termsAndConditions: 'Válido para pacote de 4 sessões. Agendamento conforme disponibilidade. Desconto para membros ativos.',
    howToUse: [
      'Entre em contato com a FisioMama',
      'Agende sua avaliação inicial',
      'Mencione o código FISIO25',
      'Confirme seu pacote com desconto',
      'Inicie seu tratamento personalizado'
    ],
    features: [
      'Avaliação postural completa',
      'Exercícios para alívio de dores',
      'Fortalecimento do core',
      'Técnicas de relaxamento',
      'Orientações para o parto',
      'Acompanhamento individualizado'
    ],
    isActive: true,
    isFeatured: false,
    createdDate: '2025-08-28',
    usageCount: 45,
    maxUsages: 100
  }
];

export const productCategories = [
  { id: '1', name: 'Saúde e Bem-estar', slug: 'saude-bem-estar', count: 3 },
  { id: '2', name: 'Consultoria', slug: 'consultoria', count: 1 },
  { id: '3', name: 'Moda', slug: 'moda', count: 1 },
  { id: '4', name: 'Educação', slug: 'educacao', count: 1 },
  { id: '5', name: 'Cuidados Infantis', slug: 'cuidados-infantis', count: 1 }
];
