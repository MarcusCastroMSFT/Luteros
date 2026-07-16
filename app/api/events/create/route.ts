import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from '@/lib/cache'
import { requireAdmin } from '@/lib/auth-helpers'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { events, eventSpeakers } from '@/lib/db/schema'
import { submitToIndexNow } from '@/lib/indexnow'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication and authorization (admin or instructor only)
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult // Return 401/403 response
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
        { success: false, error: 'Campos obrigatÃ³rios faltando' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingEvent = await db.select({ id: events.id }).from(events).where(eq(events.slug, slug)).limit(1).then((r) => r[0] ?? null)

    if (existingEvent) {
      return NextResponse.json(
        { success: false, error: 'JÃ¡ existe um evento com esse slug' },
        { status: 400 }
      )
    }

    // Create event
    const [event] = await db.insert(events).values({
      title,
      slug,
      description,
      fullDescription,
      location,
      eventDate: new Date(eventDate),
      eventTime,
      duration: duration ? parseInt(duration, 10) : null,
      cost,
      isFree,
      totalSlots: parseInt(totalSlots, 10),
      isPublished,
      isCancelled,
      image,
    }).returning()

    // Create speakers if provided
    if (speakers && speakers.length > 0) {
      await db.insert(eventSpeakers).values(
        speakers.map((speaker: { name: string; title?: string; bio?: string; image?: string; linkedin?: string; twitter?: string; website?: string; order: number }, index: number) => ({
          eventId: event.id,
          name: speaker.name,
          title: speaker.title || null,
          bio: speaker.bio || null,
          image: speaker.image || null,
          linkedin: speaker.linkedin || null,
          twitter: speaker.twitter || null,
          website: speaker.website || null,
          order: speaker.order || index + 1,
        }))
      )
    }

    // Revalidate all event-related cache tags
    revalidateTag('events')
    revalidateTag('events-initial')
    revalidateTag('event-slugs')
    revalidateTag('upcoming-events-count')
    revalidatePath('/events')
    revalidatePath(`/events/${slug}`)
    revalidatePath('/admin/events')

    // Notify IndexNow when the event is published
    if (isPublished) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.lutteros.com.br'
      await submitToIndexNow([`${baseUrl}/events/${slug}`, `${baseUrl}/events`])
    }

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
