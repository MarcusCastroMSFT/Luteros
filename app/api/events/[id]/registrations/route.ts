import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { createClient } from '@supabase/supabase-js';

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

    // Fetch event registrations with user details in a single optimized query
    const registrations = await prisma.eventRegistration.findMany({
      where: {
        eventId: id,
      },
      select: {
        id: true,
        registeredAt: true,
        attended: true,
        paidAmount: true,
        paymentStatus: true,
        userId: true,
        user: {
          select: {
            id: true,
            fullName: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        registeredAt: 'desc',
      },
    });

    // Use Supabase Service Role to fetch emails (only if service role key is available)
    let emailMap = new Map<string, string>();
    
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      // Fetch users in batch for better performance
      const userIds = registrations.map((r: { userId: string }) => r.userId);
      
      if (userIds.length > 0) {
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        
        if (users?.users) {
          emailMap = new Map(
            users.users
              .filter((u: { id: string }) => userIds.includes(u.id))
              .map((u: { id: string; email?: string }) => [u.id, u.email || ''])
          );
        }
      }
    }
    
    // Combine registration data with emails
    const registrationsWithEmails = registrations.map((reg: typeof registrations[number]) => ({
      id: reg.id,
      registeredAt: reg.registeredAt,
      attended: reg.attended,
      paidAmount: reg.paidAmount,
      paymentStatus: reg.paymentStatus,
      user: {
        id: reg.user.id,
        fullName: reg.user.fullName,
        displayName: reg.user.displayName,
        email: emailMap.get(reg.userId) || 'Email não disponível',
      },
    }));

    return NextResponse.json({
      success: true,
      registrations: registrationsWithEmails,
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
