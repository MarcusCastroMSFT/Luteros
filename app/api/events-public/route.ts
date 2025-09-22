import { NextRequest, NextResponse } from 'next/server';
import { sampleEvents } from '@/data/events';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Extract query parameters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '9');
  const search = searchParams.get('search');

  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filter events by search term
    let filteredEvents = [...sampleEvents];
    
    if (search) {
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.location.toLowerCase().includes(search.toLowerCase()) ||
        event.description?.toLowerCase().includes(search.toLowerCase()) ||
        event.fullDescription?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by date (upcoming events first)
    filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Apply pagination
    const totalEvents = filteredEvents.length;
    const totalPages = Math.ceil(totalEvents / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        events: paginatedEvents,
        pagination: {
          currentPage: page,
          totalPages,
          totalEvents,
          eventsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });

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
