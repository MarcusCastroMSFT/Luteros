import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from '@/lib/cache'
import { requireAdmin } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { events, eventRegistrations, eventSpeakers } from '@/lib/db/schema'
import { submitToIndexNow } from '@/lib/indexnow'
import { and, asc, eq, sql } from 'drizzle-orm'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const [eventRow, speakers, [{ totalRegistrations }], [{ attendedCount }]] = await Promise.all([
      db
        .select({
          id: events.id,
          title: events.title,
          slug: events.slug,
          description: events.description,
          fullDescription: events.fullDescription,
          location: events.location,
          eventDate: events.eventDate,
          eventTime: events.eventTime,
          duration: events.duration,
          image: events.image,
          totalSlots: events.totalSlots,
          cost: events.cost,
          isFree: events.isFree,
          isPublished: events.isPublished,
          isCancelled: events.isCancelled,
          createdAt: events.createdAt,
          updatedAt: events.updatedAt,
        })
        .from(events)
        .where(eq(events.id, id))
        .limit(1)
        .then((r) => r[0] ?? null),
      db
        .select({
          id: eventSpeakers.id,
          name: eventSpeakers.name,
          title: eventSpeakers.title,
          bio: eventSpeakers.bio,
          image: eventSpeakers.image,
          linkedin: eventSpeakers.linkedin,
          twitter: eventSpeakers.twitter,
          website: eventSpeakers.website,
        })
        .from(eventSpeakers)
        .where(eq(eventSpeakers.eventId, id))
        .orderBy(asc(eventSpeakers.order)),
      db
        .select({ totalRegistrations: sql<number>`count(*)::int` })
        .from(eventRegistrations)
        .where(eq(eventRegistrations.eventId, id)),
      db
        .select({ attendedCount: sql<number>`count(*)::int` })
        .from(eventRegistrations)
        .where(and(eq(eventRegistrations.eventId, id), eq(eventRegistrations.attended, true))),
    ])

    if (!eventRow) {
      return NextResponse.json({ success: false, error: 'Evento não encontrado' }, { status: 404 })
    }

    const attendanceRate = totalRegistrations > 0
      ? ((attendedCount / totalRegistrations) * 100).toFixed(1)
      : '0'

    return NextResponse.json({
      success: true,
      data: {
        id: eventRow.id,
        title: eventRow.title,
        slug: eventRow.slug,
        description: eventRow.description,
        fullDescription: eventRow.fullDescription,
        location: eventRow.location,
        eventDate: eventRow.eventDate.toISOString(),
        eventTime: eventRow.eventTime,
        duration: eventRow.duration,
        image: eventRow.image,
        totalSlots: eventRow.totalSlots,
        bookedSlots: totalRegistrations,
        availableSlots: eventRow.totalSlots - totalRegistrations,
        cost: eventRow.cost?.toString(),
        isFree: eventRow.isFree,
        isPublished: eventRow.isPublished,
        isCancelled: eventRow.isCancelled,
        createdAt: eventRow.createdAt.toISOString(),
        updatedAt: eventRow.updatedAt.toISOString(),
        speakers,
        stats: {
          totalRegistrations,
          attendedCount,
          attendanceRate,
          occupancyRate: eventRow.totalSlots > 0
            ? ((totalRegistrations / eventRow.totalSlots) * 100).toFixed(1)
            : '0',
        },
      },
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro ao buscar evento' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params
    const body = await request.json()

    if (!body.title || !body.location || !body.eventDate || !body.eventTime || !body.totalSlots) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    const existingEvent = await db
      .select({ id: events.id, slug: events.slug })
      .from(events)
      .where(eq(events.id, id))
      .limit(1)
      .then((r) => r[0] ?? null)

    if (!existingEvent) {
      return NextResponse.json({ success: false, error: 'Evento não encontrado' }, { status: 404 })
    }

    if (body.slug && body.slug !== existingEvent.slug) {
      const slugExists = await db
        .select({ id: events.id })
        .from(events)
        .where(eq(events.slug, body.slug))
        .limit(1)
        .then((r) => r[0] ?? null)
      if (slugExists) {
        return NextResponse.json({ success: false, error: 'Este slug já está em uso' }, { status: 400 })
      }
    }

    const [updatedEvent] = await db.transaction(async (tx) => {
      const [ev] = await tx
        .update(events)
        .set({
          title: body.title,
          slug: body.slug || existingEvent.slug,
          description: body.description,
          fullDescription: body.fullDescription,
          location: body.location,
          eventDate: new Date(body.eventDate),
          eventTime: body.eventTime,
          duration: body.duration ? parseInt(body.duration, 10) : null,
          image: body.image,
          totalSlots: parseInt(body.totalSlots, 10),
          cost: body.cost,
          isFree: body.isFree,
          isPublished: body.isPublished,
          isCancelled: body.isCancelled,
          updatedAt: new Date(),
        })
        .where(eq(events.id, id))
        .returning()

      if (body.speakers !== undefined) {
        await tx.delete(eventSpeakers).where(eq(eventSpeakers.eventId, id))
        if (body.speakers && body.speakers.length > 0) {
          await tx.insert(eventSpeakers).values(
            body.speakers.map((s: { name: string; title?: string; bio?: string; image?: string; linkedin?: string; twitter?: string; website?: string; order?: number }, i: number) => ({
              eventId: id,
              name: s.name,
              title: s.title || null,
              bio: s.bio || null,
              image: s.image || null,
              linkedin: s.linkedin || null,
              twitter: s.twitter || null,
              website: s.website || null,
              order: s.order ?? i + 1,
            }))
          )
        }
      }

      return [ev]
    })

    revalidateTag('events')
    revalidateTag('events-initial')
    revalidateTag('upcoming-events-count')
    revalidateTag(`event-${existingEvent.slug}`)
    if (body.slug && body.slug !== existingEvent.slug) {
      revalidateTag(`event-${body.slug}`)
      revalidatePath(`/events/${body.slug}`)
    }
    revalidatePath('/events')
    revalidatePath(`/events/${existingEvent.slug}`)
    revalidatePath('/admin/events')

    // Notify IndexNow when the event is published
    if (body.isPublished) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.lutteros.com.br'
      const eventSlug = body.slug || existingEvent.slug
      await submitToIndexNow([`${baseUrl}/events/${eventSlug}`, `${baseUrl}/events`])
    }

    return NextResponse.json({
      success: true,
      data: { id: updatedEvent.id, title: updatedEvent.title, slug: updatedEvent.slug },
    })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro ao atualizar evento' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const existingEvent = await db
      .select({ id: events.id, slug: events.slug })
      .from(events)
      .where(eq(events.id, id))
      .limit(1)
      .then((r) => r[0] ?? null)

    if (!existingEvent) {
      return NextResponse.json({ success: false, error: 'Evento não encontrado' }, { status: 404 })
    }

    await db.delete(events).where(eq(events.id, id))

    revalidateTag('events')
    revalidateTag('events-initial')
    revalidateTag('event-slugs')
    revalidateTag('upcoming-events-count')
    revalidateTag(`event-${existingEvent.slug}`)
    revalidatePath(`/events/${existingEvent.slug}`)
    revalidatePath('/events')
    revalidatePath('/admin/events')

    return NextResponse.json({ success: true, message: 'Evento excluído com sucesso' })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro ao excluir evento' },
      { status: 500 }
    )
  }
}


