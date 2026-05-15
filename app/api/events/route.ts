import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { asc, desc, ilike, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'

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
    // Verify authentication and authorization (admin only)
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult // Return 401/403 response
    }

    const where = search ? or(ilike(events.title, `%${search}%`), ilike(events.description, `%${search}%`), ilike(events.location, `%${search}%`)) : undefined

    const sortColMap: Record<string, unknown> = {
      header: events.title,
      date: events.eventDate,
      location: events.location,
      createdAt: events.createdAt,
    }
    const sortCol = (sortColMap[sortBy] ?? events.eventDate) as Parameters<typeof asc>[0]
    const orderFn = sortOrder === 'asc' ? asc : desc

    const [eventsRows, [{ total }]] = await Promise.all([
      db.select({
        id: events.id, slug: events.slug, title: events.title, location: events.location,
        eventDate: events.eventDate, eventTime: events.eventTime, totalSlots: events.totalSlots,
        isFree: events.isFree, cost: events.cost, isPublished: events.isPublished, isCancelled: events.isCancelled,
        firstSpeakerName: sql<string | null>`(SELECT name FROM "event_speakers" s WHERE s."eventId" = ${events.id} ORDER BY s."order" LIMIT 1)`,
        registrationCount: sql<number>`(SELECT COUNT(*)::int FROM "event_registrations" er WHERE er."eventId" = ${events.id})`,
      }).from(events).where(where).orderBy(orderFn(sortCol)).offset(page * pageSize).limit(pageSize),
      db.select({ total: sql<number>`count(*)::int` }).from(events).where(where),
    ])

    const transformedEvents: Event[] = eventsRows.map((event) => ({
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
      target: event.registrationCount.toString(),
      limit: event.totalSlots.toString(),
      reviewer: event.firstSpeakerName || 'Não Atribuído',
    }))

    const totalCount = Number(total)
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
