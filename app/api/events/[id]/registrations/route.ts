import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { eventRegistrations, users } from '@/lib/db/schema';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Verify authentication
    const authUser = await requireAuth(request);
    if (authUser instanceof NextResponse) {
      return authUser;
    }

    // Fetch event registrations with user details
    const rows = await db
      .select({
        id: eventRegistrations.id,
        registeredAt: eventRegistrations.registeredAt,
        attended: eventRegistrations.attended,
        paidAmount: eventRegistrations.paidAmount,
        paymentStatus: eventRegistrations.paymentStatus,
        userId: eventRegistrations.userId,
        userFullName: users.name,
        userDisplayName: users.displayName,
        userEmail: users.email,
      })
      .from(eventRegistrations)
      .innerJoin(users, eq(eventRegistrations.userId, users.id))
      .where(eq(eventRegistrations.eventId, id))
      .orderBy(desc(eventRegistrations.registeredAt));

    const registrationsWithEmails = rows.map((reg) => ({
      id: reg.id,
      registeredAt: reg.registeredAt,
      attended: reg.attended,
      paidAmount: reg.paidAmount,
      paymentStatus: reg.paymentStatus,
      user: {
        id: reg.userId,
        fullName: reg.userFullName,
        displayName: reg.userDisplayName,
        email: reg.userEmail || 'Email não disponível',
      },
    }));

    return NextResponse.json({ success: true, registrations: registrationsWithEmails });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
