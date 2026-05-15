import { NextRequest, NextResponse, connection } from 'next/server'
import { db } from '@/lib/db'
import { newsletterSubscribers } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/auth-helpers'
import { sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  await connection()

  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - 7)

    const [{ total, active, newThisMonth, newLastMonth, newThisWeek, unsubscribedThisMonth, pending }] = await db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`count(*) filter (where ${newsletterSubscribers.status} = 'ACTIVE')::int`,
        newThisMonth: sql<number>`count(*) filter (where ${newsletterSubscribers.createdAt} >= ${startOfMonth})::int`,
        newLastMonth: sql<number>`count(*) filter (where ${newsletterSubscribers.createdAt} >= ${startOfLastMonth} and ${newsletterSubscribers.createdAt} < ${startOfMonth})::int`,
        newThisWeek: sql<number>`count(*) filter (where ${newsletterSubscribers.createdAt} >= ${startOfWeek})::int`,
        unsubscribedThisMonth: sql<number>`count(*) filter (where ${newsletterSubscribers.status} = 'UNSUBSCRIBED' and ${newsletterSubscribers.unsubscribedAt} >= ${startOfMonth})::int`,
        pending: sql<number>`count(*) filter (where ${newsletterSubscribers.status} = 'PENDING')::int`,
      })
      .from(newsletterSubscribers)

    const monthlyGrowth = newLastMonth > 0
      ? ((newThisMonth - newLastMonth) / newLastMonth * 100).toFixed(1)
      : newThisMonth > 0 ? '100.0' : '0.0'

    const activeRate = total > 0
      ? ((active / total) * 100).toFixed(1)
      : '0.0'

    const churnRate = active > 0
      ? ((unsubscribedThisMonth / (active + unsubscribedThisMonth)) * 100).toFixed(2)
      : '0.00'

    return NextResponse.json({
      totalSubscribers: total,
      activeSubscribers: active,
      newThisMonth,
      newThisWeek,
      pendingConfirmations: pending,
      unsubscribedThisMonth,
      monthlyGrowth: `${parseFloat(monthlyGrowth) >= 0 ? '+' : ''}${monthlyGrowth}%`,
      monthlyGrowthPositive: parseFloat(monthlyGrowth) >= 0,
      activeRate: `${activeRate}%`,
      churnRate: `${churnRate}%`,
    })
  } catch (error) {
    console.error('Error fetching newsletter stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch newsletter statistics' },
      { status: 500 }
    )
  }
}
