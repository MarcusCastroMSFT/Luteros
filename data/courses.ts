import { Course, Instructor } from '@/types/course';

// Re-export types for API usage
export type { Course, Instructor } from '@/types/course';

// Sample instructors
const instructors: Instructor[] = [
  {
    id: '1',
    name: 'Dra. Ana Carolina Silva',
    slug: 'ana-carolina-silva',
    title: 'Sexóloga e Terapeuta Sexual',
    bio: 'Especialista em sexualidade humana com mais de 15 anos de experiência. Formada em Medicina com especialização em sexologia.',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    reviewsCount: 1247,
    studentsCount: 12450,
    coursesCount: 8,
    socialLinks: {
      linkedin: 'https://linkedin.com/in/ana-carolina-silva',
      website: 'https://anacarolina.com.br'
    }
  },
  {
    id: '2',
    name: 'Prof. Maria Fernanda Costa',
    slug: 'maria-fernanda-costa',
    title: 'Educadora Sexual e Psicóloga',
    bio: 'Psicóloga especializada em educação sexual e relacionamentos. Autora de diversos livros sobre sexualidade saudável.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
    reviewsCount: 892,
    studentsCount: 9870,
    coursesCount: 6,
    socialLinks: {
      instagram: '@mariafernandacosta',
      website: 'https://mariafernanda.com.br'
    }
  },
  {
    id: '3',
    name: 'Dr. Carlos Eduardo Santos',
    slug: 'carlos-eduardo-santos',
    title: 'Ginecologista e Especialista em Saúde Reprodutiva',
    bio: 'Médico ginecologista com foco em saúde reprodutiva e planejamento familiar. Coordenador de programas de educação sexual.',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    rating: 4.7,
    reviewsCount: 654,
    studentsCount: 7890,
    coursesCount: 5,
    socialLinks: {
      linkedin: 'https://linkedin.com/in/carlos-eduardo-santos'
    }
  },
  {
    id: '4',
    name: 'Dra. Juliana Ribeiro',
    slug: 'juliana-ribeiro',
    title: 'Enfermeira Obstétrica e Educadora Perinatal',
    bio: 'Enfermeira obstétrica especializada em educação perinatal e saúde da mulher. Facilitadora de grupos de gestantes.',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    reviewsCount: 1156,
    studentsCount: 15230,
    coursesCount: 7,
    socialLinks: {
      instagram: '@julianaribeiro.obstetrica',
      website: 'https://julianaribeiro.com.br'
    }
  },
  {
    id: '5',
    name: 'Prof. Ricardo Almeida',
    slug: 'ricardo-almeida',
    title: 'Terapeuta de Casais e Especialista em Relacionamentos',
    bio: 'Psicólogo e terapeuta de casais com mais de 12 anos de experiência em terapia sexual e relacionamentos.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    rating: 4.6,
    reviewsCount: 743,
    studentsCount: 8650,
    coursesCount: 4,
    socialLinks: {
      linkedin: 'https://linkedin.com/in/ricardo-almeida-terapeuta'
    }
  }
];

