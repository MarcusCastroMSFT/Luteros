import { NextRequest, NextResponse, connection } from 'next/server'
import { requireAdminOrInstructor } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    await connection()
    
    // Verify authentication and authorization (admin or instructor only)
    const authResult = await requireAdminOrInstructor(request)
    if (authResult instanceof NextResponse) {
      return authResult // Return 401/403 response
    }

    // Get date ranges
    const now = new Date()
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    // Execute all queries in parallel for performance
    const [
      totalEvents,
      eventsThisMonth,
      eventsLastMonth,
      totalRegistrations,
      registrationsThisMonth,
      registrationsLastMonth,
      paidRegistrations,
      paidRegistrationsThisMonth,
      totalAttendees,
      attendedCount,
    ] = await Promise.all([
      // Total events
      prisma.events.count({
        where: { isPublished: true, isCancelled: false },
      }),
      
      // Events this month
      prisma.events.count({
        where: {
          isPublished: true,
          isCancelled: false,
          createdAt: { gte: firstDayThisMonth },
        },
      }),
      
      // Events last month
      prisma.events.count({
        where: {
          isPublished: true,
          isCancelled: false,
          createdAt: {
            gte: firstDayLastMonth,
            lte: lastDayLastMonth,
          },
        },
      }),
      
      // Total registrations
      prisma.event_registrations.count(),
      
      // Registrations this month
      prisma.event_registrations.count({
        where: {
          registeredAt: { gte: firstDayThisMonth },
        },
      }),
      
      // Registrations last month
      prisma.event_registrations.count({
        where: {
          registeredAt: {
            gte: firstDayLastMonth,
            lte: lastDayLastMonth,
          },
        },
      }),
      
      // Paid registrations (revenue calculation)
      prisma.event_registrations.aggregate({
        where: {
          paymentStatus: 'COMPLETED',
        },
        _sum: {
          paidAmount: true,
        },
      }),
      
      // Paid registrations this month
      prisma.event_registrations.aggregate({
        where: {
          paymentStatus: 'COMPLETED',
          registeredAt: { gte: firstDayThisMonth },
        },
        _sum: {
          paidAmount: true,
        },
      }),
      
      // Total registrations for attendance calculation
      prisma.event_registrations.count(),
      
      // Attended registrations
      prisma.event_registrations.count({
        where: { attended: true },
      }),
    ])

    // Calculate growth percentages
    const eventsGrowth = eventsLastMonth > 0
      ? (((eventsThisMonth - eventsLastMonth) / eventsLastMonth) * 100).toFixed(1)
      : '0.0'

    const registrationsGrowth = registrationsLastMonth > 0
      ? (((registrationsThisMonth - registrationsLastMonth) / registrationsLastMonth) * 100).toFixed(1)
      : '0.0'

    // Revenue calculations
    const totalRevenue = Number(paidRegistrations._sum.paidAmount || 0)
    const revenueThisMonth = Number(paidRegistrationsThisMonth._sum.paidAmount || 0)
    
    // For last month revenue, we need a separate query
    const paidRegistrationsLastMonth = await prisma.event_registrations.aggregate({
      where: {
        paymentStatus: 'COMPLETED',
        registeredAt: {
          gte: firstDayLastMonth,
          lte: lastDayLastMonth,
        },
      },
      _sum: {
        paidAmount: true,
      },
    })
    
    const revenueLastMonth = Number(paidRegistrationsLastMonth._sum.paidAmount || 0)
    const revenueGrowth = revenueLastMonth > 0
      ? (((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100).toFixed(1)
      : '0.0'

    // Attendance calculation
    const attendanceRate = totalAttendees > 0
      ? ((attendedCount / totalAttendees) * 100).toFixed(1)
      : '0.0'

    // For attendance growth, compare with last month
    const [totalRegsLastMonth, attendedLastMonth] = await Promise.all([
      prisma.event_registrations.count({
        where: {
          registeredAt: {
            gte: firstDayLastMonth,
            lte: lastDayLastMonth,
          },
        },
      }),
      prisma.event_registrations.count({
        where: {
          attended: true,
          registeredAt: {
            gte: firstDayLastMonth,
            lte: lastDayLastMonth,
          },
        },
      }),
    ])
    
    const attendanceRateLastMonth = totalRegsLastMonth > 0
      ? ((attendedLastMonth / totalRegsLastMonth) * 100)
      : 0
    
    const attendanceGrowth = attendanceRateLastMonth > 0
      ? ((parseFloat(attendanceRate) - attendanceRateLastMonth) / attendanceRateLastMonth * 100).toFixed(1)
      : '0.0'

    return NextResponse.json({
      totalEvents,
      totalEventsGrowth: eventsGrowth,
      newEventsThisMonth: eventsThisMonth,
      totalRegistrations,
      totalRegistrationsGrowth: registrationsGrowth,
      registrationsThisMonth,
      totalRevenue,
      totalRevenueGrowth: revenueGrowth,
      revenueThisMonth,
      averageAttendance: attendanceRate,
      attendanceGrowth,
    })
  } catch (error) {
    console.error('Error fetching event statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
