import { NextRequest, NextResponse } from 'next/server';
import { sampleEvents } from '@/data/events';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Find event by slug
    const event = sampleEvents.find(event => event.slug === slug);

    if (!event) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Event not found',
          data: null,
        },
        { status: 404 }
      );
    }

    // Get related events (upcoming events, excluding current event)
    const relatedEvents = sampleEvents
      .filter(e => e.slug !== slug && new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);

    return NextResponse.json({
      success: true,
      data: {
        event,
        relatedEvents,
      },
    });

  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch event',
        data: null,
      },
      { status: 500 }
    );
  }
}
