import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication - only admin should seed
    const authUser = await requireAuth(request)
    if (authUser instanceof NextResponse) {
      return authUser
    }

    console.log('🌱 Starting event seeding...')

    const events = [
      {
        title: 'Conferência de Educação em Segurança Alimentar',
        slug: 'conferencia-educacao-seguranca-alimentar',
        description: 'Junte-se a especialistas da indústria para discutir as últimas tendências em educação sobre segurança alimentar e programas de conscientização do consumidor.',
        fullDescription: 'Esta conferência abrangente reunirá especialistas líderes em segurança alimentar para discutir as mais recentes inovações e práticas em educação do consumidor.',
        location: 'São Paulo, SP',
        eventDate: new Date('2025-09-25'),
        eventTime: '8:00 - 17:00',
        duration: 540,
        cost: 435,
        isFree: false,
        totalSlots: 87,
        isPublished: true,
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
        speakers: [
          { name: 'Theresa Webb', title: 'Especialista em Segurança Alimentar', order: 1 },
          { name: 'Ronald Richards', title: 'Consultor em Nutrição', order: 2 },
        ]
      },
      {
        title: 'Cúpula de Saúde e Bem-Estar 2025',
        slug: 'cupula-saude-bem-estar-2025',
        description: 'Uma cúpula abrangente focando em saúde mental, nutrição e práticas de bem-estar para o estilo de vida moderno.',
        fullDescription: 'A Cúpula de Saúde e Bem-Estar 2025 é um evento transformador que explora as dimensões físicas, mentais e emocionais do bem-estar.',
        location: 'Rio de Janeiro, RJ',
        eventDate: new Date('2025-10-15'),
        eventTime: '9:00 - 18:00',
        duration: 540,
        cost: 520,
        isFree: false,
        totalSlots: 150,
        isPublished: true,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
        speakers: [
          { name: 'Dr. Maria Silva', title: 'Psiquiatra', order: 1 },
          { name: 'Prof. João Santos', title: 'Nutricionista Clínico', order: 2 },
        ]
      },
      {
        title: 'Workshop de Educação em Saúde Sexual',
        slug: 'workshop-educacao-saude-sexual',
        description: 'Um workshop interativo cobrindo tópicos essenciais de saúde sexual e educação para profissionais de saúde.',
        fullDescription: 'Workshop oferece abordagem abrangente para educação em saúde sexual.',
        location: 'Belo Horizonte, MG',
        eventDate: new Date('2025-11-08'),
        eventTime: '14:00 - 20:00',
        duration: 360,
        cost: 0,
        isFree: true,
        totalSlots: 60,
        isPublished: true,
        image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-4.0.3&auto=format&fit=crop&w=1498&q=80',
        speakers: [
          { name: 'Dra. Ana Oliveira', title: 'Ginecologista', order: 1 },
        ]
      },
      {
        title: 'Seminário de Nutrição Funcional',
        slug: 'seminario-nutricao-funcional',
        description: 'Explore os princípios da nutrição funcional e suas aplicações práticas no tratamento de condições de saúde.',
        fullDescription: 'Seminário detalhado sobre nutrição funcional.',
        location: 'Curitiba, PR',
        eventDate: new Date('2025-08-20'),
        eventTime: '9:00 - 17:00',
        duration: 480,
        cost: 380,
        isFree: false,
        totalSlots: 100,
        isPublished: true,
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=1453&q=80',
        speakers: [
          { name: 'Nutricionista Pedro Almeida', title: 'Especialista em Nutrição Funcional', order: 1 },
        ]
      },
      {
        title: 'Congresso de Psicologia da Saúde',
        slug: 'congresso-psicologia-saude',
        description: 'Congresso nacional reunindo profissionais de psicologia para discutir saúde mental e bem-estar.',
        fullDescription: 'O maior congresso de psicologia da saúde do país.',
        location: 'Brasília, DF',
        eventDate: new Date('2025-12-05'),
        eventTime: '8:00 - 19:00',
        duration: 660,
        cost: 650,
        isFree: false,
        totalSlots: 200,
        isPublished: true,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
        speakers: [
          { name: 'Dr. Carlos Mendes', title: 'Psicólogo Clínico', order: 1 },
        ]
      },
      {
        title: 'Fórum de Prevenção de Doenças',
        slug: 'forum-prevencao-doencas',
        description: 'Discussões sobre estratégias eficazes de prevenção de doenças e promoção da saúde.',
        fullDescription: 'Fórum multidisciplinar focado em estratégias inovadoras.',
        location: 'Porto Alegre, RS',
        eventDate: new Date('2026-01-18'),
        eventTime: '10:00 - 18:00',
        duration: 480,
        cost: 0,
        isFree: true,
        totalSlots: 120,
        isPublished: false,
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
        speakers: [
          { name: 'Dra. Beatriz Costa', title: 'Médica Preventiva', order: 1 },
        ]
      }
    ]

    const results = []

    for (const eventData of events) {
      const { speakers, ...event } = eventData
      
      try {
        // Check if event already exists
        const existing = await prisma.event.findUnique({
          where: { slug: event.slug }
        })

        if (existing) {
          console.log(`⏭️  Skipping existing event: ${event.title}`)
          continue
        }

        // Create event
        const createdEvent = await prisma.event.create({
          data: event,
        })

        console.log(`✅ Created event: ${createdEvent.title}`)

        // Create speakers
        if (speakers && speakers.length > 0) {
          for (const speaker of speakers) {
            await prisma.eventSpeaker.create({
              data: {
                eventId: createdEvent.id,
                name: speaker.name,
                title: speaker.title,
                order: speaker.order,
              },
            })
          }
          console.log(`   Added ${speakers.length} speakers`)
        }

        results.push({ success: true, event: createdEvent.title })
      } catch (error) {
        console.error(`❌ Error creating event ${event.title}:`, error)
        results.push({ success: false, event: event.title, error: String(error) })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Event seeding completed',
      results,
    })
  } catch (error) {
    console.error('Error seeding events:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed events' },
      { status: 500 }
    )
  }
}
