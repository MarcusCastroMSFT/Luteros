import type { HelpArticle, HelpCategory } from '@/types/help';

export const SUPPORT_EMAIL = 'contato@lutteros.com.br';

const articles: HelpArticle[] = [
  {
    slug: 'criar-conta',
    title: 'Como criar sua conta e entrar',
    description: 'Crie sua conta com e-mail e senha ou com o Google, e recupere o acesso se esquecer a senha.',
    category: 'Primeiros passos',
    icon: 'sprout',
    related: ['perfil', 'meus-cursos'],
    sections: [
      {
        heading: 'Criar a conta',
        steps: [
          'Abra a página Criar conta.',
          'Informe seu nome completo e seu e-mail, escolha uma senha e repita a senha para confirmar.',
          'Envie o formulário. Se preferir, escolha Continuar com Google.',
        ],
        paragraphs: ['Ao criar a conta, você declara que leu e concorda com os Termos de Uso e com a Política de Privacidade.'],
        links: [
          { href: '/register', label: 'Criar conta' },
          { href: '/terms', label: 'Termos de Uso' },
          { href: '/privacy', label: 'Política de Privacidade' },
        ],
      },
      {
        heading: 'Entrar',
        paragraphs: [
          'Na página Entrar, use o e-mail e a senha cadastrados ou escolha Continuar com Google. Se você chegou pelo link de um curso, ao entrar volta para a página dele.',
        ],
        links: [{ href: '/login', label: 'Entrar' }],
      },
      {
        heading: 'Esqueceu a senha?',
        steps: [
          'Na página Entrar, escolha Esqueceu sua senha?',
          'Informe o e-mail da conta e siga as instruções enviadas para ele.',
          'Se o link não funcionar, solicite um novo link.',
        ],
        links: [{ href: '/forgot-password', label: 'Recuperar senha' }],
      },
    ],
  },
  {
    slug: 'perfil',
    title: 'Como editar seu perfil',
    description: 'Atualize seus dados, suas informações profissionais, suas redes e suas preferências de e-mail.',
    category: 'Primeiros passos',
    icon: 'care',
    related: ['notificacoes', 'comprar-curso'],
    sections: [
      {
        paragraphs: ['Abra Meu perfil e escolha Editar Perfil. Depois de alterar os campos, selecione Salvar Alterações.'],
        links: [{ href: '/profile', label: 'Abrir meu perfil' }],
      },
      {
        heading: 'O que você pode atualizar',
        bullets: [
          'Dados pessoais: nome completo, nome de exibição, biografia, telefone, CPF ou CNPJ e data de nascimento.',
          'Informações profissionais: título ou cargo, empresa e site.',
          'Redes: LinkedIn, Twitter/X e Instagram.',
          'Preferências: notificações por e-mail e e-mails de marketing.',
        ],
      },
      {
        heading: 'CPF ou CNPJ',
        paragraphs: [
          'Ele pode ser solicitado na compra de um curso pago, para gerar a cobrança. Depois de informado, fica salvo no seu perfil e pode ser reaproveitado nas próximas compras.',
        ],
      },
    ],
  },
  {
    slug: 'meus-cursos',
    title: 'Como acessar seus cursos',
    description: 'Encontre os cursos em andamento e concluídos e saiba o que fazer se um curso não aparecer.',
    category: 'Cursos e artigos',
    icon: 'courses',
    related: ['comprar-curso', 'acesso-curso-pago'],
    sections: [
      {
        paragraphs: [
          'Entre na conta usada na inscrição ou na compra e abra Meus Cursos. Lá você encontra os cursos em andamento e os concluídos.',
        ],
        links: [{ href: '/courses/my-courses', label: 'Abrir Meus Cursos' }],
      },
      {
        heading: 'Não encontrou um curso?',
        bullets: [
          'Confira se você entrou na mesma conta usada na compra: o mesmo e-mail ou o mesmo acesso com Google.',
          'Em cursos pagos, o acesso é liberado depois da confirmação do pagamento.',
          'Se o pagamento foi confirmado e o curso não aparece, escreva para a equipe informando o nome do curso e o e-mail da conta.',
        ],
        links: [{ href: '/contact', label: 'Falar com a equipe' }],
      },
    ],
  },
  {
    slug: 'comprar-curso',
    title: 'Como comprar um curso e liberar o acesso',
    description: 'Veja como funciona a compra, quando o acesso é liberado e como pedir reembolso.',
    category: 'Cursos e artigos',
    icon: 'products',
    related: ['meus-cursos', 'acesso-curso-pago'],
    sections: [
      {
        heading: 'Como comprar',
        steps: [
          'Abra a página do curso e confira a descrição, as aulas e o valor.',
          'Entre na sua conta, se ainda não tiver entrado.',
          'Escolha a opção de inscrição ou compra. Se for solicitado, informe seu CPF ou CNPJ.',
          'Você será levado à página de pagamento, onde escolhe entre as formas de pagamento disponíveis.',
        ],
        links: [{ href: '/courses', label: 'Explorar cursos' }],
      },
      {
        heading: 'Quando o acesso é liberado',
        paragraphs: [
          'O acesso é liberado depois que o pagamento é confirmado. Enquanto o pagamento estiver pendente, o conteúdo do curso não fica disponível.',
          'O tempo de confirmação depende da forma de pagamento escolhida. Se você saiu da página de pagamento antes de concluir, volte à página do curso para continuar o pagamento pendente.',
        ],
      },
      {
        heading: 'Desistência e reembolso',
        paragraphs: [
          'Você pode desistir em até 7 dias depois da confirmação da compra, com reembolso integral, conforme a seção 6 dos Termos de Uso. Com o reembolso, o acesso ao curso é encerrado.',
        ],
        links: [{ href: '/terms#reembolso', label: 'Ler a seção de reembolso' }],
      },
    ],
  },
  {
    slug: 'acesso-curso-pago',
    title: 'Por que o acesso a um curso pago foi limitado?',
    description: 'Entenda como a Lutteros protege o conteúdo pago e o que fazer ao trocar de rede ou de dispositivo.',
    category: 'Cursos e artigos',
    icon: 'evidence',
    related: ['meus-cursos', 'comprar-curso'],
    sections: [
      {
        paragraphs: [
          'A conta é pessoal e intransferível, conforme os Termos de Uso. Para proteger o conteúdo pago, a Lutteros observa quantas redes diferentes acessam o mesmo curso com a sua conta em um período de 24 horas.',
        ],
      },
      {
        heading: 'Como funciona',
        bullets: [
          'Usar o curso em casa, no trabalho ou com dados móveis é esperado, e trocar entre Wi-Fi e dados móveis é considerado.',
          'Se muitas redes diferentes forem usadas em 24 horas, novos acessos a esse curso podem ser bloqueados temporariamente.',
          'O acesso volta quando as redes mais antigas saem do período de 24 horas.',
        ],
      },
      {
        heading: 'O que fazer',
        bullets: [
          'Aguarde até 24 horas e tente de novo na rede que você mais usa.',
          'Não compartilhe sua senha nem deixe sua conta aberta em outros dispositivos.',
          'Se continuar sem acesso, escreva para a equipe informando o nome do curso.',
        ],
        links: [{ href: '/contact', label: 'Falar com a equipe' }],
      },
    ],
  },
  {
    slug: 'artigos-salvos',
    title: 'Como salvar e reler artigos',
    description: 'Guarde artigos para ler depois e encontre-os em um só lugar.',
    category: 'Cursos e artigos',
    icon: 'articles',
    related: ['meus-cursos', 'perfil'],
    sections: [
      {
        steps: [
          'Entre na sua conta.',
          'Abra o artigo e use o botão de marcador para salvá-lo.',
          'Para reler, abra Artigos Salvos. O atalho também está no seu perfil.',
        ],
        links: [
          { href: '/articles', label: 'Ler artigos' },
          { href: '/articles/saved', label: 'Abrir Artigos Salvos' },
        ],
      },
    ],
  },
  {
    slug: 'notificacoes',
    title: 'Como gerenciar notificações e e-mails',
    description: 'Escolha quais e-mails você quer receber da Lutteros.',
    category: 'Conta e privacidade',
    icon: 'discussion',
    related: ['perfil', 'privacidade'],
    sections: [
      {
        paragraphs: ['Em Editar Perfil, na seção Preferências, você escolhe o que recebe por e-mail:'],
        bullets: [
          'Notificações por e-mail: atualizações sobre seus cursos e eventos.',
          'E-mails de marketing: novidades, promoções e conteúdo exclusivo.',
        ],
      },
      {
        paragraphs: ['Ative ou desative cada opção e selecione Salvar Alterações.'],
        links: [{ href: '/profile/edit', label: 'Editar preferências' }],
      },
    ],
  },
  {
    slug: 'privacidade',
    title: 'Seus dados e sua privacidade',
    description: 'Saiba onde encontrar como seus dados são tratados e como corrigi-los.',
    category: 'Conta e privacidade',
    icon: 'care',
    related: ['perfil', 'falar-com-a-equipe'],
    sections: [
      {
        paragraphs: [
          'A Política de Privacidade explica quais dados a Lutteros trata, para que e como exercer seus direitos. Por tratar de temas íntimos, os Termos de Uso estabelecem que dados sobre saúde ou vida sexual não são compartilhados para fins comerciais.',
        ],
        links: [
          { href: '/privacy', label: 'Política de Privacidade' },
          { href: '/terms', label: 'Termos de Uso' },
        ],
      },
      {
        heading: 'Corrigir ou pedir informações sobre seus dados',
        bullets: [
          'Para corrigir seus dados pessoais, use Editar Perfil.',
          'Para outras solicitações sobre seus dados, escreva para a equipe pelo formulário de contato.',
        ],
        links: [{ href: '/contact', label: 'Falar com a equipe' }],
      },
    ],
  },
  {
    slug: 'falar-com-a-equipe',
    title: 'Como falar com a equipe',
    description: 'Veja os canais de contato, o prazo de resposta e o que informar para agilizar o atendimento.',
    category: 'Conta e privacidade',
    icon: 'contact',
    related: ['meus-cursos', 'privacidade'],
    sections: [
      {
        paragraphs: [`Use o formulário de contato ou escreva para ${SUPPORT_EMAIL}. Respondemos por e-mail em até 48 horas úteis.`],
        links: [{ href: '/contact', label: 'Abrir o formulário de contato' }],
      },
      {
        heading: 'O que informar',
        bullets: [
          'Seu nome e o e-mail da conta.',
          'A página, o curso ou o artigo envolvido.',
          'O que você esperava e o que aconteceu, com a mensagem de erro, se houver.',
        ],
      },
      {
        heading: 'O que não enviar',
        bullets: ['Senhas, dados de cartão ou documentos.'],
      },
      {
        heading: 'Emergências',
        paragraphs: [
          'A Lutteros é uma plataforma educacional e não presta atendimento de saúde. Em caso de emergência médica, procure atendimento presencial ou ligue 192.',
        ],
      },
    ],
  },
];

export const helpArticles: Record<string, HelpArticle> = Object.fromEntries(
  articles.map((article) => [article.slug, article]),
);

export const helpCategories: HelpCategory[] = [
  {
    id: 'primeiros-passos',
    title: 'Primeiros passos',
    description: 'Crie sua conta, entre na plataforma e deixe seu perfil em dia.',
    icon: 'sprout',
    articleSlugs: ['criar-conta', 'perfil'],
  },
  {
    id: 'cursos-e-artigos',
    title: 'Cursos e artigos',
    description: 'Compre, acesse e acompanhe seus conteúdos.',
    icon: 'courses',
    articleSlugs: ['meus-cursos', 'comprar-curso', 'acesso-curso-pago', 'artigos-salvos'],
  },
  {
    id: 'conta-e-privacidade',
    title: 'Conta e privacidade',
    description: 'Preferências de e-mail, dados pessoais e contato com a equipe.',
    icon: 'care',
    articleSlugs: ['notificacoes', 'privacidade', 'falar-com-a-equipe'],
  },
];
