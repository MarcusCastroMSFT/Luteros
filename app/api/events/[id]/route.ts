import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 1800 // Revalidate every 30 minutes

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
    // Require authentication
    await requireAuth(request)

    const { id } = await params

    // Parallel queries for better performance
    const [event, registrationStats] = await Promise.all([
      // Fetch event with speakers and registration count
      prisma.event.findUnique({
        where: { id },
        include: {
          speakers: {
            orderBy: { order: 'asc' }
          },
          _count: {
            select: {
              registrations: true
            }
          }
        }
      }),
      // Get registration stats with aggregation (much faster than fetching all records)
      prisma.eventRegistration.aggregate({
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
    const attendedCount = await prisma.eventRegistration.count({
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
      bookedSlots: event._count.registrations,
      availableSlots: event.totalSlots - event._count.registrations,
      cost: event.cost?.toString(),
      isFree: event.isFree,
      isPublished: event.isPublished,
      isCancelled: event.isCancelled,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      speakers: event.speakers.map(speaker => ({
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
    // Require authentication
    await requireAuth(request)

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
    const existingEvent = await prisma.event.findUnique({
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
      const slugExists = await prisma.event.findUnique({
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
    const updatedEvent = await prisma.$transaction(async (tx) => {
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
          duration: body.duration,
          image: body.image,
          totalSlots: body.totalSlots,
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
            data: body.speakers.map((speaker: { name: string; title?: string; bio?: string; image?: string; linkedin?: string; twitter?: string; order: number }, index: number) => ({
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

    // Revalidate public events page cache
    revalidateTag('events-public')

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
    // Require authentication
    await requireAuth(request)

    const { id } = await params

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
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

    // Delete event (cascade will delete related registrations and speakers)
    await prisma.event.delete({
      where: { id }
    })

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
