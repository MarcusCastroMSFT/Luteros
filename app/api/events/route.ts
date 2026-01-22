import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrInstructor } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'

export interface Event {
  id: string
  header: string
  type: string
  status: "Ativo" | "Cancelado" | "Pendente"
  location: string
  date: string
  time: string
  paid: "Gratuito" | "Pago"
  target: string
  limit: string
  reviewer: string
}

// Helper functions
function getEventType(title: string): string {
  const titleLower = title.toLowerCase()
  if (titleLower.includes('conferência')) return 'Conferência'
  if (titleLower.includes('cúpula')) return 'Cúpula'
  if (titleLower.includes('workshop')) return 'Workshop'
  if (titleLower.includes('seminário')) return 'Seminário'
  if (titleLower.includes('simpósio')) return 'Simpósio'
  if (titleLower.includes('fórum')) return 'Fórum'
  if (titleLower.includes('congresso')) return 'Congresso'
  if (titleLower.includes('encontro')) return 'Encontro'
  if (titleLower.includes('mesa redonda')) return 'Mesa Redonda'
  if (titleLower.includes('palestra')) return 'Palestra'
  return 'Evento'
}

function getEventStatus(isPublished: boolean, isCancelled: boolean): "Ativo" | "Cancelado" | "Pendente" {
  if (isCancelled) return 'Cancelado'
  if (isPublished) return 'Ativo'
  return 'Pendente'
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Extract pagination parameters with validation
  const page = Math.max(0, parseInt(searchParams.get('page') || '0'))
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10')))
  const search = searchParams.get('search') || ''
  
  // Extract sorting parameters
  const sortBy = searchParams.get('sortBy') || 'eventDate'
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

  try {
    // Verify authentication and authorization (admin or instructor only)
    const authResult = await requireAdminOrInstructor(request)
    if (authResult instanceof NextResponse) {
      return authResult // Return 401/403 response
    }

    // Build where condition
    const whereCondition: Record<string, unknown> = {}
    
    // Apply search filter
    if (search) {
      whereCondition.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Build orderBy - map frontend fields to database fields
    const orderByMap: Record<string, Record<string, unknown>> = {
      header: { title: sortOrder },
      date: { eventDate: sortOrder },
      location: { location: sortOrder },
      createdAt: { createdAt: sortOrder },
    }
    
    const orderBy = orderByMap[sortBy] || { eventDate: sortOrder }

    // Execute queries in parallel for performance
    const [events, totalCount] = await Promise.all([
      prisma.events.findMany({
        where: whereCondition,
        select: {
          id: true,
          slug: true,
          title: true,
          location: true,
          eventDate: true,
          eventTime: true,
          totalSlots: true,
          isFree: true,
          cost: true,
          isPublished: true,
          isCancelled: true,
          event_speakers: {
            select: {
              name: true,
            },
            orderBy: {
              order: 'asc',
            },
            take: 1,
          },
          _count: {
            select: {
              event_registrations: true,
            },
          },
        },
        orderBy,
        skip: page * pageSize,
        take: pageSize,
      }),
      prisma.events.count({
        where: whereCondition,
      }),
    ])

    // Transform data to match frontend interface
    const transformedEvents: Event[] = events.map((event: typeof events[number]) => ({
      id: event.id,
      slug: event.slug,
      header: event.title,
      type: getEventType(event.title),
      status: getEventStatus(event.isPublished, event.isCancelled),
      isPublished: event.isPublished,
      location: event.location,
      date: event.eventDate.toISOString().split('T')[0],
      time: event.eventTime,
      paid: event.isFree ? 'Gratuito' : 'Pago',
      target: event._count.event_registrations.toString(),
      limit: event.totalSlots.toString(),
      reviewer: event.event_speakers[0]?.name || 'Não Atribuído',
    }))

    const pageCount = Math.ceil(totalCount / pageSize)

    return NextResponse.json({
      data: transformedEvents,
      totalCount,
      pageCount,
      page,
      pageSize,
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