export const sampleCourses: Course[] = [
  {
    id: '1',
    slug: 'educacao-sexual-completa-adolescentes',
    title: 'Educação Sexual Completa para Adolescentes',
    description: 'Um curso abrangente sobre educação sexual destinado a adolescentes, abordando anatomia, puberdade, relacionamentos saudáveis e prevenção.',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    instructor: instructors[0],
    price: 149.90,
    originalPrice: 199.90,
    lessonsCount: 24,
    sectionsCount: 6,
    duration: '8 horas',
    rating: 4.9,
    reviewsCount: 342,
    studentsCount: 2150,
    level: 'Iniciante',
    category: 'Educação Sexual',
    status: 'Ativo',
    isBestSeller: true,
    tags: ['adolescentes', 'educação-sexual', 'puberdade', 'relacionamentos'],
    lastUpdated: '15 Setembro 2025',
    language: 'Português',
    includes: ['24 aulas em vídeo', 'Material de apoio em PDF', 'Certificado de conclusão', 'Acesso vitalício'],
    learningObjectives: [
      'Compreender a anatomia e fisiologia reprodutiva',
      'Identificar as mudanças da puberdade',
      'Desenvolver relacionamentos saudáveis',
      'Conhecer métodos contraceptivos',
      'Prevenir infecções sexualmente transmissíveis',
      'Entender conceitos de consentimento',
      'Reconhecer diferentes orientações sexuais',
      'Lidar com pressão social e bullying',
      'Comunicar-se de forma assertiva',
      'Desenvolver autoestima e autoconhecimento',
      'Identificar sinais de abuso sexual',
      'Buscar ajuda profissional quando necessário'
    ],
    requirements: [
      'Não há pré-requisitos para este curso, é adequado para adolescentes a partir dos 12 anos.',
      'Recomenda-se o acompanhamento de pais ou responsáveis durante o aprendizado.',
      'É importante ter um ambiente seguro e privado para assistir às aulas.',
      'Material de apoio pode ser impresso para consulta posterior.'
    ],
    aboutCourse: 'Este curso foi desenvolvido especialmente para adolescentes que estão passando pelas transformações da puberdade e precisam de informações confiáveis sobre sexualidade. Abordaremos temas importantes como anatomia, relacionamentos, prevenção e autoconhecimento de forma educativa e respeitosa.\n\nO conteúdo é apresentado de maneira adequada para a faixa etária, com linguagem clara e exemplos práticos. Nosso objetivo é formar jovens conscientes e responsáveis, capazes de tomar decisões informadas sobre sua saúde sexual e relacionamentos.',
    sections: [
      {
        id: 's1',
        title: 'Introdução à Sexualidade',
        totalDuration: '1h 30min',
        lessons: [
          {
            id: 'l1',
            title: 'Bem-vindos ao curso',
            description: 'Apresentação do curso e objetivos de aprendizagem',
            type: 'video',
            duration: '10:30',
            isPreview: true,
            order: 1
          },
          {
            id: 'l2',
            title: 'O que é sexualidade?',
            description: 'Conceitos básicos sobre sexualidade humana',
            type: 'video',
            duration: '25:45',
            order: 2
          },
          {
            id: 'l3',
            title: 'Mitos e verdades sobre sexo',
            description: 'Desmistificando conceitos errôneos',
            type: 'article',
            duration: '15:00',
            order: 3
          }
        ]
      },
      {
        id: 's2',
        title: 'Anatomia e Fisiologia Reprodutiva',
        totalDuration: '2h 15min',
        lessons: [
          {
            id: 'l4',
            title: 'Sistema reprodutor feminino',
            description: 'Anatomia básica e funcionamento',
            type: 'video',
            duration: '35:00',
            order: 4
          },
          {
            id: 'l5',
            title: 'Sistema reprodutor masculino',
            description: 'Anatomia básica e funcionamento',
            type: 'video',
            duration: '30:00',
            order: 5
          },
          {
            id: 'l6',
            title: 'Ciclo menstrual',
            description: 'Entendendo as fases do ciclo',
            type: 'video',
            duration: '25:00',
            order: 6
          },
          {
            id: 'l7',
            title: 'Hormônios e puberdade',
            description: 'Como os hormônios afetam o desenvolvimento',
            type: 'article',
            duration: '20:00',
            order: 7
          }
        ]
      },
      {
        id: 's3',
        title: 'Relacionamentos e Comunicação',
        totalDuration: '1h 45min',
        lessons: [
          {
            id: 'l8',
            title: 'Tipos de relacionamentos',
            description: 'Explorando diferentes formas de relacionamento',
            type: 'video',
            duration: '20:00',
            order: 8
          },
          {
            id: 'l9',
            title: 'Comunicação assertiva',
            description: 'Como se expressar de forma clara e respeitosa',
            type: 'video',
            duration: '25:00',
            order: 9
          },
          {
            id: 'l10',
            title: 'Consentimento',
            description: 'A importância do consentimento em relacionamentos',
            type: 'video',
            duration: '30:00',
            order: 10
          },
          {
            id: 'l11',
            title: 'Primeiros relacionamentos',
            description: 'Dicas para relacionamentos saudáveis',
            type: 'article',
            duration: '15:00',
            order: 11
          }
        ]
      },
      {
        id: 's4',
        title: 'Métodos Contraceptivos',
        totalDuration: '1h 30min',
        lessons: [
          {
            id: 'l12',
            title: 'Tipos de contraceptivos',
            description: 'Visão geral dos métodos disponíveis',
            type: 'video',
            duration: '25:00',
            order: 12
          },
          {
            id: 'l13',
            title: 'Camisinha masculina e feminina',
            description: 'Como usar corretamente',
            type: 'video',
            duration: '20:00',
            order: 13
          },
          {
            id: 'l14',
            title: 'Métodos hormonais',
            description: 'Pílula, implante e outros métodos',
            type: 'video',
            duration: '25:00',
            order: 14
          },
          {
            id: 'l15',
            title: 'Eficácia dos métodos',
            description: 'Comparando a eficácia de cada método',
            type: 'article',
            duration: '20:00',
            order: 15
          }
        ]
      },
      {
        id: 's5',
        title: 'Prevenção de ISTs',
        totalDuration: '1h 20min',
        lessons: [
          {
            id: 'l16',
            title: 'O que são ISTs?',
            description: 'Infecções sexualmente transmissíveis mais comuns',
            type: 'video',
            duration: '20:00',
            order: 16
          },
          {
            id: 'l17',
            title: 'Prevenção eficaz',
            description: 'Métodos de prevenção das ISTs',
            type: 'video',
            duration: '25:00',
            order: 17
          },
          {
            id: 'l18',
            title: 'Testes e exames',
            description: 'Quando e onde fazer testes',
            type: 'video',
            duration: '20:00',
            order: 18
          },
          {
            id: 'l19',
            title: 'Tratamentos disponíveis',
            description: 'Como tratar as principais ISTs',
            type: 'article',
            duration: '15:00',
            order: 19
          }
        ]
      },
      {
        id: 's6',
        title: 'Autoestima e Autoconhecimento',
        totalDuration: '1h 10min',
        lessons: [
          {
            id: 'l20',
            title: 'Desenvolvendo autoestima',
            description: 'Como construir uma imagem positiva de si mesmo',
            type: 'video',
            duration: '25:00',
            order: 20
          },
          {
            id: 'l21',
            title: 'Lidando com pressão social',
            description: 'Como resistir à pressão dos pares',
            type: 'video',
            duration: '20:00',
            order: 21
          },
          {
            id: 'l22',
            title: 'Identificando abuso',
            description: 'Reconhecendo sinais de violência sexual',
            type: 'video',
            duration: '15:00',
            order: 22
          },
          {
            id: 'l23',
            title: 'Buscando ajuda',
            description: 'Onde e como buscar apoio profissional',
            type: 'article',
            duration: '10:00',
            order: 23
          }
        ]
      }
    ]
  },
  {
    id: '2',
    slug: 'gravidez-parto-pos-parto-completo',
    title: 'Gravidez, Parto e Pós-parto: Guia Completo',
    description: 'Acompanhamento completo desde a concepção até o pós-parto, incluindo cuidados com o bebê e amamentação.',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    video: 'https://www.youtube.com/watch?v=Hm5xDzlgeX8',
    instructor: instructors[3],
    price: 189.90,
    originalPrice: 249.90,
    lessonsCount: 32,
    sectionsCount: 8,
    duration: '12 horas',
    rating: 4.8,
    reviewsCount: 567,
    studentsCount: 3280,
    level: 'Iniciante',
    category: 'Maternidade',
    isBestSeller: true,
    tags: ['gravidez', 'parto', 'pós-parto', 'amamentação', 'cuidados-bebê'],
    lastUpdated: '10 Setembro 2025',
    language: 'Português',
    includes: ['32 aulas em vídeo', '15 podcasts', 'Plano de parto personalizável', 'Grupo privado de suporte'],
    sections: [
      {
        id: 's1',
        title: 'Preparação para a Gravidez',
        totalDuration: '2h 15min',
        lessons: [
          {
            id: 'l1',
            title: 'Planejando a gravidez',
            description: 'Como se preparar física e emocionalmente',
            type: 'video',
            duration: '18:30',
            isPreview: true,
            order: 1
          },
          {
            id: 'l2',
            title: 'Fertilidade e concepção',
            description: 'Entendendo o ciclo reprodutivo',
            type: 'video',
            duration: '22:15',
            order: 2
          },
          {
            id: 'l3',
            title: 'Exames pré-concepcionais',
            description: 'Lista completa de exames recomendados',
            type: 'article',
            duration: '12:00',
            order: 3
          }
        ]
      },
      {
        id: 's2',
        title: 'Primeiro Trimestre',
        totalDuration: '1h 45min',
        lessons: [
          {
            id: 'l4',
            title: 'Mudanças no corpo',
            description: 'O que esperar nas primeiras semanas',
            type: 'video',
            duration: '20:30',
            order: 4
          },
          {
            id: 'l5',
            title: 'Enjoos e desconfortos',
            description: 'Como lidar com os sintomas comuns',
            type: 'video',
            duration: '15:45',
            order: 5
          }
        ]
      },
      {
        id: 's3',
        title: 'Segundo Trimestre',
        totalDuration: '1h 30min',
        lessons: [
          {
            id: 'l6',
            title: 'Exames do segundo trimestre',
            description: 'Ultrassom morfológico e outros exames',
            type: 'video',
            duration: '25:00',
            order: 6
          }
        ]
      }
    ]
  },
  {
    id: '3',
    slug: 'relacionamentos-saudaveis-comunicacao',
    title: 'Relacionamentos Saudáveis e Comunicação Íntima',
    description: 'Aprenda a construir relacionamentos saudáveis com base na comunicação efetiva e intimidade emocional.',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    video: 'https://www.youtube.com/watch?v=3IJH0KFgRl4',
    instructor: instructors[4],
    price: 129.90,
    originalPrice: 179.90,
    lessonsCount: 18,
    sectionsCount: 5,
    duration: '6 horas',
    rating: 4.7,
    reviewsCount: 289,
    studentsCount: 1890,
    level: 'Iniciante',
    category: 'Relacionamentos',
    tags: ['relacionamentos', 'comunicação', 'intimidade', 'casais'],
    lastUpdated: '12 Setembro 2025',
    language: 'Português',
    includes: ['18 aulas em vídeo', 'Exercícios práticos para casais', 'Templates de comunicação'],
    sections: []
  },
  {
    id: '4',
    slug: 'metodos-contraceptivos-planejamento-familiar',
    title: 'Métodos Contraceptivos e Planejamento Familiar',
    description: 'Guia completo sobre métodos contraceptivos, eficácia, efeitos colaterais e planejamento familiar responsável.',
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    video: 'https://www.youtube.com/watch?v=KQY9K6SU_P0',
    instructor: instructors[2],
    price: 99.90,
    originalPrice: 139.90,
    lessonsCount: 15,
    sectionsCount: 4,
    duration: '5 horas',
    rating: 4.6,
    reviewsCount: 234,
    studentsCount: 1650,
    level: 'Iniciante',
    category: 'Relacionamentos',
    tags: ['contraceptivos', 'planejamento-familiar', 'saúde-reprodutiva'],
    lastUpdated: '8 Setembro 2025',
    language: 'Português',
    includes: ['15 aulas em vídeo', 'Comparativo de métodos em PDF', 'Quiz interativo'],
    sections: []
  },
  {
    id: '5',
    slug: 'menopausa-climaterio-sexualidade-madura',
    title: 'Menopausa, Climatério e Sexualidade Madura',
    description: 'Entenda as mudanças do climatério e como manter uma vida sexual saudável após os 40 anos.',
    image: 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    video: 'https://www.youtube.com/watch?v=R7bHCs_iu9w',
    instructor: instructors[0],
    price: 119.90,
    originalPrice: 159.90,
    lessonsCount: 20,
    sectionsCount: 5,
    duration: '7 horas',
    rating: 4.8,
    reviewsCount: 198,
    studentsCount: 1320,
    level: 'Intermediário',
    category: 'Saúde da Mulher',
    tags: ['menopausa', 'climatério', 'sexualidade-madura', 'hormônios'],
    lastUpdated: '14 Setembro 2025',
    language: 'Português',
    includes: ['20 aulas em vídeo', '10 episódios de podcast', 'Diário de sintomas digital'],
    sections: []
  },
  {
    id: '6',
    slug: 'introducao-terapia-sexual',
    title: 'Introdução à Terapia Sexual',
    description: 'Curso introdutório sobre terapia sexual, abordando disfunções sexuais comuns e técnicas terapêuticas.',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    video: 'https://www.youtube.com/watch?v=p7bfOZek9t4',
    instructor: instructors[0],
    price: 179.90,
    originalPrice: 229.90,
    lessonsCount: 28,
    sectionsCount: 7,
    duration: '10 horas',
    rating: 4.9,
    reviewsCount: 145,
    studentsCount: 890,
    level: 'Avançado',
    category: 'Terapia Sexual',
    status: 'Rascunho',
    tags: ['terapia-sexual', 'disfunções', 'técnicas-terapêuticas'],
    lastUpdated: '5 Setembro 2025',
    language: 'Português',
    includes: ['28 aulas em vídeo', 'Casos clínicos reais', 'Bibliografia especializada'],
    sections: []
  },
  {
    id: '7',
    slug: 'diversidade-sexual-identidade-genero',
    title: 'Diversidade Sexual e Identidade de Gênero',
    description: 'Compreenda a diversidade sexual e de gênero, promovendo inclusão e respeito às diferenças.',
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    video: 'https://www.youtube.com/watch?v=F6Cosrx7EZ0',
    instructor: instructors[1],
    price: 109.90,
    originalPrice: 149.90,
    lessonsCount: 16,
    sectionsCount: 4,
    duration: '5.5 horas',
    rating: 4.7,
    reviewsCount: 312,
    studentsCount: 2100,
    level: 'Iniciante',
    category: 'Educação Sexual',
    tags: ['lgbtqia+', 'identidade-gênero', 'diversidade', 'inclusão'],
    lastUpdated: '11 Setembro 2025',
    language: 'Português',
    includes: ['16 aulas em vídeo', 'Glossário de termos', 'Histórias reais de pessoas LGBTQIA+'],
    sections: []
  },
  {
    id: '8',
    slug: 'saude-sexual-masculina',
    title: 'Saúde Sexual Masculina',
    description: 'Abordagem completa sobre saúde sexual masculina, incluindo prevenção e tratamento de disfunções.',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    video: 'https://www.youtube.com/watch?v=GzlHe6wHvMs',
    instructor: instructors[2],
    price: 139.90,
    originalPrice: 189.90,
    lessonsCount: 22,
    sectionsCount: 6,
    duration: '8 horas',
    rating: 4.5,
    reviewsCount: 187,
    studentsCount: 1450,
    level: 'Intermediário',
    category: 'Saúde Masculina',
    tags: ['saúde-masculina', 'disfunção-erétil', 'próstata', 'prevenção'],
    lastUpdated: '7 Setembro 2025',
    language: 'Português',
    includes: ['22 aulas em vídeo', 'Checklist de exames preventivos', 'Consulta online com especialista'],
    sections: []
  },
  {
    id: '9',
    slug: 'educacao-sexual-infantil-pais',
    title: 'Educação Sexual Infantil para Pais',
    description: 'Como abordar temas de sexualidade com crianças de forma adequada e respeitosa.',
    image: 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    video: 'https://www.youtube.com/watch?v=8DRb5ALNqro',
    instructor: instructors[1],
    price: 89.90,
    originalPrice: 119.90,
    lessonsCount: 12,
    sectionsCount: 3,
    duration: '4 horas',
    rating: 4.8,
    reviewsCount: 423,
    studentsCount: 2850,
    level: 'Iniciante',
    category: 'Educação Sexual',
    isBestSeller: true,
    tags: ['educação-infantil', 'pais', 'desenvolvimento', 'proteção'],
    lastUpdated: '13 Setembro 2025',
    language: 'Português',
    includes: ['12 aulas em vídeo', 'Livros infantis recomendados', 'Scripts de conversas por idade'],
    sections: []
  },
  {
    id: '10',
    slug: 'fertilidade-reproducao-assistida',
    title: 'Fertilidade e Reprodução Assistida',
    description: 'Entenda os processos de fertilidade e as técnicas de reprodução assistida disponíveis.',
    image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    video: 'https://www.youtube.com/watch?v=nQz5u6SMXCY',
    instructor: instructors[2],
    price: 159.90,
    originalPrice: 199.90,
    lessonsCount: 26,
    sectionsCount: 6,
    duration: '9 horas',
    rating: 4.6,
    reviewsCount: 156,
    studentsCount: 1180,
    level: 'Intermediário',
    category: 'Relacionamentos',
    tags: ['fertilidade', 'reprodução-assistida', 'fiv', 'tratamentos'],
    lastUpdated: '9 Setembro 2025',
    language: 'Português',
    includes: ['26 aulas em vídeo', 'Calculadora de ovulação', 'Guia de clínicas no Brasil'],
    sections: []
  },
  {
    id: '11',
    slug: 'sexualidade-terceira-idade',
    title: 'Sexualidade na Terceira Idade',
    description: 'Mantenha uma vida sexual ativa e saudável após os 60 anos.',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    video: 'https://www.youtube.com/watch?v=CfJ4r6D1zjY',
    instructor: instructors[0],
    price: 99.90,
    originalPrice: 129.90,
    lessonsCount: 14,
    sectionsCount: 4,
    duration: '5 horas',
    rating: 4.7,
    reviewsCount: 89,
    studentsCount: 670,
    level: 'Iniciante',
    category: 'Relacionamentos',
    tags: ['terceira-idade', 'idosos', 'sexualidade-madura', 'qualidade-vida'],
    lastUpdated: '6 Setembro 2025',
    language: 'Português',
    includes: ['14 aulas em vídeo', 'Exercícios de intimidade', 'Dicas médicas especializadas'],
    sections: []
  },
  {
    id: '12',
    slug: 'prevencao-ist-saude-sexual',
    title: 'Prevenção de ISTs e Saúde Sexual',
    description: 'Aprenda sobre prevenção de infecções sexualmente transmissíveis e cuidados com a saúde sexual.',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    video: 'https://www.youtube.com/watch?v=2ck8m2_sEqo',
    instructor: instructors[2],
    price: 79.90,
    originalPrice: 109.90,
    lessonsCount: 10,
    sectionsCount: 3,
    duration: '3.5 horas',
    rating: 4.9,
    reviewsCount: 267,
    studentsCount: 1920,
    level: 'Iniciante',
    category: 'Relacionamentos',
    tags: ['ist', 'prevenção', 'saúde-sexual', 'proteção'],
    lastUpdated: '16 Setembro 2025',
    language: 'Português',
    includes: ['10 aulas em vídeo', 'Guia de exames preventivos', 'Mapa de centros de testagem'],
    sections: []
  },
  {
    id: '13',
    slug: 'psicologia-sexual-comportamento',
    title: 'Psicologia Sexual e Comportamento Humano',
    description: 'Explore os aspectos psicológicos da sexualidade e do comportamento sexual humano.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    video: 'https://www.youtube.com/watch?v=v8KqTwwj1rw',
    instructor: instructors[1],
    price: 169.90,
    originalPrice: 219.90,
    lessonsCount: 30,
    sectionsCount: 8,
    duration: '11 horas',
    rating: 4.6,
    reviewsCount: 124,
    studentsCount: 780,
    level: 'Avançado',
    category: 'Educação Sexual',
    status: 'Inativo',
    tags: ['psicologia-sexual', 'comportamento', 'mente', 'sexualidade'],
    lastUpdated: '4 Setembro 2025',
    language: 'Português',
    includes: ['30 aulas em vídeo', 'Estudos de caso', 'Artigos científicos atualizados'],
    sections: []
  },
  {
    id: '14',
    slug: 'amamentacao-vinculo-mae-bebe',
    title: 'Amamentação e Vínculo Mãe-Bebê',
    description: 'Guia completo sobre amamentação, desde a preparação até o desmame, fortalecendo o vínculo familiar.',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    video: 'https://www.youtube.com/watch?v=mK9lGMRnLnM',
    instructor: instructors[3],
    price: 119.90,
    originalPrice: 159.90,
    lessonsCount: 18,
    sectionsCount: 5,
    duration: '6.5 horas',
    rating: 4.9,
    reviewsCount: 378,
    studentsCount: 2640,
    level: 'Iniciante',
    category: 'Maternidade',
    isBestSeller: true,
    tags: ['amamentação', 'vínculo', 'maternidade', 'cuidados-bebê'],
    lastUpdated: '17 Setembro 2025',
    language: 'Português',
    includes: ['18 aulas em vídeo', 'Diário de amamentação', 'Consultoria com especialista'],
    sections: []
  },
  {
    id: '15',
    slug: 'violencia-sexual-prevencao-apoio',
    title: 'Violência Sexual: Prevenção e Apoio',
    description: 'Curso sensível sobre prevenção da violência sexual, identificação de sinais e apoio às vítimas.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    video: 'https://www.youtube.com/watch?v=7lZHG_wCm8M',
    instructor: instructors[1],
    price: 0,
    lessonsCount: 8,
    sectionsCount: 2,
    duration: '3 horas',
    rating: 4.8,
    reviewsCount: 892,
    studentsCount: 5640,
    level: 'Iniciante',
    category: 'Terapia Sexual',
    tags: ['violência-sexual', 'prevenção', 'apoio', 'direitos'],
    lastUpdated: '18 Setembro 2025',
    language: 'Português',
    includes: ['8 aulas em vídeo', 'Rede de apoio nacional', 'Material informativo'],
    sections: []
  }
];
