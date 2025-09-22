export interface CommunityReply {
  id: string
  content: string
  author: string
  isAnonymous: boolean
  createdDate: string
  likes: number
  isReported: boolean
}

export interface CommunityPost {
  id: string
  title: string
  content: string
  author: string
  category: "Gravidez" | "Pós-parto" | "Suporte Contínuo" | "Paternidade" | "Fertilidade" | "Menopausa"
  subcategory: string
  status: "Ativo" | "Fechado" | "Moderação"
  replies: CommunityReply[]
  repliesCount: number
  likes: number
  isAnonymous: boolean
  createdDate: string
  lastReply: string
  tags: string[]
  isReported: boolean
}

export const sampleCommunityPosts: CommunityPost[] = [
  {
    id: '1',
    title: 'Odeio Cheiros de Cozinha 😷',
    content: 'Estou com 10 semanas e estou realmente lutando contra cheiros. Realmente não consigo suportar o cheiro de nada enquanto está cozinhando e mesmo depois que meu marido cozinhou o seguinte dia tenho que evitar descer porque ainda posso sentir o cheiro persistente de qualquer coisa que ele cozinhou para o jantar na noite anterior.',
    author: 'Anônimo',
    category: 'Gravidez',
    subcategory: 'Primeiro trimestre',
    status: 'Ativo',
    replies: [
      {
        id: 'r1-1',
        content: 'É o cheiro e o pensamento de gordura e fumaça que te incomoda? Me pergunto se mudar os métodos de cozinha poderia ajudar. Geralmente, cozinhar no vapor e ferver criarão menos cheiro e muito menos gordura.',
        author: 'Anônimo',
        isAnonymous: true,
        createdDate: '17 Setembro 2025',
        likes: 8,
        isReported: false
      },
      {
        id: 'r1-2',
        content: 'Muito compreensível... no mesmo barco. Descobri que a proteína em sopa tem sido mais fácil de consumir. Mas honestamente, quando tudo mais falha, pedi proteína pré-cozida e fiz o melhor que pude. Estou lentamente sentindo meu nível de tolerância melhorar, então espero que seja um desafio de curto prazo.',
        author: 'Anônimo',
        isAnonymous: true,
        createdDate: '17 Setembro 2025',
        likes: 5,
        isReported: false
      },
      {
        id: 'r1-3',
        content: 'Isso é muito relacionável. Você gosta de laticínios? Eu como queijo cottage, iogurte e leite integral muito. Também segundo outro comentário sobre manteiga de amendoim e atum (eu gosto com limão e pimenta!) Espero que você encontre algo, mas não se estresse muito sobre nutrição.',
        author: 'witchymagic',
        isAnonymous: false,
        createdDate: '15 Setembro 2025',
        likes: 12,
        isReported: false
      },
      {
        id: 'r1-4',
        content: 'Estou com 11 semanas e tenho odiado cheiros de comida desde a semana 6. Foi igual ao meu primeiro e durou toda a gravidez. Ele já gosta daqui, então vamos conseguir alguma ajuda profissional.',
        author: 'Anônimo',
        isAnonymous: true,
        createdDate: '14 Setembro 2025',
        likes: 3,
        isReported: false
      },
      {
        id: 'r1-5',
        content: 'Estou com 11 semanas e odeio cheiros de comida desde a semana 6. Era igual com minha primeira gravidez. Não posso nem contar para a família, então vamos ter que buscar ajuda profissional. Esses desejos estão me deixando louca.',
        author: 'Anônimo',
        isAnonymous: true,
        createdDate: '14 Setembro 2025',
        likes: 7,
        isReported: false
      },
      {
        id: 'r1-6',
        content: 'Você já tentou usar um purificador de ar? Eu comprei um para a cozinha e ajudou bastante com os cheiros persistentes.',
        author: 'Mariana L.',
        isAnonymous: false,
        createdDate: '13 Setembro 2025',
        likes: 15,
        isReported: false
      },
      {
        id: 'r1-7',
        content: 'Meu médico recomendou chupar drops de gengibre quando o enjoo pelos cheiros fica muito forte. Tem ajudado!',
        author: 'Anônimo',
        isAnonymous: true,
        createdDate: '13 Setembro 2025',
        likes: 9,
        isReported: false
      },
      {
        id: 'r1-8',
        content: 'Comigo melhorou muito depois da 12ª semana. Cada gravidez é diferente, mas não desista - geralmente passa!',
        author: 'Sofia R.',
        isAnonymous: false,
        createdDate: '12 Setembro 2025',
        likes: 12,
        isReported: false
      },
      {
        id: 'r1-9',
        content: 'Janelas abertas e ventilador ligado durante o cozimento. É o que tem me salvado nessa fase!',
        author: 'Anônimo',
        isAnonymous: true,
        createdDate: '12 Setembro 2025',
        likes: 6,
        isReported: false
      },
      {
        id: 'r1-10',
        content: 'Eu pedi para meu marido cozinhar do lado de fora quando possível. Churrasqueira, fogão portátil no quintal... funcionou!',
        author: 'Camila F.',
        isAnonymous: false,
        createdDate: '11 Setembro 2025',
        likes: 14,
        isReported: false
      }
    ],
    repliesCount: 10,
    likes: 12,
    isAnonymous: true,
    createdDate: '8 Setembro 2025',
    lastReply: '17 Setembro 2025',
    tags: ['enjoo', 'cheiros', 'primeiro-trimestre'],
    isReported: false
  },
  {
    id: '2',
    title: '5 semanas sem sintomas',
    content: 'Alguém mais com 5 semanas mas não sente quase nenhum sintoma?',
    author: 'Anônimo',
    category: 'Gravidez',
    subcategory: 'Primeiro trimestre',
    status: 'Ativo',
    replies: [
      {
        id: 'r2-1',
        content: 'Eu tive muito poucos sintomas no início. Meu médico disse que isso é completamente normal e não significa que algo está errado.',
        author: 'Carla M.',
        isAnonymous: false,
        createdDate: '16 Setembro 2025',
        likes: 15,
        isReported: false
      },
      {
        id: 'r2-2',
        content: 'Também estou com 5 semanas e só sinto um pouco de cansaço. Fiquei preocupada no início, mas minha mãe disse que ela também não teve muitos sintomas.',
        author: 'Anônimo',
        isAnonymous: true,
        createdDate: '16 Setembro 2025',
        likes: 8,
        isReported: false
      },
      {
        id: 'r2-3',
        content: 'Cada gravidez é diferente! Aproveite enquanto não tem enjoos. Eles podem aparecer mais tarde ou talvez você seja uma das sortudas que não terá.',
        author: 'Patrícia R.',
        isAnonymous: false,
        createdDate: '16 Setembro 2025',
        likes: 22,
        isReported: false
      },
      {
        id: 'r2-4',
        content: 'Estou na minha segunda gravidez e desta vez não tive nenhum sintoma até a 7ª semana. Na primeira, os enjoos começaram na 6ª. Cada bebê é único!',
        author: 'Mônica S.',
        isAnonymous: false,
        createdDate: '15 Setembro 2025',
        likes: 11,
        isReported: false
      }
    ],
    repliesCount: 8,
    likes: 6,
    isAnonymous: true,
    createdDate: '15 Setembro 2025',
    lastReply: '16 Setembro 2025',
    tags: ['sintomas', 'primeiro-trimestre', 'preocupações'],
    isReported: false
  },
  {
    id: '3',
    title: 'Ansiedade pós-parto - quando procurar ajuda?',
    content: 'Tive meu bebê há 3 meses e tenho sentido muita ansiedade. Não sei se é normal ou se devo procurar ajuda profissional.',
    author: 'Marina S.',
    category: 'Pós-parto',
    subcategory: 'Saúde mental',
    status: 'Ativo',
    replies: [
      {
        id: 'r3-1',
        content: 'Marina, é muito importante procurar ajuda. Ansiedade pós-parto é mais comum do que imaginamos. Conversei com meu médico na 6ª semana e foi a melhor decisão.',
        author: 'Luciana F.',
        isAnonymous: false,
        createdDate: '17 Setembro 2025',
        likes: 28,
        isReported: false
      },
      {
        id: 'r3-2',
        content: 'Passei pela mesma coisa. Terapia ajudou muito, junto com o apoio da família. Não hesite em procurar ajuda profissional.',
        author: 'Anônimo',
        isAnonymous: true,
        createdDate: '17 Setembro 2025',
        likes: 19,
        isReported: false
      },
      {
        id: 'r3-3',
        content: 'Se você está questionando, provavelmente é hora de procurar ajuda. Eu esperei muito tempo e me arrependo. Existem muitos recursos disponíveis.',
        author: 'Renata M.',
        isAnonymous: false,
        createdDate: '16 Setembro 2025',
        likes: 15,
        isReported: false
      },
      {
        id: 'r3-4',
        content: 'O CVV (Centro de Valorização da Vida) tem uma linha gratuita 188 disponível 24h. Também recomendo conversar com seu ginecologista.',
        author: 'Dra. Ana Santos',
        isAnonymous: false,
        createdDate: '16 Setembro 2025',
        likes: 35,
        isReported: false
      }
    ],
    repliesCount: 12,
    likes: 23,
    isAnonymous: false,
    createdDate: '12 Setembro 2025',
    lastReply: '17 Setembro 2025',
    tags: ['ansiedade', 'pós-parto', 'saúde-mental'],
    isReported: false
  },
  {
    id: '4',
    title: 'Tentando engravidar há 8 meses',
    content: 'Estamos tentando há 8 meses e nada ainda. Quando devo procurar um especialista em fertilidade?',
    author: 'Paula R.',
    category: 'Fertilidade',
    subcategory: 'TTC e fertilidade',
    status: 'Ativo',
    replies: [
      {
        id: 'r4-1',
        content: 'Geralmente recomenda-se procurar ajuda após 1 ano de tentativas, mas se você tem mais de 35 anos, pode procurar após 6 meses.',
        author: 'Dr. Carlos Mendes',
        isAnonymous: false,
        createdDate: '18 Setembro 2025',
        likes: 25,
        isReported: false
      },
      {
        id: 'r4-2',
        content: 'Eu procurei ajuda após 6 meses porque tinha histórico de problemas na família. Não custa fazer alguns exames básicos.',
        author: 'Fernanda L.',
        isAnonymous: false,
        createdDate: '18 Setembro 2025',
        likes: 12,
        isReported: false
      },
      {
        id: 'r4-3',
        content: 'Também tentei por muito tempo. O importante é não se estressar muito, mas buscar orientação médica para descartar problemas.',
        author: 'Anônimo',
        isAnonymous: true,
        createdDate: '17 Setembro 2025',
        likes: 8,
        isReported: true
      }
    ],
    repliesCount: 15,
    likes: 18,
    isAnonymous: false,
    createdDate: '10 Setembro 2025',
    lastReply: '18 Setembro 2025',
    tags: ['ttc', 'fertilidade', 'tentativas'],
    isReported: false
  },
  {
    id: '5',
    title: 'Primeiros movimentos do bebê - 18 semanas',
    content: 'Acabei de sentir os primeiros movimentos do meu bebê! É uma sensação incrível. Alguém mais nessa fase?',
    author: 'Ana C.',
    category: 'Gravidez',
    subcategory: 'Segundo trimestre',
    status: 'Ativo',
    replies: [
      {
        id: 'r5-1',
        content: 'Que momento especial! Eu senti os primeiros movimentos com 19 semanas. É uma sensação única mesmo!',
        author: 'Carla S.',
        isAnonymous: false,
        createdDate: '15 Setembro 2025',
        likes: 12,
        isReported: false
      },
      {
        id: 'r5-2',
        content: 'Estou com 20 semanas e ainda sinto os movimentos inconsistentemente. Cada bebê tem seu tempo!',
        author: 'Anônimo',
        isAnonymous: true,
        createdDate: '15 Setembro 2025',
        likes: 8,
        isReported: false
      },
      {
        id: 'r5-3',
        content: 'Aproveite esse momento! Logo ele vai estar chutando suas costelas 😅',
        author: 'Mariana L.',
        isAnonymous: false,
        createdDate: '15 Setembro 2025',
        likes: 15,
        isReported: false
      },
      {
        id: 'r5-4',
        content: 'Meu primeiro movimento foi exatamente com 18 semanas também. Parecia borboletas no estômago!',
        author: 'Anônimo',
        isAnonymous: true,
        createdDate: '14 Setembro 2025',
        likes: 9,
        isReported: false
      },
      {
        id: 'r5-5',
        content: 'É o melhor sentimento do mundo! Meu marido ficou emocionado quando conseguiu sentir também.',
        author: 'Paula R.',
        isAnonymous: false,
        createdDate: '14 Setembro 2025',
        likes: 18,
        isReported: false
      },
      {
        id: 'r5-6',
        content: 'Com o segundo filho senti mais cedo, com 16 semanas. O útero já conhece a sensação!',
        author: 'Letícia M.',
        isAnonymous: false,
        createdDate: '14 Setembro 2025',
        likes: 7,
        isReported: false
      },
      {
        id: 'r5-7',
        content: 'Registro esse momento! Eu filmei minha barriga mexendo e é uma lembrança preciosa.',
        author: 'Anônimo',
        isAnonymous: true,
        createdDate: '14 Setembro 2025',
        likes: 11,
        isReported: false
      }
    ],
    repliesCount: 7,
    likes: 25,
    isAnonymous: false,
    createdDate: '14 Setembro 2025',
    lastReply: '15 Setembro 2025',
    tags: ['movimentos', 'segundo-trimestre', 'marcos'],
    isReported: false
  },
  {
    id: '6',
    title: 'Dicas para aborto espontâneo',
    content: 'Passei por um aborto espontâneo recentemente. Alguém tem dicas sobre como lidar emocionalmente?',
    author: 'Anônimo',
    category: 'Suporte Contínuo',
    subcategory: 'Perda gestacional',
    status: 'Ativo',
    replies: [
      {
        id: 'r6-1',
        content: 'Sinto muito pela sua perda. Terapia me ajudou muito a processar a dor. Cada pessoa tem seu tempo.',
        author: 'Anônimo',
        isAnonymous: true,
        createdDate: '17 Setembro 2025',
        likes: 25,
        isReported: false
      },
      {
        id: 'r6-2',
        content: 'Passei pela mesma situação. Grupos de apoio online foram fundamentais para minha recuperação.',
        author: 'Anônimo',
        isAnonymous: true,
        createdDate: '16 Setembro 2025',
        likes: 18,
        isReported: false
      },
      {
        id: 'r6-3',
        content: 'É importante se permitir sentir a dor. Não tenha pressa para "superar". Cada luto tem seu tempo.',
        author: 'Dra. Silva',
        isAnonymous: false,
        createdDate: '16 Setembro 2025',
        likes: 32,
        isReported: false
      }
    ],
    repliesCount: 20,
    likes: 35,
    isAnonymous: true,
    createdDate: '5 Setembro 2025',
    lastReply: '17 Setembro 2025',
    tags: ['perda', 'apoio', 'emocional'],
    isReported: false
  },
  {
    id: '7',
    title: 'Papai de primeira viagem - medos e ansiedades',
    content: 'Minha esposa está grávida de 6 meses e estou muito ansioso sobre ser pai. É normal sentir tanto medo?',
    author: 'Carlos M.',
    category: 'Paternidade',
    subcategory: 'Paternidade e pediatria',
    status: 'Ativo',
    replies: [],
    repliesCount: 9,
    likes: 14,
    isAnonymous: false,
    createdDate: '11 Setembro 2025',
    lastReply: '16 Setembro 2025',
    tags: ['paternidade', 'ansiedade', 'primeira-vez'],
    isReported: false
  },
  {
    id: '8',
    title: 'Menopausa precoce aos 40',
    content: 'Fui diagnosticada com menopausa precoce. Alguém passou por isso? Como lidar?',
    author: 'Lucia F.',
    category: 'Menopausa',
    subcategory: 'Menopausa',
    status: 'Ativo',
    replies: [],
    repliesCount: 6,
    likes: 8,
    isAnonymous: false,
    createdDate: '13 Setembro 2025',
    lastReply: '18 Setembro 2025',
    tags: ['menopausa', 'precoce', 'diagnóstico'],
    isReported: false
  },
  {
    id: '9',
    title: 'Amamentação está sendo difícil',
    content: 'Meu bebê tem 2 semanas e a amamentação está sendo muito difícil. Alguma dica?',
    author: 'Anônimo',
    category: 'Pós-parto',
    subcategory: 'Amamentação',
    status: 'Ativo',
    replies: [],
    repliesCount: 11,
    likes: 19,
    isAnonymous: true,
    createdDate: '16 Setembro 2025',
    lastReply: '18 Setembro 2025',
    tags: ['amamentação', 'dificuldades', 'recém-nascido'],
    isReported: false
  },
  {
    id: '10',
    title: 'Exercícios seguros durante a gravidez',
    content: 'Quais exercícios vocês fazem durante a gravidez? Estou com 20 semanas.',
    author: 'Fernanda L.',
    category: 'Gravidez',
    subcategory: 'Segundo trimestre',
    status: 'Ativo',
    replies: [],
    repliesCount: 13,
    likes: 22,
    isAnonymous: false,
    createdDate: '9 Setembro 2025',
    lastReply: '17 Setembro 2025',
    tags: ['exercícios', 'gravidez', 'segundo-trimestre'],
    isReported: false
  },
  {
    id: '11',
    title: 'Tratamento de fertilidade - FIV',
    content: 'Vamos começar o processo de FIV no próximo mês. Alguém tem experiências para compartilhar?',
    author: 'Camila S.',
    category: 'Fertilidade',
    subcategory: 'Tratamento de fertilidade',
    status: 'Ativo',
    replies: [],
    repliesCount: 18,
    likes: 27,
    isAnonymous: false,
    createdDate: '7 Setembro 2025',
    lastReply: '18 Setembro 2025',
    tags: ['fiv', 'tratamento', 'experiências'],
    isReported: true
  },
  {
    id: '12',
    title: 'Adoção - processo no Brasil',
    content: 'Estamos considerando adoção. Alguém pode compartilhar experiências sobre o processo?',
    author: 'Roberto P.',
    category: 'Fertilidade',
    subcategory: 'Adoção e barriga de aluguel',
    status: 'Ativo',
    replies: [],
    repliesCount: 14,
    likes: 16,
    isAnonymous: false,
    createdDate: '6 Setembro 2025',
    lastReply: '15 Setembro 2025',
    tags: ['adoção', 'processo', 'brasil'],
    isReported: false
  },
  {
    id: '13',
    title: 'Post fechado para moderação',
    content: 'Este post foi fechado devido a violação das regras da comunidade.',
    author: 'Sistema',
    category: 'Suporte Contínuo',
    subcategory: 'Geral',
    status: 'Moderação',
    replies: [],
    repliesCount: 0,
    likes: 0,
    isAnonymous: false,
    createdDate: '4 Setembro 2025',
    lastReply: '4 Setembro 2025',
    tags: ['moderação'],
    isReported: false
  },
  {
    id: '14',
    title: 'Terceiro trimestre - preparativos para o parto',
    content: 'Estou com 32 semanas. Que preparativos vocês fizeram para o parto?',
    author: 'Juliana M.',
    category: 'Gravidez',
    subcategory: 'Terceiro trimestre',
    status: 'Ativo',
    replies: [],
    repliesCount: 0,
    likes: 0,
    isAnonymous: false,
    createdDate: '3 Setembro 2025',
    lastReply: '16 Setembro 2025',
    tags: ['parto', 'preparativos', 'terceiro-trimestre'],
    isReported: false
  }
]
