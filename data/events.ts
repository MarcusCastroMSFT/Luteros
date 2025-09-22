import { Event } from '@/components/events/eventCard';
import { Speaker } from '@/components/common/speakers';

interface ExtendedEvent extends Event {
  cost: string;
  totalSlots: number;
  bookedSlots: number;
  image: string;
  fullDescription: string;
  content: string[];
  speakers: Speaker[];
}

export const sampleEvents: ExtendedEvent[] = [
  {
    id: '1',
    title: 'Conferência de Educação em Segurança Alimentar',
    slug: 'conferencia-educacao-seguranca-alimentar',
    location: 'São Paulo, SP',
    date: '2025-09-25',
    time: '8:00 - 17:00',
    cost: 'R$435',
    totalSlots: 87,
    bookedSlots: 4,
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    description: 'Junte-se a especialistas da indústria para discutir as últimas tendências em educação sobre segurança alimentar e programas de conscientização do consumidor.',
    fullDescription: 'Esta conferência abrangente reunirá especialistas líderes em segurança alimentar para discutir as mais recentes inovações e práticas em educação do consumidor. Aprenda sobre metodologias eficazes, estudos de caso e estratégias para melhorar a conscientização sobre segurança alimentar.',
    content: [
      'Não há pré-requisitos de habilidades para este curso, embora seja útil se você estiver familiarizado com a operação do seu computador.',
      'Você pode fazer este curso usando Mac, PC ou máquina Linux.',
      'É recomendado baixar o editor de texto gratuito Komodo.'
    ],
    speakers: [
      {
        id: '1',
        name: 'Theresa Webb',
        title: 'Especialista em Segurança Alimentar',
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      },
      {
        id: '2',
        name: 'Ronald Richards',
        title: 'Consultor em Nutrição',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      },
      {
        id: '3',
        name: 'Savannah Nguyen',
        title: 'Pesquisadora em Saúde Pública',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80'
      },
      {
        id: '4',
        name: 'Kristin Watson',
        title: 'Diretora de Qualidade',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=761&q=80'
      }
    ]
  },
  {
    id: '2',
    title: 'Cúpula de Saúde e Bem-Estar 2025',
    slug: 'cupula-saude-bem-estar-2025',
    location: 'Rio de Janeiro, RJ',
    date: '2025-10-15',
    time: '9:00 - 18:00',
    cost: 'R$520',
    totalSlots: 150,
    bookedSlots: 23,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    description: 'Uma cúpula abrangente focando em saúde mental, nutrição e práticas de bem-estar para o estilo de vida moderno.',
    fullDescription: 'A Cúpula de Saúde e Bem-Estar 2025 é um evento transformador que explora as dimensões físicas, mentais e emocionais do bem-estar. Com palestrantes internacionais e workshops práticos.',
    content: [
      'Workshop de mindfulness e meditação',
      'Sessões sobre nutrição funcional',
      'Práticas de exercício e movimento consciente'
    ],
    speakers: [
      {
        id: '5',
        name: 'Dr. Maria Silva',
        title: 'Psiquiatra e Especialista em Bem-Estar',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
      },
      {
        id: '6',
        name: 'Prof. João Santos',
        title: 'Nutricionista Clínico',
        image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      }
    ]
  },
  {
    id: '3',
    title: 'Workshop de Educação em Saúde Sexual',
    slug: 'workshop-educacao-saude-sexual',
    location: 'Belo Horizonte, MG',
    date: '2025-11-08',
    time: '14:00 - 20:00',
    cost: 'Gratuito',
    totalSlots: 45,
    bookedSlots: 12,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    description: 'Workshop interativo para profissionais de saúde sobre metodologias de educação sexual baseadas em evidências.',
    fullDescription: 'Este workshop oferece ferramentas práticas e metodologias baseadas em evidências para profissionais que trabalham com educação sexual.',
    content: [
      'Metodologias ativas de ensino',
      'Comunicação efetiva sobre sexualidade',
      'Ferramentas digitais para educação sexual'
    ],
    speakers: [
      {
        id: '7',
        name: 'Dra. Ana Costa',
        title: 'Sexóloga e Educadora',
        image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
      }
    ]
  },
  {
    id: '4',
    title: 'Fórum de Inovação em Saúde Digital',
    slug: 'forum-inovacao-saude-digital',
    location: 'Porto Alegre, RS',
    date: '2025-11-22',
    time: '10:00 - 16:00',
    cost: 'R$680',
    totalSlots: 100,
    bookedSlots: 34,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    description: 'Explorando a interseção entre tecnologia e saúde, apresentando soluções de saúde digital de ponta.',
    fullDescription: 'O futuro da saúde é digital. Este fórum apresenta as mais recentes inovações em telemedicina, IA na saúde e aplicativos de bem-estar.',
    content: [
      'Tendências em telemedicina',
      'Inteligência artificial na saúde',
      'Aplicativos de monitoramento de saúde'
    ],
    speakers: [
      {
        id: '8',
        name: 'Dr. Carlos Tech',
        title: 'Especialista em Saúde Digital',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      }
    ]
  },
  {
    id: '5',
    title: 'Simpósio de Saúde da Mulher',
    slug: 'simposio-saude-mulher',
    location: 'Brasília, DF',
    date: '2025-12-05',
    time: '8:30 - 17:30',
    cost: 'R$390',
    totalSlots: 120,
    bookedSlots: 45,
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    description: 'Discussões abrangentes sobre questões de saúde da mulher, pesquisa e abordagens de tratamento inovadoras.',
    fullDescription: 'Um simpósio dedicado às questões específicas da saúde feminina, com foco em prevenção, diagnóstico e tratamento.',
    content: [
      'Saúde reprodutiva e planejamento familiar',
      'Prevenção do câncer ginecológico',
      'Saúde mental da mulher'
    ],
    speakers: [
      {
        id: '9',
        name: 'Dra. Fernanda Lima',
        title: 'Ginecologista e Obstetra',
        image: 'https://images.unsplash.com/photo-1594824388654-86d3aab0eca1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      }
    ]
  },
  {
    id: '6',
    title: 'Conferência de Direitos Reprodutivos',
    slug: 'conferencia-direitos-reprodutivos',
    location: 'Salvador, BA',
    date: '2025-12-18',
    time: '9:00 - 19:00',
    cost: 'R$450',
    totalSlots: 200,
    bookedSlots: 67,
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    description: 'Conferência internacional abordando direitos reprodutivos, mudanças políticas e acesso à saúde globalmente.',
    fullDescription: 'Uma conferência fundamental sobre direitos reprodutivos, políticas públicas e acesso universal à saúde reprodutiva.',
    content: [
      'Políticas públicas em saúde reprodutiva',
      'Direitos humanos e reprodução',
      'Acesso a contraceptivos e planejamento familiar'
    ],
    speakers: [
      {
        id: '10',
        name: 'Prof. Roberto Direitos',
        title: 'Advogado em Direitos Humanos',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      }
    ]
  },
  {
    id: '7',
    title: 'Workshop de Primeiros Socorros Avançados',
    slug: 'workshop-primeiros-socorros-avancados',
    location: 'Recife, PE',
    date: '2026-01-15',
    time: '8:00 - 18:00',
    cost: 'R$320',
    totalSlots: 50,
    bookedSlots: 18,
    image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    description: 'Treinamento intensivo em primeiros socorros avançados para profissionais de saúde e emergência.',
    fullDescription: 'Um workshop prático e intensivo que aborda técnicas avançadas de primeiros socorros, incluindo RCP, manejo de traumas e situações de emergência.',
    content: [
      'Técnicas avançadas de RCP',
      'Manejo de emergências traumáticas',
      'Uso de equipamentos de emergência',
      'Protocolos de atendimento pré-hospitalar'
    ],
    speakers: [
      {
        id: '11',
        name: 'Dr. Marcus Emergency',
        title: 'Especialista em Medicina de Emergência',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      },
      {
        id: '12',
        name: 'Enfª Patricia Rescue',
        title: 'Enfermeira de Emergência',
        image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      }
    ]
  },
  {
    id: '8',
    title: 'Congresso de Medicina Preventiva',
    slug: 'congresso-medicina-preventiva',
    location: 'Curitiba, PR',
    date: '2026-02-08',
    time: '7:30 - 19:00',
    cost: 'R$580',
    totalSlots: 180,
    bookedSlots: 92,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    description: 'Congresso focado em estratégias de prevenção de doenças e promoção da saúde populacional.',
    fullDescription: 'Um congresso abrangente sobre medicina preventiva, explorando estratégias inovadoras para prevenção de doenças crônicas e promoção da saúde coletiva.',
    content: [
      'Prevenção de doenças cardiovasculares',
      'Estratégias de vacinação em massa',
      'Políticas de saúde pública preventiva',
      'Medicina baseada em evidências'
    ],
    speakers: [
      {
        id: '13',
        name: 'Dra. Isabel Prevention',
        title: 'Especialista em Medicina Preventiva',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
      },
      {
        id: '14',
        name: 'Dr. Paulo Health',
        title: 'Epidemiologista',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      }
    ]
  },
  {
    id: '9',
    title: 'Seminário de Saúde Mental Ocupacional',
    slug: 'seminario-saude-mental-ocupacional',
    location: 'Goiânia, GO',
    date: '2026-02-25',
    time: '8:30 - 17:00',
    cost: 'Gratuito',
    totalSlots: 85,
    bookedSlots: 31,
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    description: 'Seminário sobre saúde mental no ambiente de trabalho, burnout e estratégias de bem-estar corporativo.',
    fullDescription: 'Um seminário essencial que aborda os desafios da saúde mental no ambiente corporativo, oferecendo ferramentas práticas para prevenção e tratamento.',
    content: [
      'Identificação precoce de burnout',
      'Criação de ambientes de trabalho saudáveis',
      'Técnicas de manejo do estresse ocupacional',
      'Programas de bem-estar empresarial'
    ],
    speakers: [
      {
        id: '15',
        name: 'Dra. Sofia Workplace',
        title: 'Psicóloga Organizacional',
        image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
      },
      {
        id: '16',
        name: 'Dr. Ricardo Mind',
        title: 'Psiquiatra Especialista em Trabalho',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      }
    ]
  },
  {
    id: '10',
    title: 'Conferência Internacional de Telemedicina',
    slug: 'conferencia-internacional-telemedicina',
    location: 'Florianópolis, SC',
    date: '2026-03-12',
    time: '8:00 - 18:30',
    cost: 'R$750',
    totalSlots: 250,
    bookedSlots: 125,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    description: 'Conferência internacional sobre os avanços da telemedicina e consultas médicas virtuais.',
    fullDescription: 'Uma conferência de prestígio internacional que reúne especialistas globais em telemedicina para discutir as últimas inovações em consultas virtuais, diagnóstico remoto e cuidados de saúde digitais.',
    content: [
      'Plataformas de consulta virtual avançadas',
      'Diagnóstico remoto com IA',
      'Regulamentação em telemedicina',
      'Casos de sucesso internacionais'
    ],
    speakers: [
      {
        id: '17',
        name: 'Dr. Michael Digital',
        title: 'Pioneiro em Telemedicina',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      },
      {
        id: '18',
        name: 'Dra. Sarah Connect',
        title: 'Especialista em Saúde Digital',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
      },
      {
        id: '19',
        name: 'Dr. Tech Innovation',
        title: 'CTO de Startup de Saúde',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      }
    ]
  },
  {
    id: '11',
    title: 'Workshop de Nutrição Esportiva',
    slug: 'workshop-nutricao-esportiva',
    location: 'Fortaleza, CE',
    date: '2026-03-28',
    time: '9:00 - 16:30',
    cost: 'R$295',
    totalSlots: 60,
    bookedSlots: 28,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    description: 'Workshop prático sobre nutrição esportiva, suplementação e performance atlética.',
    fullDescription: 'Um workshop intensivo que combina teoria e prática da nutrição esportiva, oferecendo conhecimentos essenciais para otimização da performance atlética através da alimentação adequada.',
    content: [
      'Macronutrientes para performance',
      'Suplementação esportiva baseada em evidências',
      'Hidratação e eletrólitos',
      'Planejamento nutricional periodizado'
    ],
    speakers: [
      {
        id: '20',
        name: 'Nutricionista Amanda Sports',
        title: 'Especialista em Nutrição Esportiva',
        image: 'https://images.unsplash.com/photo-1594824388654-86d3aab0eca1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      },
      {
        id: '21',
        name: 'Dr. Bruno Athlete',
        title: 'Médico do Esporte',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      }
    ]
  },
  {
    id: '12',
    title: 'Simpósio de Cuidados Paliativos',
    slug: 'simposio-cuidados-paliativos',
    location: 'Manaus, AM',
    date: '2026-04-15',
    time: '8:30 - 17:30',
    cost: 'R$520',
    totalSlots: 90,
    bookedSlots: 42,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    description: 'Simpósio sobre cuidados paliativos, controle da dor e qualidade de vida em pacientes terminais.',
    fullDescription: 'Um simpósio sensível e essencial que aborda os aspectos médicos, psicológicos e éticos dos cuidados paliativos, oferecendo uma abordagem humanizada para o cuidado de pacientes em fase terminal.',
    content: [
      'Controle avançado da dor',
      'Comunicação com pacientes e famílias',
      'Aspectos éticos em cuidados paliativos',
      'Suporte psicológico e espiritual'
    ],
    speakers: [
      {
        id: '22',
        name: 'Dra. Clara Compassion',
        title: 'Especialista em Cuidados Paliativos',
        image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
      },
      {
        id: '23',
        name: 'Dr. Gentle Care',
        title: 'Oncologista Clínico',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      },
      {
        id: '24',
        name: 'Psicóloga Marina Hope',
        title: 'Psicóloga Hospitalar',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80'
      }
    ]
  }
];

// Export just the basic Event type for the components that don't need extended info
export type { Event } from '@/components/events/eventCard';
export type { ExtendedEvent};
