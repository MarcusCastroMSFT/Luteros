import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
    // Build where clause for published events only
    const whereClause: Record<string, unknown> = {
      isPublished: true,
      isCancelled: false,
    };

    // Add search filter if provided
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { fullDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count and paginated events in parallel
    const [totalEvents, events] = await Promise.all([
      prisma.events.count({ where: whereClause }),
      prisma.events.findMany({
        where: whereClause,
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          fullDescription: true,
          location: true,
          eventDate: true,
          eventTime: true,
          duration: true,
          image: true,
          totalSlots: true,
          cost: true,
          isFree: true,
          createdAt: true,
          _count: {
            select: {
              event_registrations: true,
            },
          },
        },
        orderBy: {
          eventDate: 'asc', // Upcoming events first
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // Transform events to match frontend interface
    const transformedEvents = events.map((event: typeof events[number]) => {
      const bookedSlots = event._count.event_registrations;
      return {
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
        bookedSlots,
        availableSlots: event.totalSlots - bookedSlots,
        cost: event.cost,
        isFree: event.isFree,
        paid: event.isFree ? 'Gratuito' : 'Pago',
      };
    });

    // Calculate pagination
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
