import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  const headers = new Headers({
    'Cache-Tag': 'events-public',
  });

  try {
    const { slug } = await params;

    // Find event by slug (only published, non-cancelled events)
    const event = await prisma.event.findFirst({
      where: {
        slug,
        isPublished: true,
        isCancelled: false,
      },
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
            registrations: true,
          },
        },
        speakers: {
          select: {
            id: true,
            name: true,
            title: true,
            bio: true,
            image: true,
            linkedin: true,
            twitter: true,
            website: true,
            order: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Event not found',
          data: null,
        },
        { status: 404, headers }
      );
    }

    // Get related events (upcoming published events, excluding current event)
    const relatedEvents = await prisma.event.findMany({
      where: {
        slug: { not: slug },
        isPublished: true,
        isCancelled: false,
        eventDate: { gte: new Date() },
      },
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
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        eventDate: 'asc',
      },
      take: 3,
    });

    // Transform event to match frontend interface
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
      bookedSlots: event._count.registrations,
      availableSlots: event.totalSlots - event._count.registrations,
      cost: event.cost,
      isFree: event.isFree,
      paid: event.isFree ? 'Gratuito' : 'Pago',
      speakers: event.speakers,
    };

    // Transform related events
    const transformedRelatedEvents = relatedEvents.map((e: typeof relatedEvents[number]) => ({
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
      bookedSlots: e._count.registrations,
      availableSlots: e.totalSlots - e._count.registrations,
      cost: e.cost,
      isFree: e.isFree,
      paid: e.isFree ? 'Gratuito' : 'Pago',
    }));

    return NextResponse.json({
      success: true,
      data: {
        event: transformedEvent,
        relatedEvents: transformedRelatedEvents,
      },
    }, { headers });

  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch event',
        data: null,
      },
      { status: 500, headers }
    );
  }
}
