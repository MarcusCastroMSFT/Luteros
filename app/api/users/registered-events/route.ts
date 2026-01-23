import { NextRequest, NextResponse, connection } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// Type for registration from Prisma query
interface RegistrationWithEvent {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: Date;
  attended: boolean;
  paidAmount: unknown;
  paymentStatus: string | null;
  events: {
    id: string;
    slug: string;
    title: string;
    description: string;
    location: string;
    eventDate: Date;
    eventTime: string;
    duration: number | null;
    image: string | null;
    totalSlots: number;
    cost: unknown;
    isFree: boolean;
    isCancelled: boolean;
    _count: {
      event_registrations: number;
    };
  };
}

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
  // Signal that this route uses request-specific data (auth cookies)
  await connection();

  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Você precisa estar logado para ver seus eventos' },
        { status: 401 }
      );
    }

    // Parse query params for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const status = searchParams.get('status'); // 'upcoming', 'past', 'all'

    const now = new Date();

    // Build where condition for events
    type EventWhereCondition = {
      eventDate?: { gte: Date } | { lt: Date };
    };

    let eventWhereCondition: EventWhereCondition = {};

    // Filter by event date status
    if (status === 'upcoming') {
      eventWhereCondition = { eventDate: { gte: now } };
    } else if (status === 'past') {
      eventWhereCondition = { eventDate: { lt: now } };
    }

    // Fetch registrations with event data
    const [registrations, totalCount, upcomingCount, pastCount] = await Promise.all([
      prisma.event_registrations.findMany({
        where: {
          userId: user.id,
          events: eventWhereCondition,
        },
        include: {
          events: {
            select: {
              id: true,
              slug: true,
              title: true,
              description: true,
              location: true,
              eventDate: true,
              eventTime: true,
              duration: true,
              image: true,
              totalSlots: true,
              cost: true,
              isFree: true,
              isCancelled: true,
              _count: {
                select: {
                  event_registrations: true,
                },
              },
            },
          },
        },
        orderBy: { events: { eventDate: 'asc' } },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.event_registrations.count({
        where: {
          userId: user.id,
          events: eventWhereCondition,
        },
      }),
      prisma.event_registrations.count({
        where: {
          userId: user.id,
          events: { eventDate: { gte: now } },
        },
      }),
      prisma.event_registrations.count({
        where: {
          userId: user.id,
          events: { eventDate: { lt: now } },
        },
      }),
    ]);

    // Transform data for response
    const registeredEvents: RegisteredEvent[] = (registrations as RegistrationWithEvent[]).map((registration) => {
      const event = registration.events;

      return {
        id: registration.id,
        eventId: event.id,
        registeredAt: registration.registeredAt.toISOString(),
        attended: registration.attended,
        event: {
          id: event.id,
          slug: event.slug,
          title: event.title,
          description: event.description,
          location: event.location,
          eventDate: formatEventDate(event.eventDate),
          eventTime: event.eventTime,
          duration: formatDuration(event.duration),
          image: event.image || '/images/event-placeholder.jpg',
          totalSlots: event.totalSlots,
          registeredCount: event._count.event_registrations,
          isFree: event.isFree,
          isCancelled: event.isCancelled,
        },
      };
    });

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const total = upcomingCount + pastCount;

    return NextResponse.json({
      success: true,
      data: {
        registeredEvents,
        pagination: {
          currentPage: page,
          totalPages,
          totalEvents: totalCount,
          eventsPerPage: limit,
          hasNextPage,
          hasPrevPage,
        },
        stats: {
          total,
          upcoming: upcomingCount,
          past: pastCount,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching registered events:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar seus eventos' },
      { status: 500 }
    );
  }
}
