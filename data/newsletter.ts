export interface Newsletter {
  id: string
  title: string
  subject: string
  type: "Newsletter" | "Promocional" | "Educacional" | "Anúncio"
  status: "Ativo" | "Rascunho" | "Inativo" | "Enviado"
  targetAudience: string
  scheduledDate: string
  openRate?: number
  clickRate?: number
  subscriberCount: number
  template: string
  author: string
  createdDate: string
}

export const sampleNewsletters: Newsletter[] = [
  {
    id: '1',
    title: 'Boletim Semanal de Saúde Sexual',
    subject: 'Dicas essenciais para sua saúde íntima esta semana',
    type: 'Newsletter',
    status: 'Enviado',
    targetAudience: 'Todos os Assinantes',
    scheduledDate: '15 Setembro 2024',
    openRate: 68.5,
    clickRate: 12.3,
    subscriberCount: 15420,
    template: 'template-semanal',
    author: 'Maria Silva',
    createdDate: '12 Setembro 2024'
  },
  {
    id: '2',
    title: 'Promoção Setembro: Consultas com Desconto',
    subject: '🩺 50% OFF em consultas de sexologia - Apenas esta semana!',
    type: 'Promocional',
    status: 'Enviado',
    targetAudience: 'Segmento Premium',
    scheduledDate: '10 Setembro 2024',
    openRate: 74.2,
    clickRate: 18.7,
    subscriberCount: 3280,
    template: 'template-promocional',
    author: 'João Santos',
    createdDate: '08 Setembro 2024'
  },
  {
    id: '3',
    title: 'Série Educativa: Métodos Contraceptivos',
    subject: 'Parte 1: Conhecendo suas opções contraceptivas',
    type: 'Educacional',
    status: 'Enviado',
    targetAudience: 'Jovens (18-25 anos)',
    scheduledDate: '05 Setembro 2024',
    openRate: 71.8,
    clickRate: 15.4,
    subscriberCount: 8950,
    template: 'template-educacional',
    author: 'Ana Costa',
    createdDate: '02 Setembro 2024'
  },
  {
    id: '4',
    title: 'Novo Curso: Comunicação no Relacionamento',
    subject: 'Aprenda a melhorar o diálogo íntimo com seu parceiro',
    type: 'Anúncio',
    status: 'Rascunho',
    targetAudience: 'Casais',
    scheduledDate: '20 Setembro 2024',
    openRate: 0,
    clickRate: 0,
    subscriberCount: 5670,
    template: 'template-curso',
    author: 'Carlos Lima',
    createdDate: '18 Setembro 2024'
  },
  {
    id: '5',
    title: 'Boletim Mensal: Saúde da Mulher',
    subject: 'Cuidados especiais para cada fase da vida feminina',
    type: 'Newsletter',
    status: 'Ativo',
    targetAudience: 'Mulheres',
    scheduledDate: '25 Setembro 2024',
    openRate: 0,
    clickRate: 0,
    subscriberCount: 9840,
    template: 'template-mensal',
    author: 'Fernanda Oliveira',
    createdDate: '20 Setembro 2024'
  },
  {
    id: '6',
    title: 'Workshop Gratuito: ISTs e Prevenção',
    subject: 'Participe do nosso workshop online gratuito sobre ISTs',
    type: 'Anúncio',
    status: 'Ativo',
    targetAudience: 'Todos os Assinantes',
    scheduledDate: '28 Setembro 2024',
    openRate: 0,
    clickRate: 0,
    subscriberCount: 15420,
    template: 'template-workshop',
    author: 'Rafael Mendes',
    createdDate: '22 Setembro 2024'
  },
  {
    id: '7',
    title: 'Black Friday: Cursos de Sexologia',
    subject: 'Última chance! 70% OFF em todos os cursos online',
    type: 'Promocional',
    status: 'Rascunho',
    targetAudience: 'Segmento Premium',
    scheduledDate: '29 Novembro 2024',
    openRate: 0,
    clickRate: 0,
    subscriberCount: 3280,
    template: 'template-blackfriday',
    author: 'Amanda Santos',
    createdDate: '18 Setembro 2024'
  },
  {
    id: '8',
    title: 'Série Educativa: Saúde Masculina',
    subject: 'Parte 1: Cuidados essenciais para homens',
    type: 'Educacional',
    status: 'Enviado',
    targetAudience: 'Homens',
    scheduledDate: '01 Setembro 2024',
    openRate: 63.7,
    clickRate: 11.2,
    subscriberCount: 7230,
    template: 'template-educacional',
    author: 'Lucia Cardoso',
    createdDate: '28 Agosto 2024'
  },
  {
    id: '9',
    title: 'Novidades da Plataforma - Agosto',
    subject: 'Confira as novas funcionalidades e conteúdos',
    type: 'Newsletter',
    status: 'Enviado',
    targetAudience: 'Todos os Assinantes',
    scheduledDate: '30 Agosto 2024',
    openRate: 59.3,
    clickRate: 8.9,
    subscriberCount: 15420,
    template: 'template-novidades',
    author: 'Bruno Lima',
    createdDate: '27 Agosto 2024'
  },
  {
    id: '10',
    title: 'Webinar: Intimidade na Terceira Idade',
    subject: 'Quebrando tabus: sexualidade após os 60 anos',
    type: 'Anúncio',
    status: 'Enviado',
    targetAudience: 'Terceira Idade',
    scheduledDate: '25 Agosto 2024',
    openRate: 78.4,
    clickRate: 22.1,
    subscriberCount: 2150,
    template: 'template-webinar',
    author: 'Carla Rodrigues',
    createdDate: '20 Agosto 2024'
  },
  {
    id: '11',
    title: 'Volta às Aulas: Educação Sexual para Jovens',
    subject: 'Recursos para pais e educadores sobre sexualidade',
    type: 'Educacional',
    status: 'Enviado',
    targetAudience: 'Pais e Educadores',
    scheduledDate: '15 Agosto 2024',
    openRate: 66.8,
    clickRate: 14.3,
    subscriberCount: 4560,
    template: 'template-educacional',
    author: 'Daniel Costa',
    createdDate: '10 Agosto 2024'
  },
  {
    id: '12',
    title: 'Pesquisa: Hábitos de Saúde Sexual',
    subject: 'Participe da nossa pesquisa e ganhe um e-book gratuito',
    type: 'Newsletter',
    status: 'Enviado',
    targetAudience: 'Todos os Assinantes',
    scheduledDate: '10 Agosto 2024',
    openRate: 52.7,
    clickRate: 6.8,
    subscriberCount: 15420,
    template: 'template-pesquisa',
    author: 'Elena Martins',
    createdDate: '05 Agosto 2024'
  },
  {
    id: '13',
    title: 'Campanha Agosto Dourado: Amamentação e Sexualidade',
    subject: 'Como conciliar amamentação e intimidade do casal',
    type: 'Educacional',
    status: 'Enviado',
    targetAudience: 'Mães e Grávidas',
    scheduledDate: '08 Agosto 2024',
    openRate: 81.2,
    clickRate: 19.6,
    subscriberCount: 3840,
    template: 'template-campanha',
    author: 'Patricia Alves',
    createdDate: '01 Agosto 2024'
  },
  {
    id: '14',
    title: 'Lançamento: App Luteros Mobile',
    subject: '📱 Baixe agora nosso novo aplicativo móvel!',
    type: 'Anúncio',
    status: 'Inativo',
    targetAudience: 'Todos os Assinantes',
    scheduledDate: '01 Outubro 2024',
    openRate: 0,
    clickRate: 0,
    subscriberCount: 15420,
    template: 'template-app',
    author: 'Marcos Pereira',
    createdDate: '15 Setembro 2024'
  },
  {
    id: '15',
    title: 'Boletim Trimestral: Relatório de Impacto',
    subject: 'Veja como estamos transformando vidas através da educação',
    type: 'Newsletter',
    status: 'Rascunho',
    targetAudience: 'Todos os Assinantes',
    scheduledDate: '30 Setembro 2024',
    openRate: 0,
    clickRate: 0,
    subscriberCount: 15420,
    template: 'template-relatorio',
    author: 'Roberto Silva',
    createdDate: '25 Setembro 2024'
  },
  {
    id: '16',
    title: 'Dia Mundial da Contracepção',
    subject: 'Especial: Métodos contraceptivos modernos e eficazes',
    type: 'Educacional',
    status: 'Ativo',
    targetAudience: 'Jovens e Adultos',
    scheduledDate: '26 Setembro 2024',
    openRate: 0,
    clickRate: 0,
    subscriberCount: 12340,
    template: 'template-especial',
    author: 'Carla Nunes',
    createdDate: '20 Setembro 2024'
  }
];
