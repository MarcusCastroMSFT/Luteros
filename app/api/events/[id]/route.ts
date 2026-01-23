import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Require authentication and authorization (admin only)
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult // Return 401/403 response
    }

    const { id } = await params

    // Parallel queries for better performance
    const [event, registrationStats] = await Promise.all([
      // Fetch event with speakers and registration count
      prisma.events.findUnique({
        where: { id },
        include: {
          event_speakers: {
            orderBy: { order: 'asc' }
          },
          _count: {
            select: {
              event_registrations: true
            }
          }
        }
      }),
      // Get registration stats with aggregation (much faster than fetching all records)
      prisma.event_registrations.aggregate({
        where: { eventId: id },
        _count: { id: true },
      })
    ])

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    // Get attended count separately (only if needed for stats)
    const attendedCount = await prisma.event_registrations.count({
      where: { 
        eventId: id,
        attended: true 
      }
    })

    // Calculate registration stats
    const totalRegistrations = registrationStats._count.id
    const attendanceRate = totalRegistrations > 0 
      ? ((attendedCount / totalRegistrations) * 100).toFixed(1) 
      : '0'

    // Format event data
    const formattedEvent = {
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      fullDescription: event.fullDescription,
      location: event.location,
      eventDate: event.eventDate.toISOString(),
      eventTime: event.eventTime,
      duration: event.duration,
      image: event.image,
      totalSlots: event.totalSlots,
      bookedSlots: event._count.event_registrations,
      availableSlots: event.totalSlots - event._count.event_registrations,
      cost: event.cost?.toString(),
      isFree: event.isFree,
      isPublished: event.isPublished,
      isCancelled: event.isCancelled,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      speakers: event.event_speakers.map((speaker: { id: string; name: string; title: string | null; bio: string | null; image: string | null; linkedin: string | null; twitter: string | null; website: string | null }) => ({
        id: speaker.id,
        name: speaker.name,
        title: speaker.title,
        bio: speaker.bio,
        image: speaker.image,
        linkedin: speaker.linkedin,
        twitter: speaker.twitter,
        website: speaker.website,
      })),
      stats: {
        totalRegistrations,
        attendedCount,
        attendanceRate,
        occupancyRate: ((event._count.registrations / event.totalSlots) * 100).toFixed(1),
      }
    }

    return NextResponse.json({
      success: true,
      data: formattedEvent
    })

  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao buscar evento' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Require authentication and authorization (admin only)
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult // Return 401/403 response
    }

    const { id } = await params
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.location || !body.eventDate || !body.eventTime || !body.totalSlots) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    // Check if event exists
    const existingEvent = await prisma.events.findUnique({
      where: { id }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    // Check if slug is being changed and if it's already taken
    if (body.slug && body.slug !== existingEvent.slug) {
      const slugExists = await prisma.events.findUnique({
        where: { slug: body.slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Este slug já está em uso' },
          { status: 400 }
        )
      }
    }

    // Update event and speakers in a transaction
    const updatedEvent = await prisma.$transaction(async (tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
      // Update event
      const event = await tx.event.update({
        where: { id },
        data: {
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
        }
      })

      // Update speakers if provided
      if (body.speakers !== undefined) {
        // Delete existing speakers
        await tx.eventSpeaker.deleteMany({
          where: { eventId: id }
        })

        // Create new speakers
        if (body.speakers && body.speakers.length > 0) {
          await tx.eventSpeaker.createMany({
            data: body.speakers.map((speaker: { name: string; title?: string; bio?: string; image?: string; linkedin?: string; twitter?: string; website?: string; order: number }, index: number) => ({
              eventId: id,
              name: speaker.name,
              title: speaker.title || null,
              bio: speaker.bio || null,
              image: speaker.image || null,
              linkedin: speaker.linkedin || null,
              twitter: speaker.twitter || null,
              website: speaker.website || null,
              order: speaker.order || index + 1,
            }))
          })
        }
      }

      return event
    })

    // Revalidate all event-related cache tags
    revalidateTag('events', {})
    revalidateTag('events-initial', {})
    revalidateTag('upcoming-events-count', {})
    revalidateTag(`event-${existingEvent.slug}`, {})
    if (body.slug && body.slug !== existingEvent.slug) {
      revalidateTag(`event-${body.slug}`, {})
      revalidatePath(`/events/${body.slug}`)
    }
    revalidatePath('/events')
    revalidatePath(`/events/${existingEvent.slug}`)
    revalidatePath('/admin/events')

    return NextResponse.json({
      success: true,
      data: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        slug: updatedEvent.slug,
      }
    })

  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao atualizar evento' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Require authentication and authorization (admin only)
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult // Return 401/403 response
    }

    const { id } = await params

    // Check if event exists
    const existingEvent = await prisma.events.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
      }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    // Get slug before deleting for cache invalidation
    const eventToDelete = await prisma.events.findUnique({
      where: { id },
      select: { slug: true }
    })

    // Delete event (cascade will delete related registrations and speakers)
    await prisma.events.delete({
      where: { id }
    })

    // Revalidate all event-related cache tags
    revalidateTag('events', {})
    revalidateTag('events-initial', {})
    revalidateTag('event-slugs', {})
    revalidateTag('upcoming-events-count', {})
    if (eventToDelete?.slug) {
      revalidateTag(`event-${eventToDelete.slug}`, {})
      revalidatePath(`/events/${eventToDelete.slug}`)
    }
    revalidatePath('/events')
    revalidatePath('/admin/events')

    return NextResponse.json({
      success: true,
      message: 'Evento excluído com sucesso'
    })

  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao excluir evento' 
      },
      { status: 500 }
    )
  }
}
