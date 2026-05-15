import { NextRequest, NextResponse } from 'next/server';
import { and, asc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';

export async function GET(request: NextRequest) {
  // Add cache tag for manual invalidation
  const headers = new Headers({
    'Cache-Tag': 'events-public',
  });
  const { searchParams } = new URL(request.url);
  
  // Extract query parameters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '9');
  const search = searchParams.get('search');

  try {
    const where = and(
      eq(events.isPublished, true),
      eq(events.isCancelled, false),
      search ? or(ilike(events.title, `%${search}%`), ilike(events.location, `%${search}%`), ilike(events.description, `%${search}%`), ilike(events.fullDescription, `%${search}%`)) : undefined,
    )

    const eventCols = {
      id: events.id, slug: events.slug, title: events.title, description: events.description,
      fullDescription: events.fullDescription, location: events.location, eventDate: events.eventDate,
      eventTime: events.eventTime, duration: events.duration, image: events.image,
      totalSlots: events.totalSlots, cost: events.cost, isFree: events.isFree, createdAt: events.createdAt,
      bookedSlots: sql<number>`(SELECT COUNT(*)::int FROM "event_registrations" er WHERE er."eventId" = ${events.id} AND er.status = 'CONFIRMED')`,
    }

    const [[{ total }], eventsRows] = await Promise.all([
      db.select({ total: sql<number>`count(*)::int` }).from(events).where(where),
      db.select(eventCols).from(events).where(where).orderBy(asc(events.eventDate)).offset((page - 1) * limit).limit(limit),
    ]);

    const transformedEvents = eventsRows.map((event) => ({
      id: event.id, slug: event.slug, title: event.title,
      description: event.description || '', fullDescription: event.fullDescription || '',
      location: event.location, date: event.eventDate.toISOString().split('T')[0],
      time: event.eventTime, duration: event.duration, image: event.image || '',
      totalSlots: event.totalSlots, bookedSlots: event.bookedSlots,
      availableSlots: event.totalSlots - event.bookedSlots,
      cost: event.cost, isFree: event.isFree,
      paid: event.isFree ? 'Gratuito' : 'Pago',
    }));

    const totalEvents = Number(total);
    const totalPages = Math.ceil(totalEvents / limit);

    return NextResponse.json({
      success: true,
      data: {
        events: transformedEvents,
        pagination: {
          currentPage: page,
          totalPages,
          totalEvents,
          eventsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    }, { headers });

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch events',
        data: null,
      },
      { status: 500 }
    );
  }
}
