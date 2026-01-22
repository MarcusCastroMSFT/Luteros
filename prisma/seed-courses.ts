import { config } from 'dotenv'
import { resolve } from 'path'
import { existsSync } from 'fs'

// Load environment variables - try multiple locations
const envPaths = [
  resolve(process.cwd(), '.env.local'),
  resolve(process.cwd(), '.env'),
  resolve(__dirname, '../.env.local'),
  resolve(__dirname, '../.env'),
]

for (const path of envPaths) {
  if (existsSync(path)) {
    console.log(`📂 Loading env from: ${path}`)
    config({ path })
    break
  }
}

import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Use require for PrismaClient to avoid import issues in some environments
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client')

// Use DIRECT_URL for seeding (bypasses connection pooler)
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Helper function to convert duration string to minutes
function parseDuration(duration: string): number {
  // Handle formats like "8 horas", "5.5 horas", "3.5 horas"
  const match = duration.match(/(\d+\.?\d*)\s*hora/i)
  if (match) {
    return Math.round(parseFloat(match[1]) * 60)
  }
  return 0
}

async function main() {
  console.log('🌱 Starting course seeding...')
  
  if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
    throw new Error('DATABASE_URL or DIRECT_URL environment variable is not set.')
  }
  
  console.log('✅ Database connection configured')

  // First, create or get an instructor user profile
  // We need at least one instructor to assign courses to
  const instructorId = '00000000-0000-0000-0000-000000000001'
  
  // Check if instructor exists, if not create a placeholder
  const existingInstructor = await prisma.user_profiles.findUnique({
    where: { id: instructorId }
  })

  if (!existingInstructor) {
    console.log('📝 Creating instructor profile...')
    await prisma.user_profiles.create({
      data: {
        id: instructorId,
        fullName: 'Dra. Ana Carolina Silva',
        displayName: 'Ana Carolina Silva',
        bio: 'Especialista em sexualidade humana com mais de 15 anos de experiência. Formada em Medicina com especialização em sexologia.',
        avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        title: 'Sexóloga e Terapeuta Sexual',
        rating: 4.9,
        reviewsCount: 1247,
        studentsCount: 12450,
        coursesCount: 8,
        website: 'https://anacarolina.com.br',
        linkedin: 'https://linkedin.com/in/ana-carolina-silva',
      }
    })
    console.log('✅ Instructor profile created')
  }

  // Create additional instructors
  const instructors = [
    {
      id: '00000000-0000-0000-0000-000000000002',
      fullName: 'Prof. Maria Fernanda Costa',
      displayName: 'Maria Fernanda Costa',
      title: 'Educadora Sexual e Psicóloga',
      bio: 'Psicóloga especializada em educação sexual e relacionamentos. Autora de diversos livros sobre sexualidade saudável.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      rating: 4.8,
      reviewsCount: 892,
      studentsCount: 9870,
      coursesCount: 6,
      instagram: '@mariafernandacosta',
      website: 'https://mariafernanda.com.br',
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      fullName: 'Dr. Carlos Eduardo Santos',
      displayName: 'Carlos Eduardo Santos',
      title: 'Ginecologista e Especialista em Saúde Reprodutiva',
      bio: 'Médico ginecologista com foco em saúde reprodutiva e planejamento familiar. Coordenador de programas de educação sexual.',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      rating: 4.7,
      reviewsCount: 654,
      studentsCount: 7890,
      coursesCount: 5,
      linkedin: 'https://linkedin.com/in/carlos-eduardo-santos',
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      fullName: 'Dra. Juliana Ribeiro',
      displayName: 'Juliana Ribeiro',
      title: 'Enfermeira Obstétrica e Educadora Perinatal',
      bio: 'Enfermeira obstétrica especializada em educação perinatal e saúde da mulher. Facilitadora de grupos de gestantes.',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      rating: 4.9,
      reviewsCount: 1156,
      studentsCount: 15230,
      coursesCount: 7,
      instagram: '@julianaribeiro.obstetrica',
      website: 'https://julianaribeiro.com.br',
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      fullName: 'Prof. Ricardo Almeida',
      displayName: 'Ricardo Almeida',
      title: 'Terapeuta de Casais e Especialista em Relacionamentos',
      bio: 'Psicólogo e terapeuta de casais com mais de 12 anos de experiência em terapia sexual e relacionamentos.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      rating: 4.6,
      reviewsCount: 743,
      studentsCount: 8650,
      coursesCount: 4,
      linkedin: 'https://linkedin.com/in/ricardo-almeida-terapeuta',
    },
  ]

  for (const instructor of instructors) {
    const existing = await prisma.user_profiles.findUnique({
      where: { id: instructor.id }
    })
    if (!existing) {
      await prisma.user_profiles.create({ data: instructor })
      console.log(`✅ Created instructor: ${instructor.fullName}`)
    }
  }

  const courses = [
    {
      id: '10000000-0000-0000-0000-000000000001',
      title: 'Educação Sexual Completa para Adolescentes',
      slug: 'educacao-sexual-completa-adolescentes',
      description: 'Um curso abrangente sobre educação sexual destinado a adolescentes, abordando anatomia, puberdade, relacionamentos saudáveis e prevenção.',
      shortDescription: 'Curso completo de educação sexual para adolescentes',
      level: 'BEGINNER',
      category: 'Educação Sexual',
      language: 'pt',
      duration: parseDuration('8 horas'),
      thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      previewVideo: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      instructorId: instructorId,
      price: 149.90,
      discountPrice: null,
      isFree: false,
      isPublished: true,
      publishedAt: new Date('2025-09-15'),
      enrollmentCount: 2150,
      averageRating: 4.9,
      reviewCount: 342,
      lessons: [
        { title: 'Bem-vindos ao curso', description: 'Apresentação do curso e objetivos de aprendizagem', content: null, videoUrl: null, duration: 630, order: 0, sectionTitle: 'Introdução à Sexualidade', isPublished: true, isFree: true, type: 'video' },
        { title: 'O que é sexualidade?', description: 'Conceitos básicos sobre sexualidade humana', content: null, videoUrl: null, duration: 1545, order: 1, sectionTitle: 'Introdução à Sexualidade', isPublished: true, isFree: false, type: 'video' },
        { title: 'Mitos e verdades sobre sexo', description: 'Desmistificando conceitos errôneos', content: 'Artigo sobre mitos e verdades', videoUrl: null, duration: 900, order: 2, sectionTitle: 'Introdução à Sexualidade', isPublished: true, isFree: false, type: 'article' },
        { title: 'Sistema reprodutor feminino', description: 'Anatomia básica e funcionamento', content: null, videoUrl: null, duration: 2100, order: 3, sectionTitle: 'Anatomia e Fisiologia Reprodutiva', isPublished: true, isFree: false, type: 'video' },
        { title: 'Sistema reprodutor masculino', description: 'Anatomia básica e funcionamento', content: null, videoUrl: null, duration: 1800, order: 4, sectionTitle: 'Anatomia e Fisiologia Reprodutiva', isPublished: true, isFree: false, type: 'video' },
        { title: 'Ciclo menstrual', description: 'Entendendo as fases do ciclo', content: null, videoUrl: null, duration: 1500, order: 5, sectionTitle: 'Anatomia e Fisiologia Reprodutiva', isPublished: true, isFree: false, type: 'video' },
        { title: 'Hormônios e puberdade', description: 'Como os hormônios afetam o desenvolvimento', content: 'Artigo sobre hormônios', videoUrl: null, duration: 1200, order: 6, sectionTitle: 'Anatomia e Fisiologia Reprodutiva', isPublished: true, isFree: false, type: 'article' },
        { title: 'Tipos de relacionamentos', description: 'Explorando diferentes formas de relacionamento', content: null, videoUrl: null, duration: 1200, order: 7, sectionTitle: 'Relacionamentos e Comunicação', isPublished: true, isFree: false, type: 'video' },
        { title: 'Comunicação assertiva', description: 'Como se expressar de forma clara e respeitosa', content: null, videoUrl: null, duration: 1500, order: 8, sectionTitle: 'Relacionamentos e Comunicação', isPublished: true, isFree: false, type: 'video' },
        { title: 'Consentimento', description: 'A importância do consentimento em relacionamentos', content: null, videoUrl: null, duration: 1800, order: 9, sectionTitle: 'Relacionamentos e Comunicação', isPublished: true, isFree: false, type: 'video' },
      ]
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      title: 'Gravidez, Parto e Pós-parto: Guia Completo',
      slug: 'gravidez-parto-pos-parto-completo',
      description: 'Acompanhamento completo desde a concepção até o pós-parto, incluindo cuidados com o bebê e amamentação.',
      shortDescription: 'Guia completo para gestantes e mamães',
      level: 'BEGINNER',
      category: 'Maternidade',
      language: 'pt',
      duration: parseDuration('12 horas'),
      thumbnail: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      previewVideo: 'https://www.youtube.com/watch?v=Hm5xDzlgeX8',
      instructorId: '00000000-0000-0000-0000-000000000004',
      price: 189.90,
      discountPrice: null,
      isFree: false,
      isPublished: true,
      publishedAt: new Date('2025-09-10'),
      enrollmentCount: 3280,
      averageRating: 4.8,
      reviewCount: 567,
      lessons: [
        { title: 'Planejando a gravidez', description: 'Como se preparar física e emocionalmente', content: null, videoUrl: null, duration: 1110, order: 0, sectionTitle: 'Preparação para a Gravidez', isPublished: true, isFree: true, type: 'video' },
        { title: 'Fertilidade e concepção', description: 'Entendendo o ciclo reprodutivo', content: null, videoUrl: null, duration: 1335, order: 1, sectionTitle: 'Preparação para a Gravidez', isPublished: true, isFree: false, type: 'video' },
        { title: 'Exames pré-concepcionais', description: 'Lista completa de exames recomendados', content: 'Artigo sobre exames', videoUrl: null, duration: 720, order: 2, sectionTitle: 'Preparação para a Gravidez', isPublished: true, isFree: false, type: 'article' },
        { title: 'Mudanças no corpo', description: 'O que esperar nas primeiras semanas', content: null, videoUrl: null, duration: 1230, order: 3, sectionTitle: 'Primeiro Trimestre', isPublished: true, isFree: false, type: 'video' },
        { title: 'Enjoos e desconfortos', description: 'Como lidar com os sintomas comuns', content: null, videoUrl: null, duration: 945, order: 4, sectionTitle: 'Primeiro Trimestre', isPublished: true, isFree: false, type: 'video' },
        { title: 'Exames do segundo trimestre', description: 'Ultrassom morfológico e outros exames', content: null, videoUrl: null, duration: 1500, order: 5, sectionTitle: 'Segundo Trimestre', isPublished: true, isFree: false, type: 'video' },
      ]
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      title: 'Relacionamentos Saudáveis e Comunicação Íntima',
      slug: 'relacionamentos-saudaveis-comunicacao',
      description: 'Aprenda a construir relacionamentos saudáveis com base na comunicação efetiva e intimidade emocional.',
      shortDescription: 'Construa relacionamentos mais fortes e saudáveis',
      level: 'BEGINNER',
      category: 'Relacionamentos',
      language: 'pt',
      duration: parseDuration('6 horas'),
      thumbnail: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      previewVideo: 'https://www.youtube.com/watch?v=3IJH0KFgRl4',
      instructorId: '00000000-0000-0000-0000-000000000005',
      price: 129.90,
      discountPrice: null,
      isFree: false,
      isPublished: true,
      publishedAt: new Date('2025-09-12'),
      enrollmentCount: 1890,
      averageRating: 4.7,
      reviewCount: 289,
      lessons: [
        { title: 'Boas-vindas ao curso', description: 'Introdução e objetivos do curso', content: null, videoUrl: null, duration: 480, order: 0, sectionTitle: 'Introdução', isPublished: true, isFree: true, type: 'video' },
        { title: 'O que são relacionamentos saudáveis?', description: 'Definindo os pilares de um relacionamento saudável', content: null, videoUrl: null, duration: 1200, order: 1, sectionTitle: 'Introdução', isPublished: true, isFree: false, type: 'video' },
        { title: 'Autoconhecimento e relacionamentos', description: 'Como se conhecer melhor impacta seus relacionamentos', content: null, videoUrl: null, duration: 1500, order: 2, sectionTitle: 'Fundamentos da Comunicação', isPublished: true, isFree: false, type: 'video' },
        { title: 'Comunicação verbal e não-verbal', description: 'Entendendo as diferentes formas de comunicação', content: null, videoUrl: null, duration: 1800, order: 3, sectionTitle: 'Fundamentos da Comunicação', isPublished: true, isFree: false, type: 'video' },
        { title: 'Escuta ativa', description: 'A arte de realmente ouvir o outro', content: 'Artigo sobre técnicas de escuta ativa', videoUrl: null, duration: 900, order: 4, sectionTitle: 'Fundamentos da Comunicação', isPublished: true, isFree: false, type: 'article' },
        { title: 'Expressando necessidades e desejos', description: 'Como comunicar o que você precisa', content: null, videoUrl: null, duration: 1350, order: 5, sectionTitle: 'Intimidade Emocional', isPublished: true, isFree: false, type: 'video' },
        { title: 'Vulnerabilidade e conexão', description: 'O poder da vulnerabilidade nos relacionamentos', content: null, videoUrl: null, duration: 1650, order: 6, sectionTitle: 'Intimidade Emocional', isPublished: true, isFree: false, type: 'video' },
        { title: 'Resolução de conflitos', description: 'Estratégias para resolver desentendimentos', content: null, videoUrl: null, duration: 2100, order: 7, sectionTitle: 'Intimidade Emocional', isPublished: true, isFree: false, type: 'video' },
      ]
    },
    {
      id: '10000000-0000-0000-0000-000000000004',
      title: 'Métodos Contraceptivos e Planejamento Familiar',
      slug: 'metodos-contraceptivos-planejamento-familiar',
      description: 'Guia completo sobre métodos contraceptivos, eficácia, efeitos colaterais e planejamento familiar responsável.',
      shortDescription: 'Tudo sobre métodos contraceptivos',
      level: 'BEGINNER',
      category: 'Relacionamentos',
      language: 'pt',
      duration: parseDuration('5 horas'),
      thumbnail: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      previewVideo: 'https://www.youtube.com/watch?v=KQY9K6SU_P0',
      instructorId: '00000000-0000-0000-0000-000000000003',
      price: 99.90,
      discountPrice: null,
      isFree: false,
      isPublished: true,
      publishedAt: new Date('2025-09-08'),
      enrollmentCount: 1650,
      averageRating: 4.6,
      reviewCount: 234,
      lessons: [
        { title: 'Introdução ao planejamento familiar', description: 'Por que planejar é importante', content: null, videoUrl: null, duration: 600, order: 0, sectionTitle: 'Introdução', isPublished: true, isFree: true, type: 'video' },
        { title: 'Métodos hormonais', description: 'Pílulas, adesivos, injeções e implantes', content: null, videoUrl: null, duration: 2400, order: 1, sectionTitle: 'Métodos Contraceptivos', isPublished: true, isFree: false, type: 'video' },
        { title: 'Métodos de barreira', description: 'Preservativos, diafragma e outros', content: null, videoUrl: null, duration: 1800, order: 2, sectionTitle: 'Métodos Contraceptivos', isPublished: true, isFree: false, type: 'video' },
        { title: 'DIU hormonal e de cobre', description: 'Tudo sobre dispositivos intrauterinos', content: null, videoUrl: null, duration: 2100, order: 3, sectionTitle: 'Métodos Contraceptivos', isPublished: true, isFree: false, type: 'video' },
        { title: 'Métodos naturais', description: 'Tabelinha, muco cervical e temperatura basal', content: 'Artigo detalhado sobre métodos naturais', videoUrl: null, duration: 1500, order: 4, sectionTitle: 'Métodos Contraceptivos', isPublished: true, isFree: false, type: 'article' },
        { title: 'Comparativo de eficácia', description: 'Qual método é mais eficaz?', content: 'Tabela comparativa de todos os métodos', videoUrl: null, duration: 900, order: 5, sectionTitle: 'Escolhendo seu Método', isPublished: true, isFree: false, type: 'article' },
        { title: 'Conversando com seu médico', description: 'Como escolher o método ideal para você', content: null, videoUrl: null, duration: 1200, order: 6, sectionTitle: 'Escolhendo seu Método', isPublished: true, isFree: false, type: 'video' },
      ]
    },
    {
      id: '10000000-0000-0000-0000-000000000005',
      title: 'Menopausa, Climatério e Sexualidade Madura',
      slug: 'menopausa-climaterio-sexualidade-madura',
      description: 'Entenda as mudanças do climatério e como manter uma vida sexual saudável após os 40 anos.',
      shortDescription: 'Saúde sexual na maturidade',
      level: 'INTERMEDIATE',
      category: 'Saúde da Mulher',
      language: 'pt',
      duration: parseDuration('7 horas'),
      thumbnail: 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      previewVideo: 'https://www.youtube.com/watch?v=R7bHCs_iu9w',
      instructorId: instructorId,
      price: 119.90,
      discountPrice: null,
      isFree: false,
      isPublished: true,
      publishedAt: new Date('2025-09-14'),
      enrollmentCount: 1320,
      averageRating: 4.8,
      reviewCount: 198,
      lessons: [
        { title: 'Bem-vindas ao curso', description: 'Uma jornada de autoconhecimento', content: null, videoUrl: null, duration: 540, order: 0, sectionTitle: 'Introdução', isPublished: true, isFree: true, type: 'video' },
        { title: 'O que é o climatério?', description: 'Entendendo essa fase da vida', content: null, videoUrl: null, duration: 1500, order: 1, sectionTitle: 'Introdução', isPublished: true, isFree: false, type: 'video' },
        { title: 'Mudanças hormonais', description: 'O que acontece no seu corpo', content: null, videoUrl: null, duration: 1800, order: 2, sectionTitle: 'Mudanças Físicas', isPublished: true, isFree: false, type: 'video' },
        { title: 'Sintomas comuns', description: 'Ondas de calor, insônia e mais', content: 'Guia completo de sintomas', videoUrl: null, duration: 1200, order: 3, sectionTitle: 'Mudanças Físicas', isPublished: true, isFree: false, type: 'article' },
        { title: 'Saúde vaginal na maturidade', description: 'Cuidados importantes', content: null, videoUrl: null, duration: 1350, order: 4, sectionTitle: 'Mudanças Físicas', isPublished: true, isFree: false, type: 'video' },
        { title: 'Desejo e prazer após os 40', description: 'Ressignificando a sexualidade', content: null, videoUrl: null, duration: 2100, order: 5, sectionTitle: 'Sexualidade na Maturidade', isPublished: true, isFree: false, type: 'video' },
        { title: 'Intimidade e conexão com o parceiro', description: 'Fortalecendo o relacionamento', content: null, videoUrl: null, duration: 1800, order: 6, sectionTitle: 'Sexualidade na Maturidade', isPublished: true, isFree: false, type: 'video' },
        { title: 'Tratamentos e terapias', description: 'Opções para aliviar os sintomas', content: null, videoUrl: null, duration: 2400, order: 7, sectionTitle: 'Cuidados e Tratamentos', isPublished: true, isFree: false, type: 'video' },
      ]
    },
    {
      id: '10000000-0000-0000-0000-000000000006',
      title: 'Introdução à Terapia Sexual',
      slug: 'introducao-terapia-sexual',
      description: 'Curso introdutório sobre terapia sexual, abordando disfunções sexuais comuns e técnicas terapêuticas.',
      shortDescription: 'Fundamentos de terapia sexual',
      level: 'ADVANCED',
      category: 'Terapia Sexual',
      language: 'pt',
      duration: parseDuration('10 horas'),
      thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      previewVideo: 'https://www.youtube.com/watch?v=p7bfOZek9t4',
      instructorId: instructorId,
      price: 179.90,
      discountPrice: null,
      isFree: false,
      isPublished: false,
      publishedAt: null,
      enrollmentCount: 890,
      averageRating: 4.9,
      reviewCount: 145,
      lessons: []
    },
    {
      id: '10000000-0000-0000-0000-000000000007',
      title: 'Diversidade Sexual e Identidade de Gênero',
      slug: 'diversidade-sexual-identidade-genero',
      description: 'Compreenda a diversidade sexual e de gênero, promovendo inclusão e respeito às diferenças.',
      shortDescription: 'Entendendo a diversidade sexual',
      level: 'BEGINNER',
      category: 'Educação Sexual',
      language: 'pt',
      duration: parseDuration('5.5 horas'),
      thumbnail: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      previewVideo: 'https://www.youtube.com/watch?v=F6Cosrx7EZ0',
      instructorId: '00000000-0000-0000-0000-000000000002',
      price: 109.90,
      discountPrice: null,
      isFree: false,
      isPublished: true,
      publishedAt: new Date('2025-09-11'),
      enrollmentCount: 2100,
      averageRating: 4.7,
      reviewCount: 312,
      lessons: [
        { title: 'Introdução à diversidade', description: 'Abrindo a mente para a diversidade humana', content: null, videoUrl: null, duration: 720, order: 0, sectionTitle: 'Conceitos Fundamentais', isPublished: true, isFree: true, type: 'video' },
        { title: 'Sexo, gênero e sexualidade', description: 'Entendendo as diferenças', content: null, videoUrl: null, duration: 1800, order: 1, sectionTitle: 'Conceitos Fundamentais', isPublished: true, isFree: false, type: 'video' },
        { title: 'Orientação sexual', description: 'Heterossexualidade, homossexualidade, bissexualidade e mais', content: null, videoUrl: null, duration: 2100, order: 2, sectionTitle: 'Orientação Sexual', isPublished: true, isFree: false, type: 'video' },
        { title: 'Espectro da sexualidade', description: 'A fluidez da orientação sexual', content: 'Artigo sobre o espectro da sexualidade', videoUrl: null, duration: 1200, order: 3, sectionTitle: 'Orientação Sexual', isPublished: true, isFree: false, type: 'article' },
        { title: 'Identidade de gênero', description: 'Cisgênero, transgênero e não-binárie', content: null, videoUrl: null, duration: 2400, order: 4, sectionTitle: 'Identidade de Gênero', isPublished: true, isFree: false, type: 'video' },
        { title: 'Expressão de gênero', description: 'Como expressamos nossa identidade', content: null, videoUrl: null, duration: 1500, order: 5, sectionTitle: 'Identidade de Gênero', isPublished: true, isFree: false, type: 'video' },
        { title: 'Linguagem inclusiva', description: 'Como se comunicar de forma respeitosa', content: 'Guia de linguagem inclusiva', videoUrl: null, duration: 900, order: 6, sectionTitle: 'Inclusão e Respeito', isPublished: true, isFree: false, type: 'article' },
        { title: 'Promovendo ambientes seguros', description: 'Criando espaços de acolhimento', content: null, videoUrl: null, duration: 1650, order: 7, sectionTitle: 'Inclusão e Respeito', isPublished: true, isFree: false, type: 'video' },
      ]
    },
    {
      id: '10000000-0000-0000-0000-000000000008',
      title: 'Saúde Sexual Masculina',
      slug: 'saude-sexual-masculina',
      description: 'Abordagem completa sobre saúde sexual masculina, incluindo prevenção e tratamento de disfunções.',
      shortDescription: 'Cuidados com a saúde sexual masculina',
      level: 'INTERMEDIATE',
      category: 'Saúde Masculina',
      language: 'pt',
      duration: parseDuration('8 horas'),
      thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      previewVideo: 'https://www.youtube.com/watch?v=GzlHe6wHvMs',
      instructorId: '00000000-0000-0000-0000-000000000003',
      price: 139.90,
      discountPrice: null,
      isFree: false,
      isPublished: true,
      publishedAt: new Date('2025-09-07'),
      enrollmentCount: 1450,
      averageRating: 4.5,
      reviewCount: 187,
      lessons: [
        { title: 'Bem-vindo ao curso', description: 'Cuidar da saúde é coisa de homem', content: null, videoUrl: null, duration: 600, order: 0, sectionTitle: 'Introdução', isPublished: true, isFree: true, type: 'video' },
        { title: 'Anatomia masculina', description: 'Conhecendo seu corpo', content: null, videoUrl: null, duration: 1800, order: 1, sectionTitle: 'Anatomia e Fisiologia', isPublished: true, isFree: false, type: 'video' },
        { title: 'Hormônios masculinos', description: 'Testosterona e seus efeitos', content: null, videoUrl: null, duration: 1500, order: 2, sectionTitle: 'Anatomia e Fisiologia', isPublished: true, isFree: false, type: 'video' },
        { title: 'Disfunção erétil', description: 'Causas, prevenção e tratamento', content: null, videoUrl: null, duration: 2400, order: 3, sectionTitle: 'Disfunções Sexuais', isPublished: true, isFree: false, type: 'video' },
        { title: 'Ejaculação precoce', description: 'Entendendo e tratando', content: null, videoUrl: null, duration: 2100, order: 4, sectionTitle: 'Disfunções Sexuais', isPublished: true, isFree: false, type: 'video' },
        { title: 'Doenças da próstata', description: 'Prevenção e diagnóstico precoce', content: 'Artigo sobre câncer de próstata', videoUrl: null, duration: 1800, order: 5, sectionTitle: 'Prevenção', isPublished: true, isFree: false, type: 'article' },
        { title: 'Exames de rotina', description: 'Quais exames todo homem deve fazer', content: null, videoUrl: null, duration: 1200, order: 6, sectionTitle: 'Prevenção', isPublished: true, isFree: false, type: 'video' },
        { title: 'Estilo de vida saudável', description: 'Hábitos que melhoram a saúde sexual', content: null, videoUrl: null, duration: 1650, order: 7, sectionTitle: 'Prevenção', isPublished: true, isFree: false, type: 'video' },
      ]
    },
    {
      id: '10000000-0000-0000-0000-000000000009',
      title: 'Educação Sexual Infantil para Pais',
      slug: 'educacao-sexual-infantil-pais',
      description: 'Como abordar temas de sexualidade com crianças de forma adequada e respeitosa.',
      shortDescription: 'Guia para pais sobre educação sexual infantil',
      level: 'BEGINNER',
      category: 'Educação Sexual',
      language: 'pt',
      duration: parseDuration('4 horas'),
      thumbnail: 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      previewVideo: 'https://www.youtube.com/watch?v=8DRb5ALNqro',
      instructorId: '00000000-0000-0000-0000-000000000002',
      price: 89.90,
      discountPrice: null,
      isFree: false,
      isPublished: true,
      publishedAt: new Date('2025-09-13'),
      enrollmentCount: 2850,
      averageRating: 4.8,
      reviewCount: 423,
      lessons: [
        { title: 'Bem-vindos ao curso', description: 'Por que educação sexual é importante para crianças', content: null, videoUrl: null, duration: 600, order: 0, sectionTitle: 'Introdução', isPublished: true, isFree: true, type: 'video' },
        { title: 'Quebrando tabus', description: 'Superando o desconforto de falar sobre sexo', content: '# Quebrando Tabus na Educação Sexual Infantil\n\nMuitos pais sentem desconforto ao abordar temas de sexualidade com seus filhos. Este artigo explora as razões por trás desse desconforto e oferece estratégias para superá-lo.\n\n## Por que sentimos desconforto?\n\n- Falta de modelos na própria infância\n- Medo de "despertar" curiosidade precoce\n- Insegurança sobre o que é apropriado para cada idade\n\n## Estratégias para superar\n\n1. Eduque-se primeiro\n2. Use linguagem correta e científica\n3. Responda apenas o que foi perguntado\n4. Mantenha a calma e naturalidade\n\n> Lembre-se: crianças que recebem educação sexual de qualidade estão mais protegidas contra abusos.', videoUrl: null, duration: 900, order: 1, sectionTitle: 'Introdução', isPublished: true, isFree: false, type: 'article' },
        { title: 'Desenvolvimento sexual na infância', description: 'Entendendo o que é normal em cada fase', content: null, videoUrl: null, duration: 1500, order: 2, sectionTitle: 'Desenvolvimento Infantil', isPublished: true, isFree: false, type: 'video' },
        { title: 'Fases do desenvolvimento: 0-3 anos', description: 'O que esperar nessa fase', content: '# Desenvolvimento Sexual de 0 a 3 Anos\n\nNesta fase, as crianças começam a explorar seus corpos de forma natural e inocente.\n\n## Comportamentos normais\n\n- Tocar os próprios genitais durante a troca de fraldas\n- Curiosidade sobre as diferenças entre meninos e meninas\n- Perguntas sobre "de onde vêm os bebês"\n\n## Como responder\n\nUse os nomes corretos das partes do corpo desde cedo: pênis, vulva, vagina, ânus. Isso ajuda a criança a:\n- Comunicar desconfortos físicos\n- Identificar e relatar toques inadequados\n- Desenvolver uma relação saudável com o próprio corpo', videoUrl: null, duration: 720, order: 3, sectionTitle: 'Desenvolvimento Infantil', isPublished: true, isFree: false, type: 'article' },
        { title: 'Fases do desenvolvimento: 4-6 anos', description: 'Curiosidade e limites', content: '# Desenvolvimento Sexual de 4 a 6 Anos\n\nNesta fase, a curiosidade aumenta significativamente.\n\n## Comportamentos normais\n\n- Brincadeiras de "médico" ou "papai e mamãe"\n- Perguntas mais elaboradas sobre reprodução\n- Comparação de corpos com colegas\n\n## Estabelecendo limites\n\nEnsine sobre:\n- Partes íntimas (as que a roupa de banho cobre)\n- Toques seguros vs. inseguros\n- Consentimento de forma simples\n- Segredos que machucam vs. surpresas boas', videoUrl: null, duration: 720, order: 4, sectionTitle: 'Desenvolvimento Infantil', isPublished: true, isFree: false, type: 'article' },
        { title: 'Como responder perguntas difíceis', description: 'Técnicas para lidar com curiosidade infantil', content: null, videoUrl: null, duration: 1800, order: 5, sectionTitle: 'Comunicação', isPublished: true, isFree: false, type: 'video' },
        { title: 'Livros recomendados por idade', description: 'Recursos para auxiliar nas conversas', content: '# Livros Recomendados para Educação Sexual Infantil\n\n## 2-4 anos\n- "Mamãe Botou um Ovo" - Babette Cole\n- "Ceci Tem Pipi?" - Thierry Lenain\n\n## 5-7 anos\n- "O Livro do Corpo" - Claire Llewellyn\n- "De Onde Vem os Bebês?" - Usborne\n\n## 8-10 anos\n- "O Que Está Acontecendo com Meu Corpo?" - Lynda Madaras\n- "Mudanças no Meu Corpo" - Kate Grubb\n\n## Dicas de uso\n1. Leia primeiro sozinho(a)\n2. Escolha um momento tranquilo\n3. Deixe a criança fazer perguntas\n4. Releia quantas vezes necessário', videoUrl: null, duration: 600, order: 6, sectionTitle: 'Comunicação', isPublished: true, isFree: false, type: 'article' },
        { title: 'Prevenção de abuso sexual', description: 'Ensinando sobre corpo e limites', content: null, videoUrl: null, duration: 2100, order: 7, sectionTitle: 'Segurança', isPublished: true, isFree: false, type: 'video' },
      ]
    },
    {
      id: '10000000-0000-0000-0000-000000000010',
      title: 'Fertilidade e Reprodução Assistida',
      slug: 'fertilidade-reproducao-assistida',
      description: 'Entenda os processos de fertilidade e as técnicas de reprodução assistida disponíveis.',
      shortDescription: 'Guia sobre fertilidade e tratamentos',
      level: 'INTERMEDIATE',
      category: 'Relacionamentos',
      language: 'pt',
      duration: parseDuration('9 horas'),
      thumbnail: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      previewVideo: 'https://www.youtube.com/watch?v=nQz5u6SMXCY',
      instructorId: '00000000-0000-0000-0000-000000000003',
      price: 159.90,
      discountPrice: null,
      isFree: false,
      isPublished: true,
      publishedAt: new Date('2025-09-09'),
      enrollmentCount: 1180,
      averageRating: 4.6,
      reviewCount: 156,
      lessons: [
        { title: 'Introdução à fertilidade', description: 'Entendendo os conceitos básicos', content: null, videoUrl: null, duration: 720, order: 0, sectionTitle: 'Fundamentos', isPublished: true, isFree: true, type: 'video' },
        { title: 'Ciclo reprodutivo feminino', description: 'Hormônios e ovulação', content: null, videoUrl: null, duration: 1800, order: 1, sectionTitle: 'Fundamentos', isPublished: true, isFree: false, type: 'video' },
        { title: 'Fertilidade masculina', description: 'Produção e qualidade espermática', content: null, videoUrl: null, duration: 1500, order: 2, sectionTitle: 'Fundamentos', isPublished: true, isFree: false, type: 'video' },
        { title: 'Glossário de termos médicos', description: 'Entendendo a linguagem da reprodução assistida', content: '# Glossário de Reprodução Assistida\n\n## Termos Comuns\n\n**AMH (Hormônio Anti-Mülleriano)**: Marcador da reserva ovariana\n\n**Blastocisto**: Embrião com 5-6 dias de desenvolvimento\n\n**ICSI**: Injeção intracitoplasmática de espermatozoide\n\n**FIV**: Fertilização in vitro\n\n**FSH**: Hormônio folículo-estimulante\n\n**LH**: Hormônio luteinizante\n\n**Oócito**: Célula reprodutiva feminina (óvulo)\n\n**PGT**: Teste genético pré-implantacional\n\n**Transferência**: Colocação do embrião no útero\n\n## Siglas de exames\n\n- **HSG**: Histerossalpingografia\n- **US-TV**: Ultrassom transvaginal\n- **SHG**: Sono-histerografia', videoUrl: null, duration: 600, order: 3, sectionTitle: 'Fundamentos', isPublished: true, isFree: false, type: 'article' },
        { title: 'Causas de infertilidade feminina', description: 'Fatores que podem afetar a fertilidade', content: null, videoUrl: null, duration: 2100, order: 4, sectionTitle: 'Investigação', isPublished: true, isFree: false, type: 'video' },
        { title: 'Causas de infertilidade masculina', description: 'Avaliação da fertilidade do homem', content: null, videoUrl: null, duration: 1800, order: 5, sectionTitle: 'Investigação', isPublished: true, isFree: false, type: 'video' },
        { title: 'Exames de investigação', description: 'Quais exames são necessários', content: '# Exames de Investigação de Fertilidade\n\n## Para mulheres\n\n### Hormonais\n- FSH, LH, Estradiol (3º dia do ciclo)\n- AMH (qualquer dia)\n- TSH, Prolactina\n- Progesterona (21º dia)\n\n### Imagem\n- Ultrassom transvaginal com contagem de folículos\n- Histerossalpingografia\n- Histeroscopia (quando indicado)\n\n## Para homens\n\n### Espermograma\n- Volume: >1.5ml\n- Concentração: >15 milhões/ml\n- Motilidade: >40%\n- Morfologia: >4%\n\n### Complementares\n- Ultrassom escrotal\n- Hormônios (FSH, Testosterona)\n- Fragmentação de DNA espermático', videoUrl: null, duration: 900, order: 6, sectionTitle: 'Investigação', isPublished: true, isFree: false, type: 'article' },
        { title: 'Inseminação artificial', description: 'Quando e como é indicada', content: null, videoUrl: null, duration: 1500, order: 7, sectionTitle: 'Tratamentos', isPublished: true, isFree: false, type: 'video' },
        { title: 'FIV passo a passo', description: 'Entendendo a fertilização in vitro', content: null, videoUrl: null, duration: 2400, order: 8, sectionTitle: 'Tratamentos', isPublished: true, isFree: false, type: 'video' },
        { title: 'Comparativo de tratamentos', description: 'Qual opção é melhor para cada caso', content: '# Comparativo: Inseminação vs FIV\n\n| Aspecto | Inseminação | FIV |\n|---------|-------------|-----|\n| Taxa de sucesso | 10-20% | 40-60% |\n| Custo médio | R$ 3-5 mil | R$ 15-25 mil |\n| Estimulação | Leve | Intensa |\n| Indicações | Fator masculino leve, anovulação | Tubas obstruídas, endometriose, falhas de IIU |\n| Tempo de tratamento | 2-3 semanas | 4-6 semanas |\n| Necessidade de anestesia | Não | Sim (punção) |\n\n## Quando escolher cada um?\n\n**Inseminação é primeira opção quando:**\n- Tubas pérvias\n- Espermograma com alterações leves\n- Mulher jovem (<35 anos)\n\n**FIV é indicada quando:**\n- Tubas obstruídas\n- Fator masculino severo\n- Idade avançada\n- Falha em inseminações', videoUrl: null, duration: 720, order: 9, sectionTitle: 'Tratamentos', isPublished: true, isFree: false, type: 'article' },
        { title: 'Aspectos emocionais', description: 'Cuidando da saúde mental durante o tratamento', content: null, videoUrl: null, duration: 1800, order: 10, sectionTitle: 'Aspectos Emocionais', isPublished: true, isFree: false, type: 'video' },
      ]
    },
    {
      id: '10000000-0000-0000-0000-000000000011',
      title: 'Sexualidade na Terceira Idade',
      slug: 'sexualidade-terceira-idade',
      description: 'Mantenha uma vida sexual ativa e saudável após os 60 anos.',
      shortDescription: 'Sexualidade saudável na maturidade',
      level: 'BEGINNER',
      category: 'Relacionamentos',
      language: 'pt',
      duration: parseDuration('5 horas'),
      thumbnail: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      previewVideo: 'https://www.youtube.com/watch?v=CfJ4r6D1zjY',
      instructorId: instructorId,
      price: 99.90,
      discountPrice: null,
      isFree: false,
      isPublished: true,
      publishedAt: new Date('2025-09-06'),
      enrollmentCount: 670,
      averageRating: 4.7,
      reviewCount: 89,
      lessons: [
        { title: 'Bem-vindos à maturidade sexual', description: 'Uma nova fase, novas possibilidades', content: null, videoUrl: null, duration: 600, order: 0, sectionTitle: 'Introdução', isPublished: true, isFree: true, type: 'video' },
        { title: 'Mitos sobre sexo na terceira idade', description: 'Derrubando preconceitos', content: '# Mitos Sobre Sexo na Terceira Idade\n\n## Mito 1: "Idosos não têm desejo sexual"\n**Realidade**: O desejo sexual pode mudar, mas não desaparece. Muitas pessoas relatam uma vida sexual mais satisfatória após os 60 anos, com menos pressão e mais intimidade.\n\n## Mito 2: "Sexo na velhice é perigoso para o coração"\n**Realidade**: Para pessoas com saúde cardiovascular estável, a atividade sexual é segura e até benéfica.\n\n## Mito 3: "Disfunção erétil é inevitável"\n**Realidade**: Embora mais comum, não é inevitável. Há muitos tratamentos eficazes disponíveis.\n\n## Mito 4: "Mulheres perdem o interesse após a menopausa"\n**Realidade**: Muitas mulheres experimentam uma "segunda primavera" sexual, livres da preocupação com gravidez.\n\n> A sexualidade não tem idade para acabar - ela se transforma.', videoUrl: null, duration: 720, order: 1, sectionTitle: 'Introdução', isPublished: true, isFree: false, type: 'article' },
        { title: 'Mudanças físicas e adaptações', description: 'Como o corpo muda e como se adaptar', content: null, videoUrl: null, duration: 1500, order: 2, sectionTitle: 'Corpo e Prazer', isPublished: true, isFree: false, type: 'video' },
        { title: 'Sexo e medicamentos', description: 'Como remédios podem afetar a sexualidade', content: '# Medicamentos e Função Sexual\n\n## Medicamentos que podem afetar a sexualidade\n\n### Anti-hipertensivos\n- Beta-bloqueadores: podem reduzir desejo e ereção\n- Diuréticos: podem causar disfunção erétil\n- Alternativas: IECAs geralmente têm menos efeitos\n\n### Antidepressivos\n- ISRS: podem dificultar orgasmo\n- Alternativa: Bupropiona tem menos efeitos sexuais\n\n### Antihistamínicos\n- Podem causar secura vaginal\n- Solução: usar lubrificantes\n\n## O que fazer?\n\n1. **Nunca pare um medicamento sem orientação médica**\n2. Converse com seu médico sobre efeitos colaterais\n3. Pergunte sobre alternativas\n4. Considere ajustes de horário ou dose\n\n> Sempre há soluções - o importante é comunicar ao seu médico.', videoUrl: null, duration: 900, order: 3, sectionTitle: 'Corpo e Prazer', isPublished: true, isFree: false, type: 'article' },
        { title: 'Prazer sem penetração', description: 'Explorando outras formas de intimidade', content: null, videoUrl: null, duration: 1800, order: 4, sectionTitle: 'Corpo e Prazer', isPublished: true, isFree: false, type: 'video' },
        { title: 'Comunicação com o parceiro(a)', description: 'Falando sobre desejos e necessidades', content: null, videoUrl: null, duration: 1500, order: 5, sectionTitle: 'Relacionamento', isPublished: true, isFree: false, type: 'video' },
        { title: 'Sexualidade para viúvos e divorciados', description: 'Recomeçando a vida amorosa', content: '# Recomeçando a Vida Sexual Após Perda\n\n## Luto e sexualidade\n\nÉ normal sentir-se confuso sobre quando "é hora" de voltar a ter interesse sexual. Não há prazo certo - cada pessoa tem seu tempo.\n\n## Desafios comuns\n\n- Culpa por sentir desejo\n- Medo de comparações\n- Insegurança com o próprio corpo\n- Não saber como conhecer pessoas\n\n## Dicas para recomeçar\n\n1. **Permita-se sentir**: Desejo não é traição\n2. **Vá no seu ritmo**: Não há pressa\n3. **Seja honesto(a)**: Comunique suas inseguranças\n4. **Cuide-se**: Autoestima é fundamental\n\n## Conhecendo pessoas\n\n- Grupos de interesse comum\n- Aplicativos de relacionamento (sim, funcionam!)\n- Atividades sociais\n- Viagens em grupo', videoUrl: null, duration: 720, order: 6, sectionTitle: 'Relacionamento', isPublished: true, isFree: false, type: 'article' },
        { title: 'Segurança e prevenção de ISTs', description: 'Proteção em qualquer idade', content: null, videoUrl: null, duration: 1200, order: 7, sectionTitle: 'Saúde', isPublished: true, isFree: false, type: 'video' },
      ]
    },
    {
      id: '10000000-0000-0000-0000-000000000012',
      title: 'Prevenção de ISTs e Saúde Sexual',
      slug: 'prevencao-ist-saude-sexual',
      description: 'Aprenda sobre prevenção de infecções sexualmente transmissíveis e cuidados com a saúde sexual.',
      shortDescription: 'Prevenção e cuidados com ISTs',
      level: 'BEGINNER',
      category: 'Relacionamentos',
      language: 'pt',
      duration: parseDuration('3.5 horas'),
      thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      previewVideo: 'https://www.youtube.com/watch?v=2ck8m2_sEqo',
      instructorId: '00000000-0000-0000-0000-000000000003',
      price: 79.90,
      discountPrice: null,
      isFree: false,
      isPublished: true,
      publishedAt: new Date('2025-09-16'),
      enrollmentCount: 1920,
      averageRating: 4.9,
      reviewCount: 267,
      lessons: [
        { title: 'Introdução às ISTs', description: 'O que são e como se prevenir', content: null, videoUrl: null, duration: 720, order: 0, sectionTitle: 'Fundamentos', isPublished: true, isFree: true, type: 'video' },
        { title: 'Panorama das ISTs no Brasil', description: 'Dados e estatísticas atuais', content: '# ISTs no Brasil: Panorama Atual\n\n## Principais infecções\n\n### HIV/AIDS\n- Cerca de 920.000 pessoas vivendo com HIV\n- 30% não sabem que têm o vírus\n- Tratamento gratuito pelo SUS\n\n### Sífilis\n- Aumento de 75% nos últimos 5 anos\n- Especialmente preocupante: sífilis congênita\n\n### HPV\n- IST mais comum do mundo\n- Vacina disponível gratuitamente para jovens\n\n### Hepatites B e C\n- Hepatite B: vacina disponível\n- Hepatite C: tem cura com tratamento\n\n## Grupos mais vulneráveis\n\n- Jovens de 15-24 anos\n- Populações LGBTQIA+\n- Profissionais do sexo\n- Pessoas em situação de rua\n\n> **Importante**: ISTs afetam pessoas de todas as classes sociais, idades e orientações sexuais.', videoUrl: null, duration: 600, order: 1, sectionTitle: 'Fundamentos', isPublished: true, isFree: false, type: 'article' },
        { title: 'Métodos de prevenção', description: 'Preservativos e outras estratégias', content: null, videoUrl: null, duration: 1500, order: 2, sectionTitle: 'Prevenção', isPublished: true, isFree: false, type: 'video' },
        { title: 'PrEP e PEP: prevenção do HIV', description: 'Profilaxia pré e pós-exposição', content: '# PrEP e PEP: Prevenção Combinada do HIV\n\n## O que é PrEP?\n\n**Profilaxia Pré-Exposição** - medicamento tomado ANTES de possível exposição.\n\n- Eficácia: >99% quando tomada corretamente\n- Uso: diário (1 comprimido)\n- Disponível gratuitamente no SUS\n- Indicada para pessoas com maior vulnerabilidade\n\n### Como conseguir\n1. Procure uma unidade de saúde ou CTA\n2. Faça exames de HIV e função renal\n3. Se indicado, receba a medicação\n4. Acompanhamento trimestral\n\n## O que é PEP?\n\n**Profilaxia Pós-Exposição** - medicamento tomado DEPOIS de possível exposição.\n\n- Deve ser iniciada em até 72 horas (quanto antes, melhor)\n- Duração: 28 dias\n- Disponível em UBS, UPA e hospitais\n\n### Quando usar PEP\n- Relação sexual desprotegida\n- Rompimento de preservativo\n- Violência sexual\n- Acidente com material biológico\n\n> **Emergência**: Vá imediatamente a uma unidade de saúde!', videoUrl: null, duration: 900, order: 3, sectionTitle: 'Prevenção', isPublished: true, isFree: false, type: 'article' },
        { title: 'Vacinação: HPV e Hepatite B', description: 'Proteção através de vacinas', content: null, videoUrl: null, duration: 1200, order: 4, sectionTitle: 'Prevenção', isPublished: true, isFree: false, type: 'video' },
        { title: 'Sintomas e sinais de alerta', description: 'Quando procurar ajuda médica', content: null, videoUrl: null, duration: 1800, order: 5, sectionTitle: 'Diagnóstico', isPublished: true, isFree: false, type: 'video' },
        { title: 'Guia de exames: quais e quando fazer', description: 'Rotina de testagem recomendada', content: '# Guia de Testagem para ISTs\n\n## Quem deve fazer testes regularmente?\n\n- Pessoas sexualmente ativas\n- Quem tem múltiplos parceiros\n- Quem não usa preservativo consistentemente\n- Gestantes (todos os trimestres)\n\n## Frequência recomendada\n\n| Situação | Frequência |\n|----------|------------|\n| Relacionamento estável | 1x por ano |\n| Múltiplos parceiros | A cada 3-6 meses |\n| Novo parceiro | Antes de dispensar preservativo |\n| Uso de PrEP | A cada 3 meses |\n\n## Exames básicos\n\n1. **HIV** - teste rápido ou sorologia\n2. **Sífilis** - VDRL ou teste rápido\n3. **Hepatite B e C** - sorologia\n4. **HPV** - Papanicolau (mulheres)\n5. **Clamídia/Gonorreia** - PCR de urina ou secreção\n\n## Onde fazer gratuitamente\n\n- UBS (Unidade Básica de Saúde)\n- CTA (Centro de Testagem e Aconselhamento)\n- SAE (Serviço de Atenção Especializada)\n- Ações de testagem na comunidade', videoUrl: null, duration: 720, order: 6, sectionTitle: 'Diagnóstico', isPublished: true, isFree: false, type: 'article' },
        { title: 'Comunicação com parceiros', description: 'Como falar sobre ISTs', content: null, videoUrl: null, duration: 1200, order: 7, sectionTitle: 'Comunicação', isPublished: true, isFree: false, type: 'video' },
      ]
    },
    {
      id: '10000000-0000-0000-0000-000000000013',
      title: 'Psicologia Sexual e Comportamento Humano',
      slug: 'psicologia-sexual-comportamento',
      description: 'Explore os aspectos psicológicos da sexualidade e do comportamento sexual humano.',
      shortDescription: 'Psicologia da sexualidade',
      level: 'ADVANCED',
      category: 'Educação Sexual',
      language: 'pt',
      duration: parseDuration('11 horas'),
      thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      previewVideo: 'https://www.youtube.com/watch?v=v8KqTwwj1rw',
      instructorId: '00000000-0000-0000-0000-000000000002',
      price: 169.90,
      discountPrice: null,
      isFree: false,
      isPublished: false,
      publishedAt: null,
      enrollmentCount: 780,
      averageRating: 4.6,
      reviewCount: 124,
      lessons: [
        { title: 'Introdução à psicologia sexual', description: 'Histórico e principais teorias', content: null, videoUrl: null, duration: 900, order: 0, sectionTitle: 'Fundamentos', isPublished: true, isFree: true, type: 'video' },
        { title: 'Teorias clássicas: Freud e Jung', description: 'Psicanálise e sexualidade', content: '# Teorias Clássicas da Sexualidade\n\n## Sigmund Freud (1856-1939)\n\n### Teoria do Desenvolvimento Psicossexual\n\nFreud propôs que a sexualidade humana se desenvolve em estágios:\n\n1. **Oral (0-1 ano)**: Prazer focado na boca\n2. **Anal (1-3 anos)**: Controle e autonomia\n3. **Fálica (3-6 anos)**: Descoberta dos genitais\n4. **Latência (6-puberdade)**: Energia direcionada a outras atividades\n5. **Genital (puberdade+)**: Sexualidade adulta\n\n### Conceitos-chave\n- **Libido**: Energia sexual/vital\n- **Complexo de Édipo**: Atração pelo genitor oposto\n- **Mecanismos de defesa**: Sublimação, repressão\n\n## Carl Jung (1875-1961)\n\n### Contribuições\n- **Anima/Animus**: Aspectos masculino/feminino em todos\n- **Individuação**: Integração da sexualidade no self\n- Sexualidade como expressão do inconsciente coletivo\n\n> Crítica moderna: Muitas ideias foram contestadas, mas influenciaram profundamente a sexologia.', videoUrl: null, duration: 1200, order: 1, sectionTitle: 'Fundamentos', isPublished: true, isFree: false, type: 'article' },
        { title: 'Comportamento sexual humano', description: 'Masters e Johnson e pesquisas modernas', content: null, videoUrl: null, duration: 2100, order: 2, sectionTitle: 'Fundamentos', isPublished: true, isFree: false, type: 'video' },
        { title: 'Ciclo de resposta sexual', description: 'Fases do prazer', content: null, videoUrl: null, duration: 1800, order: 3, sectionTitle: 'Fisiologia do Prazer', isPublished: true, isFree: false, type: 'video' },
        { title: 'Desejo sexual: modelos teóricos', description: 'Entendendo o desejo', content: '# Modelos de Desejo Sexual\n\n## Modelo Linear (Masters & Johnson)\n\nDesejo → Excitação → Platô → Orgasmo → Resolução\n\n**Crítica**: Muito simplista, não representa a experiência feminina.\n\n## Modelo Circular de Basson\n\nProposto pela Dra. Rosemary Basson para mulheres:\n\n- Desejo pode surgir APÓS a excitação\n- Intimidade emocional como gatilho\n- Múltiplos fatores influenciam\n\n```\nIntimidade emocional → Neutralidade sexual → Estímulos eróticos → \nExcitação → Desejo responsivo → Satisfação → Intimidade emocional\n```\n\n## Modelo de Dual Control\n\nBancroft & Janssen propõem:\n\n- **Acelerador sexual**: O que nos excita\n- **Freio sexual**: O que inibe\n\nO desejo resulta do equilíbrio entre os dois.\n\n## Implicações práticas\n\n1. Desejo pode ser cultivado\n2. Contexto importa tanto quanto atração\n3. Cada pessoa tem seu padrão único\n4. Desejo responsivo é normal', videoUrl: null, duration: 900, order: 4, sectionTitle: 'Fisiologia do Prazer', isPublished: true, isFree: false, type: 'article' },
        { title: 'Fantasias e imaginário erótico', description: 'O papel da mente na sexualidade', content: null, videoUrl: null, duration: 1500, order: 5, sectionTitle: 'Mente e Sexualidade', isPublished: true, isFree: false, type: 'video' },
        { title: 'Apego e sexualidade', description: 'Como padrões de apego influenciam a vida sexual', content: null, videoUrl: null, duration: 2400, order: 6, sectionTitle: 'Mente e Sexualidade', isPublished: true, isFree: false, type: 'video' },
      ]
    },
    {
      id: '10000000-0000-0000-0000-000000000014',
      title: 'Amamentação e Vínculo Mãe-Bebê',
      slug: 'amamentacao-vinculo-mae-bebe',
      description: 'Guia completo sobre amamentação, desde a preparação até o desmame, fortalecendo o vínculo familiar.',
      shortDescription: 'Guia completo de amamentação',
      level: 'BEGINNER',
      category: 'Maternidade',
      language: 'pt',
      duration: parseDuration('6.5 horas'),
      thumbnail: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      previewVideo: 'https://www.youtube.com/watch?v=mK9lGMRnLnM',
      instructorId: '00000000-0000-0000-0000-000000000004',
      price: 119.90,
      discountPrice: null,
      isFree: false,
      isPublished: true,
      publishedAt: new Date('2025-09-17'),
      enrollmentCount: 2640,
      averageRating: 4.9,
      reviewCount: 378,
      lessons: [
        { title: 'Bem-vinda ao curso', description: 'Uma jornada de amor e nutrição', content: null, videoUrl: null, duration: 480, order: 0, sectionTitle: 'Introdução', isPublished: true, isFree: true, type: 'video' },
        { title: 'Benefícios da amamentação', description: 'Para mãe e bebê', content: '# Benefícios da Amamentação\n\n## Para o bebê\n\n### Nutrição perfeita\n- Composição ideal para cada fase\n- Anticorpos que protegem contra infecções\n- Fácil digestão\n\n### Saúde a longo prazo\n- Menor risco de obesidade\n- Melhor desenvolvimento cognitivo\n- Proteção contra alergias\n- Menor incidência de diabetes\n\n### Desenvolvimento\n- Fortalece musculatura facial\n- Estimula desenvolvimento oral\n- Promove vínculo seguro\n\n## Para a mãe\n\n### Recuperação pós-parto\n- Ajuda o útero a voltar ao tamanho normal\n- Reduz sangramento\n- Queima calorias extras\n\n### Saúde a longo prazo\n- Menor risco de câncer de mama e ovário\n- Proteção contra osteoporose\n- Menor risco de diabetes tipo 2\n\n### Praticidade\n- Sempre na temperatura certa\n- Sempre disponível\n- Economia financeira significativa\n\n> A OMS recomenda amamentação exclusiva até os 6 meses e complementada até 2 anos ou mais.', videoUrl: null, duration: 720, order: 1, sectionTitle: 'Introdução', isPublished: true, isFree: false, type: 'article' },
        { title: 'Anatomia da mama e produção de leite', description: 'Entendendo como funciona', content: null, videoUrl: null, duration: 1200, order: 2, sectionTitle: 'Preparação', isPublished: true, isFree: false, type: 'video' },
        { title: 'Preparando-se durante a gestação', description: 'O que fazer antes do bebê nascer', content: null, videoUrl: null, duration: 900, order: 3, sectionTitle: 'Preparação', isPublished: true, isFree: false, type: 'video' },
        { title: 'A primeira mamada', description: 'Hora de ouro e pega correta', content: null, videoUrl: null, duration: 1500, order: 4, sectionTitle: 'Início da Amamentação', isPublished: true, isFree: false, type: 'video' },
        { title: 'Posições para amamentar', description: 'Encontrando o conforto', content: '# Posições para Amamentar\n\n## Posição tradicional (de berço)\n\nA mais comum. Bebê deitado de lado, barriga com barriga.\n\n**Dica**: Use almofada de amamentação para apoio.\n\n## Posição invertida (futebol americano)\n\nBebê ao lado do corpo, pés para trás.\n\n**Ideal para**: \n- Cesariana (não pressiona a cicatriz)\n- Mamas grandes\n- Gêmeos\n\n## Posição deitada\n\nMãe e bebê deitados de lado, frente a frente.\n\n**Ideal para**: \n- Mamadas noturnas\n- Recuperação de cesárea\n- Relaxamento\n\n## Posição cavalinho\n\nBebê sentado de frente para a mãe.\n\n**Ideal para**:\n- Bebês com refluxo\n- Bebês maiores\n- Fluxo de leite muito forte\n\n## Dicas gerais\n\n1. **Nariz livre**: Bebê deve respirar facilmente\n2. **Barriga com barriga**: Alinhamento correto\n3. **Boca bem aberta**: Pega profunda\n4. **Orelha, ombro e quadril**: Em linha reta\n\n> Não existe posição certa ou errada - a melhor é a que funciona para vocês!', videoUrl: null, duration: 900, order: 5, sectionTitle: 'Início da Amamentação', isPublished: true, isFree: false, type: 'article' },
        { title: 'Problemas comuns e soluções', description: 'Fissuras, ingurgitamento e mastite', content: null, videoUrl: null, duration: 2100, order: 6, sectionTitle: 'Desafios', isPublished: true, isFree: false, type: 'video' },
        { title: 'Quando procurar ajuda', description: 'Sinais de alerta', content: '# Quando Procurar Ajuda Profissional\n\n## Sinais de alerta no bebê\n\n### Procure ajuda imediatamente se:\n- Menos de 6 fraldas molhadas em 24h após 5º dia\n- Fezes ainda escuras após 4º dia\n- Perda de peso >10% ou não recupera peso de nascimento em 2 semanas\n- Bebê muito sonolento, difícil de acordar para mamar\n- Choro fraco ou gemidos\n\n### Avalie com profissional se:\n- Mamadas muito longas (>40min) ou muito curtas (<5min)\n- Bebê sempre irritado após mamar\n- Cliques durante a mamada\n\n## Sinais de alerta na mãe\n\n### Urgente:\n- Febre acima de 38.5°C\n- Área vermelha, quente e dolorida na mama\n- Calafrios e mal-estar\n- Secreção purulenta\n\n### Importante:\n- Dor que não melhora com ajuste de pega\n- Fissuras que não cicatrizam\n- Sensação de "facas" durante a mamada\n\n## Onde buscar ajuda\n\n1. **Banco de Leite Humano** - Apoio gratuito\n2. **Consultora de amamentação** - IBCLC\n3. **Pediatra ou obstetra**\n4. **Grupos de apoio** - La Leche League\n\n> Pedir ajuda é sinal de força, não de fraqueza!', videoUrl: null, duration: 720, order: 7, sectionTitle: 'Desafios', isPublished: true, isFree: false, type: 'article' },
        { title: 'Amamentação e volta ao trabalho', description: 'Mantendo a amamentação após a licença', content: null, videoUrl: null, duration: 1800, order: 8, sectionTitle: 'Vida Real', isPublished: true, isFree: false, type: 'video' },
        { title: 'Desmame gentil', description: 'Quando e como encerrar', content: null, videoUrl: null, duration: 1500, order: 9, sectionTitle: 'Vida Real', isPublished: true, isFree: false, type: 'video' },
      ]
    },
    {
      id: '10000000-0000-0000-0000-000000000015',
      title: 'Violência Sexual: Prevenção e Apoio',
      slug: 'violencia-sexual-prevencao-apoio',
      description: 'Curso sensível sobre prevenção da violência sexual, identificação de sinais e apoio às vítimas.',
      shortDescription: 'Prevenção e apoio à violência sexual',
      level: 'BEGINNER',
      category: 'Terapia Sexual',
      language: 'pt',
      duration: parseDuration('3 horas'),
      thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      previewVideo: 'https://www.youtube.com/watch?v=7lZHG_wCm8M',
      instructorId: '00000000-0000-0000-0000-000000000002',
      price: 0,
      discountPrice: null,
      isFree: true,
      isPublished: true,
      publishedAt: new Date('2025-09-18'),
      enrollmentCount: 5640,
      averageRating: 4.8,
      reviewCount: 892,
      lessons: [
        { title: 'Introdução ao tema', description: 'Abordagem sensível e respeitosa', content: null, videoUrl: null, duration: 600, order: 0, sectionTitle: 'Compreendendo', isPublished: true, isFree: true, type: 'video' },
        { title: 'O que é violência sexual', description: 'Definições e formas', content: '# O Que é Violência Sexual\n\n## Definição\n\nViolência sexual é qualquer ato sexual ou tentativa de obter ato sexual sem consentimento, independente da relação entre agressor e vítima.\n\n## Formas de violência sexual\n\n### Com contato físico\n- Estupro\n- Abuso sexual\n- Assédio sexual com toque\n- Exploração sexual\n\n### Sem contato físico\n- Exibicionismo\n- Voyeurismo\n- Assédio verbal\n- Compartilhamento não consensual de imagens íntimas\n- Coerção para produzir conteúdo sexual\n\n## Dados importantes\n\n- 1 em cada 3 mulheres sofre violência sexual na vida\n- Maioria dos casos ocorre com pessoa conhecida\n- Apenas 10% dos casos são denunciados\n- Afeta todas as classes sociais, idades e gêneros\n\n## Consentimento\n\n**Consentimento deve ser:**\n- Livre (sem coerção)\n- Informado (pessoa sabe o que está consentindo)\n- Específico (para cada ato)\n- Reversível (pode ser retirado a qualquer momento)\n\n> Silêncio NÃO é consentimento. Estar alcoolizado(a) NÃO permite consentir.', videoUrl: null, duration: 900, order: 1, sectionTitle: 'Compreendendo', isPublished: true, isFree: true, type: 'article' },
        { title: 'Identificando sinais', description: 'Como reconhecer situações de risco', content: null, videoUrl: null, duration: 1200, order: 2, sectionTitle: 'Identificação', isPublished: true, isFree: true, type: 'video' },
        { title: 'Sinais em crianças e adolescentes', description: 'Mudanças comportamentais a observar', content: '# Sinais de Alerta em Crianças e Adolescentes\n\n## Mudanças comportamentais\n\n### Podem indicar abuso:\n- Medo repentino de pessoas ou lugares específicos\n- Pesadelos frequentes\n- Regressão (voltar a fazer xixi na cama, chupar dedo)\n- Comportamento sexual inadequado para a idade\n- Segredos com adultos específicos\n- Presentes inexplicáveis\n\n### Sinais emocionais:\n- Isolamento social\n- Queda no rendimento escolar\n- Depressão ou ansiedade\n- Automutilação\n- Distúrbios alimentares\n\n### Sinais físicos:\n- Lesões genitais ou anais\n- Infecções urinárias recorrentes\n- ISTs em menores\n- Gravidez precoce\n\n## O que fazer se suspeitar\n\n1. **Não interrogue** - deixe a criança falar espontaneamente\n2. **Acredite** - a maioria das crianças não inventa\n3. **Não confronte o suposto agressor**\n4. **Denuncie** - Disque 100 ou Conselho Tutelar\n5. **Busque apoio profissional**\n\n## Importante\n\n- Nunca culpe a vítima\n- Não prometa segredo absoluto\n- Documente o que foi dito, sem alterar palavras\n\n> A proteção da criança é prioridade absoluta.', videoUrl: null, duration: 720, order: 3, sectionTitle: 'Identificação', isPublished: true, isFree: true, type: 'article' },
        { title: 'Como apoiar vítimas', description: 'Acolhimento e suporte', content: null, videoUrl: null, duration: 1500, order: 4, sectionTitle: 'Apoio', isPublished: true, isFree: true, type: 'video' },
        { title: 'Recursos e serviços disponíveis', description: 'Onde buscar ajuda', content: '# Recursos e Serviços de Apoio\n\n## Canais de denúncia\n\n### Disque 100\n- Violações de direitos humanos\n- Funciona 24h\n- Anônimo e gratuito\n\n### Disque 180\n- Central de Atendimento à Mulher\n- Orientação e encaminhamento\n- 24h, gratuito\n\n### 190 - Polícia Militar\n- Em caso de emergência\n- Flagrante de violência\n\n## Serviços de atendimento\n\n### CREAS\n- Centro de Referência Especializado de Assistência Social\n- Atendimento a vítimas de violência\n- Gratuito\n\n### Delegacia da Mulher\n- Atendimento especializado\n- Registro de ocorrência\n- Medidas protetivas\n\n### CAPS\n- Centro de Atenção Psicossocial\n- Acompanhamento em saúde mental\n- Gratuito pelo SUS\n\n## Hospitais de referência\n\nProcure hospitais com protocolo de atendimento a vítimas de violência sexual:\n- Profilaxia para ISTs e HIV (até 72h)\n- Contracepção de emergência\n- Exame de corpo de delito\n\n## Organizações de apoio\n\n- **Instituto Liberta** - Combate à exploração infantil\n- **Childhood Brasil** - Proteção à infância\n- **Instituto Patrícia Galvão** - Violência contra mulher\n\n> Você não está sozinho(a). Buscar ajuda é o primeiro passo.', videoUrl: null, duration: 600, order: 5, sectionTitle: 'Apoio', isPublished: true, isFree: true, type: 'article' },
        { title: 'Prevenção e educação', description: 'Estratégias para prevenir violência', content: null, videoUrl: null, duration: 1200, order: 6, sectionTitle: 'Prevenção', isPublished: true, isFree: true, type: 'video' },
      ]
    },
  ]

  for (const courseData of courses) {
    const { lessons, id, ...course } = courseData
    
    // Create or update course (id and updatedAt are auto-generated)
    const createdCourse = await prisma.courses.upsert({
      where: { slug: course.slug },
      update: {
        ...course,
        price: course.price > 0 ? course.price : null,
      },
      create: {
        ...course,
        price: course.price > 0 ? course.price : null,
      },
    })

    console.log(`✅ Created course: ${createdCourse.title}`)

    // Delete existing lessons for this course before creating new ones
    if (lessons && lessons.length > 0) {
      await prisma.lessons.deleteMany({
        where: { courseId: createdCourse.id }
      })

      // Create lessons
      for (const lesson of lessons) {
        await prisma.lessons.create({
          data: {
            courseId: createdCourse.id,
            ...lesson,
          },
        })
      }
      console.log(`  📚 Added ${lessons.length} lessons`)
    }
  }

  console.log('✅ Course seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding courses:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
