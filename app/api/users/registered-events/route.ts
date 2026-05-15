import { NextRequest, NextResponse, connection } from 'next/server';
import { and, asc, count, eq, gte, lt, sql } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { eventRegistrations, events } from '@/lib/db/schema';

// Type for registered event (API response)
export interface RegisteredEvent {
  id: string;
  eventId: string;
  registeredAt: string;
  attended: boolean;
  event: {
    id: string;
    slug: string;
    title: string;
    description: string;
    location: string;
    eventDate: string;
    eventTime: string;
    duration: string;
    image: string;
    totalSlots: number;
    registeredCount: number;
    isFree: boolean;
    isCancelled: boolean;
  };
}

// Format duration from minutes to readable string
function formatDuration(minutes: number | null): string {
  if (!minutes) return '1h';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

// Format date to readable string
function formatEventDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export async function GET(request: NextRequest) {
  await connection();

  try {
    const authUser = await requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;
    const userId = authUser.id;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const status = searchParams.get('status');

    const now = new Date();

    const dateCondition =
      status === 'upcoming'
        ? gte(events.eventDate, now)
        : status === 'past'
          ? lt(events.eventDate, now)
          : undefined;

    const whereCondition = and(eq(eventRegistrations.userId, userId), dateCondition);

    const [registrations, [{ total }], [{ upcomingCount }], [{ pastCount }]] = await Promise.all([
      db
        .select({
          id: eventRegistrations.id,
          eventId: eventRegistrations.eventId,
          registeredAt: eventRegistrations.registeredAt,
          attended: eventRegistrations.attended,
          eventSlug: events.slug,
          eventTitle: events.title,
          eventDescription: events.description,
          eventLocation: events.location,
          eventDate: events.eventDate,
          eventTime: events.eventTime,
          eventDuration: events.duration,
          eventImage: events.image,
          eventTotalSlots: events.totalSlots,
          eventIsFree: events.isFree,
          eventIsCancelled: events.isCancelled,
          registeredCount: sql<number>`(SELECT COUNT(*)::int FROM "event_registrations" WHERE "eventId" = ${events.id})`,
        })
        .from(eventRegistrations)
        .innerJoin(events, eq(eventRegistrations.eventId, events.id))
        .where(whereCondition)
        .orderBy(asc(events.eventDate))
        .limit(limit)
        .offset((page - 1) * limit),
      db
        .select({ total: count() })
        .from(eventRegistrations)
        .innerJoin(events, eq(eventRegistrations.eventId, events.id))
        .where(whereCondition),
      db
        .select({ upcomingCount: count() })
        .from(eventRegistrations)
        .innerJoin(events, eq(eventRegistrations.eventId, events.id))
        .where(and(eq(eventRegistrations.userId, userId), gte(events.eventDate, now))),
      db
        .select({ pastCount: count() })
        .from(eventRegistrations)
        .innerJoin(events, eq(eventRegistrations.eventId, events.id))
        .where(and(eq(eventRegistrations.userId, userId), lt(events.eventDate, now))),
    ]);

    const registeredEvents: RegisteredEvent[] = registrations.map((reg) => ({
      id: reg.id,
      eventId: reg.eventId,
      registeredAt: reg.registeredAt.toISOString(),
      attended: reg.attended,
      event: {
        id: reg.eventId,
        slug: reg.eventSlug,
        title: reg.eventTitle,
        description: reg.eventDescription,
        location: reg.eventLocation,
        eventDate: formatEventDate(reg.eventDate),
        eventTime: reg.eventTime,
        duration: formatDuration(reg.eventDuration),
        image: reg.eventImage || '/images/event-placeholder.jpg',
        totalSlots: reg.eventTotalSlots,
        registeredCount: reg.registeredCount,
        isFree: reg.eventIsFree,
        isCancelled: reg.eventIsCancelled,
      },
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        registeredEvents,
        pagination: {
          currentPage: page,
          totalPages,
          totalEvents: total,
          eventsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        stats: {
          total: Number(upcomingCount) + Number(pastCount),
          upcoming: Number(upcomingCount),
          past: Number(pastCount),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching registered events:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar seus eventos' },
      { status: 500 },
    );
  }
}
