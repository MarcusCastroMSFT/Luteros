import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { events, eventRegistrations, eventSpeakers } from '@/lib/db/schema'
import { and, asc, eq, gte, ne, sql } from 'drizzle-orm'

interface Props {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  const headers = new Headers({ 'Cache-Tag': 'events-public' })

  try {
    const { slug } = await params

    const event = await db
      .select({
        id: events.id,
        slug: events.slug,
        title: events.title,
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
        createdAt: events.createdAt,
        registrationCount: sql<number>`(select count(*)::int from ${eventRegistrations} where ${eventRegistrations.eventId} = ${events.id})`,
      })
      .from(events)
      .where(and(eq(events.slug, slug), eq(events.isPublished, true), eq(events.isCancelled, false)))
      .limit(1)
      .then((r) => r[0] ?? null)

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found', data: null },
        { status: 404, headers }
      )
    }

    const speakers = await db
      .select({
        id: eventSpeakers.id,
        name: eventSpeakers.name,
        title: eventSpeakers.title,
        bio: eventSpeakers.bio,
        image: eventSpeakers.image,
        linkedin: eventSpeakers.linkedin,
        twitter: eventSpeakers.twitter,
        website: eventSpeakers.website,
        order: eventSpeakers.order,
      })
      .from(eventSpeakers)
      .where(eq(eventSpeakers.eventId, event.id))
      .orderBy(asc(eventSpeakers.order))

    const relatedRows = await db
      .select({
        id: events.id,
        slug: events.slug,
        title: events.title,
        description: events.description,
        location: events.location,
        eventDate: events.eventDate,
        eventTime: events.eventTime,
        duration: events.duration,
        image: events.image,
        totalSlots: events.totalSlots,
        cost: events.cost,
        isFree: events.isFree,
        registrationCount: sql<number>`(select count(*)::int from ${eventRegistrations} where ${eventRegistrations.eventId} = ${events.id})`,
      })
      .from(events)
      .where(
        and(
          ne(events.slug, slug),
          eq(events.isPublished, true),
          eq(events.isCancelled, false),
          gte(events.eventDate, new Date()),
        )
      )
      .orderBy(asc(events.eventDate))
      .limit(3)

    const transformedEvent = {
      id: event.id,
      slug: event.slug,
      title: event.title,
      description: event.description || '',
      fullDescription: event.fullDescription || '',
      location: event.location,
      date: event.eventDate.toISOString().split('T')[0],
      time: event.eventTime,
      duration: event.duration,
      image: event.image || '',
      totalSlots: event.totalSlots,
      bookedSlots: event.registrationCount,
      availableSlots: event.totalSlots - event.registrationCount,
      cost: event.cost,
      isFree: event.isFree,
      paid: event.isFree ? 'Gratuito' : 'Pago',
      speakers,
    }

    const transformedRelatedEvents = relatedRows.map((e) => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      description: e.description || '',
      location: e.location,
      date: e.eventDate.toISOString().split('T')[0],
      time: e.eventTime,
      duration: e.duration,
      image: e.image || '',
      totalSlots: e.totalSlots,
      bookedSlots: e.registrationCount,
      availableSlots: e.totalSlots - e.registrationCount,
      cost: e.cost,
      isFree: e.isFree,
      paid: e.isFree ? 'Gratuito' : 'Pago',
    }))

    return NextResponse.json({
      success: true,
      data: {
        event: transformedEvent,
        relatedEvents: transformedRelatedEvents,
      },
    }, { headers })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event', data: null },
      { status: 500 }
    )
  }
}

