import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if event exists and has available slots
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        totalSlots: true,
        isPublished: true,
        isCancelled: true,
        isFree: true,
        cost: true,
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    if (!event.isPublished) {
      return NextResponse.json(
        { success: false, error: 'Event is not published' },
        { status: 400 }
      );
    }

    if (event.isCancelled) {
      return NextResponse.json(
        { success: false, error: 'Event is cancelled' },
        { status: 400 }
      );
    }

    if (event._count.registrations >= event.totalSlots) {
      return NextResponse.json(
        { success: false, error: 'Event is fully booked' },
        { status: 400 }
      );
    }

    // Check if user is already registered
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: user.id,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { success: false, error: 'You are already registered for this event' },
        { status: 400 }
      );
    }

    // Create registration
    const result = await prisma.eventRegistration.create({
      data: {
        eventId: id,
        userId: user.id,
        paidAmount: event.isFree ? 0 : event.cost,
        paymentStatus: event.isFree ? 'COMPLETED' : 'PENDING',
      },
    });

    // Get event slug for cache invalidation
    const eventWithSlug = await prisma.event.findUnique({
      where: { id },
      select: { slug: true }
    });

    // Revalidate event cache to update slot count
    revalidateTag('events', {});
    if (eventWithSlug?.slug) {
      revalidateTag(`event-${eventWithSlug.slug}`, {});
    }

    return NextResponse.json({
      success: true,
      data: {
        registration: result,
        message: event.isFree 
          ? 'Successfully registered for the event!' 
          : 'Registration pending payment',
      },
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Check registration status
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, isRegistered: false },
        { status: 200 }
      );
    }

    // Check if user is registered
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: user.id,
        },
      },
      select: {
        id: true,
        registeredAt: true,
        paymentStatus: true,
        attended: true,
      },
    });

    return NextResponse.json({
      success: true,
      isRegistered: !!registration,
      registration: registration || null,
    });
  } catch (error) {
    console.error('Error checking registration:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Cancel registration
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if registration exists
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: user.id,
        },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Delete registration
    await prisma.eventRegistration.delete({
      where: {
        id: registration.id,
      },
    });

    // Get event slug for cache invalidation
    const eventWithSlug = await prisma.event.findUnique({
      where: { id },
      select: { slug: true }
    });

    // Revalidate event cache to update slot count
    revalidateTag('events', {});
    if (eventWithSlug?.slug) {
      revalidateTag(`event-${eventWithSlug.slug}`, {});
    }

    return NextResponse.json({
      success: true,
      message: 'Registration cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}