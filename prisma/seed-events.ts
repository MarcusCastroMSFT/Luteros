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

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Use DIRECT_URL for seeding (bypasses connection pooler)
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting event seeding...')
  
  if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
    throw new Error('DATABASE_URL or DIRECT_URL environment variable is not set.')
  }
  
  console.log('✅ Database connection configured')

  const events = [
    {
      title: 'Conferência de Educação em Segurança Alimentar',
      slug: 'conferencia-educacao-seguranca-alimentar',
      description: 'Junte-se a especialistas da indústria para discutir as últimas tendências em educação sobre segurança alimentar e programas de conscientização do consumidor.',
      fullDescription: 'Esta conferência abrangente reunirá especialistas líderes em segurança alimentar para discutir as mais recentes inovações e práticas em educação do consumidor. Aprenda sobre metodologias eficazes, estudos de caso e estratégias para melhorar a conscientização sobre segurança alimentar.',
      location: 'São Paulo, SP',
      eventDate: new Date('2025-09-25'),
      eventTime: '8:00 - 17:00',
      duration: 540,
      cost: 435,
      isFree: false,
      totalSlots: 87,
      bookedSlots: 4,
      isPublished: true,
      isCancelled: false,
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      speakers: [
        {
          name: 'Theresa Webb',
          title: 'Especialista em Segurança Alimentar',
          image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
          order: 1
        },
        {
          name: 'Ronald Richards',
          title: 'Consultor em Nutrição',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
          order: 2
        },
        {
          name: 'Savannah Nguyen',
          title: 'Pesquisadora em Saúde Pública',
          image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80',
          order: 3
        }
      ]
    },
    {
      title: 'Cúpula de Saúde e Bem-Estar 2025',
      slug: 'cupula-saude-bem-estar-2025',
      description: 'Uma cúpula abrangente focando em saúde mental, nutrição e práticas de bem-estar para o estilo de vida moderno.',
      fullDescription: 'A Cúpula de Saúde e Bem-Estar 2025 é um evento transformador que explora as dimensões físicas, mentais e emocionais do bem-estar. Com palestrantes internacionais e workshops práticos.',
      location: 'Rio de Janeiro, RJ',
      eventDate: new Date('2025-10-15'),
      eventTime: '9:00 - 18:00',
      duration: 540,
      cost: 520,
      isFree: false,
      totalSlots: 150,
      bookedSlots: 23,
      isPublished: true,
      isCancelled: false,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      speakers: [
        {
          name: 'Dr. Maria Silva',
          title: 'Psiquiatra e Especialista em Bem-Estar',
          image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
          order: 1
        },
        {
          name: 'Prof. João Santos',
          title: 'Nutricionista Clínico',
          image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
          order: 2
        }
      ]
    },
    {
      title: 'Workshop de Educação em Saúde Sexual',
      slug: 'workshop-educacao-saude-sexual',
      description: 'Um workshop interativo cobrindo tópicos essenciais de saúde sexual e educação para profissionais de saúde.',
      fullDescription: 'Este workshop oferece uma abordagem abrangente para educação em saúde sexual, fornecendo ferramentas práticas e conhecimentos atualizados para profissionais que trabalham com pacientes.',
      location: 'Belo Horizonte, MG',
      eventDate: new Date('2025-11-08'),
      eventTime: '14:00 - 20:00',
      duration: 360,
      cost: 0,
      isFree: true,
      totalSlots: 60,
      bookedSlots: 45,
      isPublished: true,
      isCancelled: false,
      image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1498&q=80',
      speakers: [
        {
          name: 'Dra. Ana Oliveira',
          title: 'Ginecologista',
          image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
          order: 1
        }
      ]
    },
    {
      title: 'Seminário de Nutrição Funcional',
      slug: 'seminario-nutricao-funcional',
      description: 'Explore os princípios da nutrição funcional e suas aplicações práticas no tratamento de condições de saúde.',
      fullDescription: 'Um seminário detalhado sobre nutrição funcional, abordando desde fundamentos teóricos até aplicações clínicas práticas.',
      location: 'Curitiba, PR',
      eventDate: new Date('2025-08-20'),
      eventTime: '9:00 - 17:00',
      duration: 480,
      cost: 380,
      isFree: false,
      totalSlots: 100,
      bookedSlots: 78,
      isPublished: true,
      isCancelled: false,
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1453&q=80',
      speakers: [
        {
          name: 'Nutricionista Pedro Almeida',
          title: 'Especialista em Nutrição Funcional',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
          order: 1
        }
      ]
    },
    {
      title: 'Congresso de Psicologia da Saúde',
      slug: 'congresso-psicologia-saude',
      description: 'Congresso nacional reunindo profissionais de psicologia para discutir saúde mental e bem-estar.',
      fullDescription: 'O maior congresso de psicologia da saúde do país, com palestras, workshops e networking para profissionais da área.',
      location: 'Brasília, DF',
      eventDate: new Date('2025-12-05'),
      eventTime: '8:00 - 19:00',
      duration: 660,
      cost: 650,
      isFree: false,
      totalSlots: 200,
      bookedSlots: 156,
      isPublished: true,
      isCancelled: false,
      image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80',
      speakers: [
        {
          name: 'Dr. Carlos Mendes',
          title: 'Psicólogo Clínico',
          image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
          order: 1
        }
      ]
    },
    {
      title: 'Fórum de Prevenção de Doenças',
      slug: 'forum-prevencao-doencas',
      description: 'Discussões sobre estratégias eficazes de prevenção de doenças e promoção da saúde.',
      fullDescription: 'Fórum multidisciplinar focado em estratégias inovadoras de prevenção e controle de doenças.',
      location: 'Porto Alegre, RS',
      eventDate: new Date('2026-01-18'),
      eventTime: '10:00 - 18:00',
      duration: 480,
      cost: 0,
      isFree: true,
      totalSlots: 120,
      bookedSlots: 0,
      isPublished: false,
      isCancelled: false,
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      speakers: []
    }
  ]

  for (const eventData of events) {
    const { speakers, ...event } = eventData
    
    // Create event
    const createdEvent = await prisma.event.upsert({
      where: { slug: event.slug },
      update: event,
      create: event,
    })

    console.log(`Created event: ${createdEvent.title}`)

    // Create speakers
    if (speakers && speakers.length > 0) {
      for (const speaker of speakers) {
        await prisma.eventSpeaker.create({
          data: {
            eventId: createdEvent.id,
            ...speaker,
          },
        })
      }
      console.log(`  Added ${speakers.length} speakers`)
    }
  }

  console.log('✅ Event seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding events:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
