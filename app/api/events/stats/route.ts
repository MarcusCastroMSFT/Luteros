import { NextRequest, NextResponse, connection } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { events, eventRegistrations } from '@/lib/db/schema'

export async function GET(request: NextRequest) {
  try {
    await connection()
    
    // Verify authentication and authorization (admin or instructor only)
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult // Return 401/403 response
    }

    // Get date ranges
    const now = new Date()
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    const [rows] = await db.select({
      totalEvents: sql<number>`count(*) filter (where ${events.isPublished} = true AND ${events.isCancelled} = false)::int`,
      eventsThisMonth: sql<number>`count(*) filter (where ${events.isPublished} = true AND ${events.isCancelled} = false AND ${events.createdAt} >= ${firstDayThisMonth})::int`,
      eventsLastMonth: sql<number>`count(*) filter (where ${events.isPublished} = true AND ${events.isCancelled} = false AND ${events.createdAt} >= ${firstDayLastMonth} AND ${events.createdAt} <= ${lastDayLastMonth})::int`,
    }).from(events)

    const [regRows] = await db.select({
      totalRegistrations: sql<number>`count(*)::int`,
      registrationsThisMonth: sql<number>`count(*) filter (where ${eventRegistrations.registeredAt} >= ${firstDayThisMonth})::int`,
      registrationsLastMonth: sql<number>`count(*) filter (where ${eventRegistrations.registeredAt} >= ${firstDayLastMonth} AND ${eventRegistrations.registeredAt} <= ${lastDayLastMonth})::int`,
      totalRevenue: sql<number>`coalesce(sum(case when ${eventRegistrations.paymentStatus} = 'COMPLETED' then ${eventRegistrations.paidAmount}::float else 0 end), 0)`,
      revenueThisMonth: sql<number>`coalesce(sum(case when ${eventRegistrations.paymentStatus} = 'COMPLETED' AND ${eventRegistrations.registeredAt} >= ${firstDayThisMonth} then ${eventRegistrations.paidAmount}::float else 0 end), 0)`,
      revenueLastMonth: sql<number>`coalesce(sum(case when ${eventRegistrations.paymentStatus} = 'COMPLETED' AND ${eventRegistrations.registeredAt} >= ${firstDayLastMonth} AND ${eventRegistrations.registeredAt} <= ${lastDayLastMonth} then ${eventRegistrations.paidAmount}::float else 0 end), 0)`,
      totalAttendees: sql<number>`count(*)::int`,
      attendedCount: sql<number>`count(*) filter (where ${eventRegistrations.attended} = true)::int`,
      totalRegsLastMonth: sql<number>`count(*) filter (where ${eventRegistrations.registeredAt} >= ${firstDayLastMonth} AND ${eventRegistrations.registeredAt} <= ${lastDayLastMonth})::int`,
      attendedLastMonth: sql<number>`count(*) filter (where ${eventRegistrations.attended} = true AND ${eventRegistrations.registeredAt} >= ${firstDayLastMonth} AND ${eventRegistrations.registeredAt} <= ${lastDayLastMonth})::int`,
    }).from(eventRegistrations)

    const totalEvents = Number(rows.totalEvents)
    const eventsThisMonth = Number(rows.eventsThisMonth)
    const eventsLastMonth = Number(rows.eventsLastMonth)
    const totalRegistrations = Number(regRows.totalRegistrations)
    const registrationsThisMonth = Number(regRows.registrationsThisMonth)
    const registrationsLastMonth = Number(regRows.registrationsLastMonth)
    const totalRevenue = Number(regRows.totalRevenue)
    const revenueThisMonth = Number(regRows.revenueThisMonth)
    const revenueLastMonth = Number(regRows.revenueLastMonth)
    const totalAttendees = Number(regRows.totalAttendees)
    const attendedCount = Number(regRows.attendedCount)
    const totalRegsLastMonth = Number(regRows.totalRegsLastMonth)
    const attendedLastMonth = Number(regRows.attendedLastMonth)

    const eventsGrowth = eventsLastMonth > 0
      ? (((eventsThisMonth - eventsLastMonth) / eventsLastMonth) * 100).toFixed(1)
      : '0.0'

    const registrationsGrowth = registrationsLastMonth > 0
      ? (((registrationsThisMonth - registrationsLastMonth) / registrationsLastMonth) * 100).toFixed(1)
      : '0.0'

    const revenueGrowth = revenueLastMonth > 0
      ? (((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100).toFixed(1)
      : '0.0'

    const attendanceRate = totalAttendees > 0
      ? ((attendedCount / totalAttendees) * 100).toFixed(1)
      : '0.0'

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
