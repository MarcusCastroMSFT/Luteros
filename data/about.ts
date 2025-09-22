export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export interface AboutValue {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface AboutStats {
  id: string;
  number: string;
  label: string;
  description: string;
}

export interface AboutMilestone {
  id: string;
  year: string;
  title: string;
  description: string;
}

export const aboutContent = {
  hero: {
    title: "Sobre a Luteros",
    subtitle: "Transformando o futuro da educação profissional",
    description: "Somos uma plataforma dedicada a capacitar profissionais através de educação de qualidade, conectando conhecimento teórico com aplicação prática no mercado de trabalho.",
  },
  mission: {
    title: "Nossa Missão",
    description: "Democratizar o acesso ao conhecimento de qualidade e acelerar o desenvolvimento profissional de milhares de pessoas, criando uma ponte entre o aprendizado e as oportunidades do mercado.",
  },
  vision: {
    title: "Nossa Visão",
    description: "Ser a principal plataforma de educação profissional do Brasil, reconhecida pela excelência do conteúdo e pelo impacto real na carreira dos nossos alunos.",
  },
};

export const aboutValues: AboutValue[] = [
  {
    id: "quality",
    title: "Qualidade",
    description: "Comprometidos com conteúdo de excelência, criado por especialistas reconhecidos no mercado.",
    icon: "Award",
  },
  {
    id: "innovation",
    title: "Inovação",
    description: "Utilizamos as mais modernas tecnologias e metodologias para proporcionar a melhor experiência de aprendizado.",
    icon: "Lightbulb",
  },
  {
    id: "community",
    title: "Comunidade",
    description: "Acreditamos no poder da colaboração e do networking para acelerar o crescimento profissional.",
    icon: "Users",
  },
  {
    id: "accessibility",
    title: "Acessibilidade",
    description: "Educação de qualidade deve estar ao alcance de todos, independentemente de localização ou condição financeira.",
    icon: "Globe",
  },
];

export const aboutStats: AboutStats[] = [
  {
    id: "students",
    number: "50K+",
    label: "Alunos",
    description: "Profissionais capacitados",
  },
  {
    id: "courses",
    number: "200+",
    label: "Cursos",
    description: "Conteúdos especializados",
  },
  {
    id: "instructors",
    number: "100+",
    label: "Instrutores",
    description: "Especialistas do mercado",
  },
  {
    id: "satisfaction",
    number: "98%",
    label: "Satisfação",
    description: "Taxa de aprovação",
  },
];

export const teamMembers: TeamMember[] = [
  {
    id: "ceo",
    name: "Ana Silva",
    role: "CEO & Fundadora",
    description: "Especialista em educação corporativa com mais de 15 anos de experiência em transformação digital e desenvolvimento de talentos.",
    image: "/images/team/ana-silva.jpg",
    social: {
      linkedin: "https://linkedin.com/in/ana-silva",
      twitter: "https://twitter.com/ana_silva",
    },
  },
  {
    id: "cto",
    name: "Carlos Santos",
    role: "CTO",
    description: "Engenheiro de software com paixão por criar soluções escaláveis que impactam positivamente a vida das pessoas.",
    image: "/images/team/carlos-santos.jpg",
    social: {
      linkedin: "https://linkedin.com/in/carlos-santos",
      github: "https://github.com/carlos-santos",
    },
  },
  {
    id: "head-education",
    name: "Marina Costa",
    role: "Head de Educação",
    description: "Pedagoga e especialista em metodologias ativas, responsável por garantir a qualidade pedagógica de todos os nossos conteúdos.",
    image: "/images/team/marina-costa.jpg",
    social: {
      linkedin: "https://linkedin.com/in/marina-costa",
    },
  },
  {
    id: "head-community",
    name: "Roberto Lima",
    role: "Head de Comunidade",
    description: "Especialista em relacionamento e engajamento, focado em criar uma comunidade vibrante e colaborativa.",
    image: "/images/team/roberto-lima.jpg",
    social: {
      linkedin: "https://linkedin.com/in/roberto-lima",
      twitter: "https://twitter.com/roberto_lima",
    },
  },
];

export const aboutMilestones: AboutMilestone[] = [
  {
    id: "foundation",
    year: "2020",
    title: "Fundação da Luteros",
    description: "Início da jornada com o objetivo de democratizar o acesso à educação profissional de qualidade.",
  },
  {
    id: "first-courses",
    year: "2021",
    title: "Primeiros Cursos",
    description: "Lançamento dos primeiros cursos especializados em tecnologia e gestão, com foco na aplicação prática.",
  },
  {
    id: "community-launch",
    year: "2022",
    title: "Lançamento da Comunidade",
    description: "Criação da nossa plataforma de networking e colaboração entre profissionais e especialistas.",
  },
  {
    id: "expansion",
    year: "2023",
    title: "Expansão Nacional",
    description: "Alcançamos todas as regiões do Brasil, impactando milhares de profissionais em suas carreiras.",
  },
  {
    id: "current",
    year: "2025",
    title: "Inovação Contínua",
    description: "Implementação de IA e tecnologias avançadas para personalizar ainda mais a experiência de aprendizado.",
  },
];
