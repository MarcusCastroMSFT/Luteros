import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from '@/lib/cache';
import { and, count, eq } from 'drizzle-orm';
import { getAuthUser, requireAuth } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { eventRegistrations, events } from '@/lib/db/schema';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const authUser = await requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const [event, [{ registeredCount }]] = await Promise.all([
      db.select().from(events).where(eq(events.id, id)).limit(1).then((r) => r[0] ?? null),
      db.select({ registeredCount: count() }).from(eventRegistrations).where(eq(eventRegistrations.eventId, id)),
    ]);

    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }
    if (!event.isPublished) {
      return NextResponse.json({ success: false, error: 'Event is not published' }, { status: 400 });
    }
    if (event.isCancelled) {
      return NextResponse.json({ success: false, error: 'Event is cancelled' }, { status: 400 });
    }
    if (registeredCount >= event.totalSlots) {
      return NextResponse.json({ success: false, error: 'Event is fully booked' }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, id), eq(eventRegistrations.userId, authUser.id)))
      .limit(1)
      .then((r) => r[0] ?? null);

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You are already registered for this event' },
        { status: 400 },
      );
    }

    const [result] = await db
      .insert(eventRegistrations)
      .values({
        eventId: id,
        userId: authUser.id,
        paidAmount: event.isFree ? '0' : event.cost,
        paymentStatus: event.isFree ? 'COMPLETED' : 'PENDING',
      })
      .returning();

    revalidateTag('events');
    revalidateTag(`event-${event.slug}`);

    return NextResponse.json({
      success: true,
      data: {
        registration: result,
        message: event.isFree ? 'Successfully registered for the event!' : 'Registration pending payment',
      },
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ success: true, isRegistered: false, registration: null });
    }

    const registration = await db
      .select()
      .from(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, id), eq(eventRegistrations.userId, authUser.id)))
      .limit(1)
      .then((r) => r[0] ?? null);

    return NextResponse.json({
      success: true,
      isRegistered: !!registration,
      registration: registration || null,
    });
  } catch (error) {
    console.error('Error checking registration:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const authUser = await requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const registration = await db
      .select()
      .from(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, id), eq(eventRegistrations.userId, authUser.id)))
      .limit(1)
      .then((r) => r[0] ?? null);

    if (!registration) {
      return NextResponse.json({ success: false, error: 'Registration not found' }, { status: 404 });
    }

    await db.delete(eventRegistrations).where(eq(eventRegistrations.id, registration.id));

    const event = await db.select({ slug: events.slug }).from(events).where(eq(events.id, id)).limit(1).then((r) => r[0] ?? null);

    revalidateTag('events');
    if (event?.slug) revalidateTag(`event-${event.slug}`);

    return NextResponse.json({ success: true, message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}