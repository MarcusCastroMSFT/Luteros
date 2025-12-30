import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await requireAuth(request)
    if (authUser instanceof NextResponse) {
      return authUser
    }

    // Parse request body
    const body = await request.json()
    const {
      title,
      slug,
      description,
      fullDescription,
      location,
      eventDate,
      eventTime,
      duration,
      cost,
      isFree,
      totalSlots,

      isPublished = false,
      isCancelled = false,
      image,
      speakers = [],
    } = body

    // Validation
    if (!title || !slug || !description || !location || !eventDate || !eventTime || !totalSlots) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingEvent = await prisma.event.findUnique({
      where: { slug }
    })

    if (existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Já existe um evento com esse slug' },
        { status: 400 }
      )
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        fullDescription,
        location,
        eventDate: new Date(eventDate),
        eventTime,
        duration,
        cost,
        isFree,
        totalSlots,

        isPublished,
        isCancelled,
        image,
      },
    })

    // Create speakers if provided
    if (speakers && speakers.length > 0) {
      await Promise.all(
        speakers.map((speaker: { name: string; title?: string; bio?: string; order: number }, index: number) =>
          prisma.eventSpeaker.create({
            data: {
              eventId: event.id,
              name: speaker.name,
              title: speaker.title || null,
              bio: speaker.bio || null,
              image: speaker.image || null,
              linkedin: speaker.linkedin || null,
              twitter: speaker.twitter || null,
              website: speaker.website || null,
              order: speaker.order || index + 1,
            },
          })
        )
      )
    }

    // Revalidate public events page cache
    revalidateTag('events-public')

    return NextResponse.json({
      success: true,
      data: event,
    })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao criar evento' },
      { status: 500 }
    )
  }
}
